import { NextRequest, NextResponse } from "next/server";
import { eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  request as requestTable,
  requestImage,
  logoAsset,
} from "@/lib/db/schema";
import { loadModelManifest } from "@/lib/catalogo/model-manifest";
import { buildDesignSnapshot } from "@/lib/solicitud/snapshot";
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

    // 4. La cantidad es un entero positivo
    if (!Number.isInteger(body.quantity) || body.quantity < 1) {
      return errors.cantidadInvalida();
    }

    // 5. Correo válido y aceptación del tratamiento de datos
    if (
      !body.contact?.email ||
      !EMAIL_RE.test(body.contact.email) ||
      !body.contact?.name ||
      body.privacyAccepted !== true
    ) {
      return errors.datosContactoInvalidos();
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
              submissionId: body.submissionId,
              modelId: body.design.modelId,
              designSnapshot: snapshot,
              quantity: body.quantity,
              comments: body.comments ?? null,
              contactName: body.contact.name,
              contactEmail: body.contact.email,
              contactPhone: body.contact.phone ?? null,
              privacyAcceptedAt: new Date(),
              notificationStatus: "pending",
            })
            .returning(),
          ...(body.viewImages.length > 0
            ? [
                db.insert(requestImage).values(
                  body.viewImages.map((img) => ({
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
  } catch (error) {
    return handleApiError(error);
  }
}
