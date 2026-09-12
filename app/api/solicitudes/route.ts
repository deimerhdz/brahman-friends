import { NextRequest, NextResponse } from "next/server";
import { eq, and, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  request as requestTable,
  requestImage,
  logoAsset,
  capModel,
  modelView,
} from "@/lib/db/schema";
import { loadModelManifest } from "@/lib/catalogo/model-manifest";
import { capModelConNombre } from "@/lib/catalogo/consultas-traducidas";
import {
  buildDesignSnapshot,
  buildFixedProductSnapshot,
  type DesignSnapshot,
} from "@/lib/solicitud/snapshot";
import { canPlaceDecoration, clampSizeToZone, clampOffsetToZone } from "@/lib/design/rules";
import { generateRequestCode } from "@/lib/solicitud/codigo";
import { errors, handleApiError } from "@/lib/http/errors";
import type { Decoration } from "@/lib/design/borrador";
import { sendRequestNotifications } from "@/lib/email/enviar";
import { env } from "@/lib/config/env";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface Body {
  submissionId: string;
  design: {
    kind?: "configurable" | "fixed_product";
    modelId: string;
    colors: Record<string, string>;
    technique: string | null;
    decorations: Decoration[];
  };
  quantity: number;
  contact: { name: string; email: string; phone: string };
  comments?: string;
  privacyAccepted: boolean;
  viewImages: { view: string; url: string }[];
  locale: "es" | "en";
}

