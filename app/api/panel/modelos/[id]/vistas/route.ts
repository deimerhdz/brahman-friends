import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { capModel, modelView } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";
import { errors, handleApiError, apiError } from "@/lib/http/errors";
import { deletePublicFile } from "@/lib/media/storage";

const VIEWS = ["front", "left", "right", "back"] as const;

// Activa o desactiva una vista y, opcionalmente, fija su imagen base
// (FR-006, FR-008). `front` nunca puede desactivarse. Desactivar una vista
// NO borra su imagen ni el archivo en R2: solo la oculta del catálogo, para
// poder reactivarla sin volver a subir la foto.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return errors.noAutorizado();

  try {
    const { id: modelId } = await params;
    const body = await request.json();
    const view = body.view;
    const active = Boolean(body.active);

    if (!VIEWS.includes(view)) {
      return NextResponse.json({ error: "vista_invalida" }, { status: 400 });
    }
    if (view === "front" && !active) {
      return apiError(400, "front_no_desactivable");
    }

    if (!active) {
      const [existingRow] = await db
        .select()
        .from(modelView)
        .where(and(eq(modelView.modelId, modelId), eq(modelView.view, view)))
        .limit(1);
      const [updated] = existingRow
        ? await db
            .update(modelView)
            .set({ active: false })
            .where(and(eq(modelView.modelId, modelId), eq(modelView.view, view)))
            .returning()
        : await db
            .insert(modelView)
            .values({ modelId, view, active: false })
            .returning();
      return NextResponse.json(updated);
    }

    const baseImageUrl: string | undefined = body.baseImageUrl;

    if (baseImageUrl && body.width && body.height) {
      const [model] = await db
        .select()
        .from(capModel)
        .where(eq(capModel.id, modelId))
        .limit(1);
      if (!model) {
        return NextResponse.json({ error: "no_encontrado" }, { status: 404 });
      }
      if (!model.imageWidth || !model.imageHeight) {
        await db
          .update(capModel)
          .set({ imageWidth: body.width, imageHeight: body.height })
          .where(eq(capModel.id, modelId));
      }
    }

    const [existing] = await db
      .select()
      .from(modelView)
      .where(and(eq(modelView.modelId, modelId), eq(modelView.view, view)))
      .limit(1);

    if (existing) {
      const [updated] = await db
        .update(modelView)
        .set({ baseImageUrl: baseImageUrl ?? existing.baseImageUrl, active: true })
        .where(and(eq(modelView.modelId, modelId), eq(modelView.view, view)))
        .returning();
      if (
        baseImageUrl &&
        existing.baseImageUrl &&
        existing.baseImageUrl !== baseImageUrl
      ) {
        // Actualiza primero y borra después (en vez de al revés) para poder
        // chequear si el archivo viejo sigue en uso por OTRA fila: dos
        // modelos, o "left"/"right" de un backfill (ver
        // scripts/migrar-vista-lateral-izq-der.ts), pueden compartir el mismo
        // archivo mientras se sube la foto real de cada uno.
        const [stillUsed] = await db
          .select({ modelId: modelView.modelId })
          .from(modelView)
          .where(eq(modelView.baseImageUrl, existing.baseImageUrl))
          .limit(1);
        if (!stillUsed) {
          await deletePublicFile(existing.baseImageUrl).catch(() => {});
        }
      }
      return NextResponse.json(updated);
    }

    const [created] = await db
      .insert(modelView)
      .values({ modelId, view, baseImageUrl: baseImageUrl ?? null, active: true })
      .returning();
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