// Registra la solicitud: la operación más delicada del sistema
// (contracts/api.md). Comprueba todo antes de escribir nada.
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Body;
    const kind = body.design.kind ?? "configurable";

    // 1. ¿Ya existe una solicitud con este submissionId?
    const [existing] = await db
      .select()
      .from(requestTable)
      .where(eq(requestTable.submissionId, body.submissionId))
      .limit(1);
    if (existing) {
      return NextResponse.json(
        { code: existing.code, notificationPending: existing.notificationStatus !== "sent" },
        { status: 200 },
      );
    }

    // 4/5 (compartidas por ambos kind). La cantidad es un entero positivo.
    if (!Number.isInteger(body.quantity) || body.quantity < 1) {
      return errors.cantidadInvalida();
    }
    // Correo válido y aceptación del tratamiento de datos.
    if (
      !body.contact?.email ||
      !EMAIL_RE.test(body.contact.email) ||
      !body.contact?.name ||
      body.privacyAccepted !== true
    ) {
      return errors.datosContactoInvalidos();
    }

    if (kind === "fixed_product") {
      // Pedido de un "Producto fijo" (009-modelos-producto-fijo, FR-013,
      // FR-014): nunca se confía en lo que el cliente diga que es el tipo,
      // se verifica contra la base de datos.
      const [model] = await capModelConNombre()
        .where(eq(capModel.id, body.design.modelId))
        .limit(1);
      if (!model || model.status !== "published" || model.type !== "fixed_product") {
        return errors.modeloNoDisponible();
      }

      const views = await db
        .select()
        .from(modelView)
        .where(and(eq(modelView.modelId, model.id), eq(modelView.active, true)));
      const photos = views
        .filter((v): v is typeof v & { baseImageUrl: string } => !!v.baseImageUrl)
        .map((v) => ({ view: v.view, url: v.baseImageUrl }));

      const snapshot = buildFixedProductSnapshot(
        { id: model.id, price: model.price },
        {
          nameEs: model.nameEs,
          nameEn: model.nameEn,
          descriptionEs: model.descriptionEs,
          descriptionEn: model.descriptionEn,
        },
        photos,
      );

      return writeRequestAndRespond({
        submissionId: body.submissionId,
        modelId: model.id,
        snapshot,
        quantity: body.quantity,
        comments: body.comments,
        contact: body.contact,
      });
    }

    const manifest = await loadModelManifest(body.design.modelId);
    // 2. El modelo sigue publicado
    if (!manifest) {
      return errors.modeloNoDisponible();
    }

    // 3. Todos los colores siguen disponibles
    const unavailableComponentIds: string[] = [];
    for (const comp of manifest.components) {
      if (!comp.customizable) continue;
      const colorId = body.design.colors[comp.id];
      const color = comp.colors.find((c) => c.id === colorId);
      if (!colorId || !color) {
        unavailableComponentIds.push(comp.id);
      }
    }
    if (unavailableComponentIds.length > 0) {
      return errors.colorNoDisponible(unavailableComponentIds);
    }

    // 6. Los elementos decorativos caben, uno por zona, máximo tres
    const occupiedZones: string[] = [];
    for (const decoration of body.design.decorations) {
      const placement = canPlaceDecoration(
        occupiedZones,
        decoration.zone,
        env.maxDecoratedZones,
      );
      const zone = manifest.zones.find((z) => z.position === decoration.zone);
      if (!placement.allowed || !zone) {
        return errors.decoracionInvalida({ zone: decoration.zone });
      }
      const size = { widthCm: decoration.widthCm, heightCm: decoration.heightCm };
      const offset = { offsetXPct: decoration.offsetXPct, offsetYPct: decoration.offsetYPct };
      const clampedSize = clampSizeToZone(size, zone);
      const clampedOffset = clampOffsetToZone(offset, size, zone);
      if (
        Math.abs(clampedSize.widthCm - decoration.widthCm) > 0.01 ||
        Math.abs(clampedSize.heightCm - decoration.heightCm) > 0.01 ||
        Math.abs(clampedOffset.offsetXPct - decoration.offsetXPct) > 0.01 ||
        Math.abs(clampedOffset.offsetYPct - decoration.offsetYPct) > 0.01
      ) {
        return errors.decoracionInvalida({ zone: decoration.zone });
      }
      occupiedZones.push(decoration.zone);
    }

    // Todo pasó: en una sola transacción se genera el código, se congela el
    // diseño y se escriben request, request_image y se asocia el logo_asset
    // (FR-052, FR-054, RN4, RN19).
    const logoIds = body.design.decorations
      .filter((d): d is Extract<Decoration, { kind: "logo" }> => d.kind === "logo")
      .map((d) => d.logoAssetId);
    const logoRows = logoIds.length
      ? await db.select().from(logoAsset).where(inArray(logoAsset.id, logoIds))
      : [];
    const logoAssets = Object.fromEntries(
      logoRows.map((l) => [l.id, { originalFilename: l.originalFilename, mime: l.mime }]),
    );

    const snapshot = buildDesignSnapshot(
      manifest,
      {
        version: 1,
        modelId: body.design.modelId,
        submissionId: body.submissionId,
        colors: body.design.colors,
        technique: body.design.technique,
        decorations: body.design.decorations,
        updatedAt: new Date().toISOString(),
      },
      logoAssets,
    );

    return writeRequestAndRespond({
      submissionId: body.submissionId,
      modelId: body.design.modelId,
      snapshot,
      quantity: body.quantity,
      comments: body.comments,
      contact: body.contact,
      viewImages: body.viewImages,
      logoIds,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Escritura común a ambos `kind` de pedido: generar código único, escribir
 * `request`/`request_image`/asociar `logo_asset` en un batch atómico (con
 * reintento si el código choca) y disparar la notificación por correo sin
 * bloquear la respuesta. Compartido para no duplicar esta lógica entre el
 * pedido de un modelo configurable y el de un producto fijo.
 */
async function writeRequestAndRespond(input: {
  submissionId: string;
  modelId: string;
  snapshot: DesignSnapshot;
  quantity: number;
  comments?: string;
  contact: { name: string; email: string; phone: string };
  viewImages?: { view: string; url: string }[];
  logoIds?: string[];
}) {
  const viewImages = input.viewImages ?? [];
  const logoIds = input.logoIds ?? [];

  // El driver HTTP de Neon no soporta transacciones interactivas (no hay
  // `BEGIN`/`COMMIT` de varias idas y vueltas), así que el id se genera acá
  // mismo para poder armar todas las escrituras de antemano y enviarlas
  // como un único `batch` atómico. Si el código choca (poco probable, no
  // imposible), se reintenta el lote completo con un código nuevo.
  let created: typeof requestTable.$inferSelect | undefined;
  let lastError: unknown;

  for (let attempt = 0; attempt < 5 && !created; attempt++) {
    const code = generateRequestCode();
    const requestId = crypto.randomUUID();

    try {
      const [[insertedRequest]] = await db.batch([
        db
          .insert(requestTable)
          .values({
            id: requestId,
            code,
            submissionId: input.submissionId,
            modelId: input.modelId,
            designSnapshot: input.snapshot,
            quantity: input.quantity,
            comments: input.comments ?? null,
            contactName: input.contact.name,
            contactEmail: input.contact.email,
            contactPhone: input.contact.phone ?? null,
            privacyAcceptedAt: new Date(),
            notificationStatus: "pending",
          })
          .returning(),
        ...(viewImages.length > 0
          ? [
              db.insert(requestImage).values(
                viewImages.map((img) => ({
                  requestId,
                  view: img.view as "front" | "side" | "side_mirrored" | "back",
                  imageUrl: img.url,
                })),
              ),
            ]
          : []),
        ...(logoIds.length > 0
          ? [
              db
                .update(logoAsset)
                .set({ requestId })
                .where(inArray(logoAsset.id, logoIds)),
            ]
          : []),
      ]);
      created = insertedRequest;
    } catch (error) {
      lastError = error;
      const message = error instanceof Error ? error.message : "";
      if (!message.toLowerCase().includes("unique")) throw error;
    }
  }

  if (!created) {
    throw lastError instanceof Error
      ? lastError
      : new Error("No se pudo generar un código único");
  }

  const response = NextResponse.json(
    { code: created.code, notificationPending: true },
    { status: 201 },
  );

  // El correo se envía después de responder; su resultado no afecta esta
  // respuesta (FR-056a, RN20a).
  sendRequestNotifications(created.id).catch((error) => {
    console.error("Error enviando notificación de solicitud", error);
  });

  return response;
}
