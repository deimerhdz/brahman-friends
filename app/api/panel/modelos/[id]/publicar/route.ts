import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { capModel, color, modelView, colorImage } from "@/lib/db/schema";
import { colorConNombre } from "@/lib/catalogo/consultas-traducidas";
import { getSession } from "@/lib/auth/session";
import { errors, handleApiError, apiError } from "@/lib/http/errors";
import {
  checkPublicacion,
  canPublish,
  checkPublicacionProductoFijo,
  canPublishProductoFijo,
  type View,
} from "@/lib/catalogo/publicacion";

// "side" es un valor histórico del enum `view`, ya migrado a left/right (ver
// scripts/migrar-vista-lateral-izq-der.ts): no debería quedar ninguna fila
// así, pero el tipo de la columna todavía lo permite (Postgres no puede
// borrar un valor de un enum sin recrear el tipo).
function isRealView<T extends { view: string }>(
  row: T,
): row is T & { view: View } {
  return row.view !== "side";
}

async function loadPublicacionInput(modelId: string) {
  const [viewsRaw, colors, imagesRaw] = await Promise.all([
    db
      .select()
      .from(modelView)
      .where(and(eq(modelView.modelId, modelId), eq(modelView.active, true))),
    colorConNombre().where(eq(color.modelId, modelId)),
    db.select().from(colorImage).where(eq(colorImage.modelId, modelId)),
  ]);
  const views = viewsRaw.filter(isRealView);
  const images = imagesRaw.filter(isRealView);

  return {
    activeViews: views.map((v) => v.view),
    viewsWithBaseImage: views.filter((v) => v.baseImageUrl).map((v) => v.view),
    colors: colors.map((c) => ({
      id: c.id,
      nameEs: c.nameEs,
      nameEn: c.nameEn,
    })),
    colorImages: images.map((i) => ({ colorId: i.colorId, view: i.view })),
  };
}

// FR-012, FR-013, SC-023: publica solo si nada falta; devuelve exactamente
// qué falta si no.
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return errors.noAutorizado();

  try {
    const { id } = await params;
    const [model] = await db.select().from(capModel).where(eq(capModel.id, id)).limit(1);
    if (!model) {
      return NextResponse.json({ error: "no_encontrado" }, { status: 404 });
    }

    if (model.type === "fixed_product") {
      const views = await db
        .select()
        .from(modelView)
        .where(and(eq(modelView.modelId, id), eq(modelView.active, true)));
      const result = checkPublicacionProductoFijo({
        price: model.price,
        viewsWithBaseImage: views
          .filter(isRealView)
          .filter((v) => v.baseImageUrl)
          .map((v) => v.view),
      });
      if (!canPublishProductoFijo(result)) {
        return errors.publicacionIncompletaProductoFijo(result);
      }
    } else {
      const result = checkPublicacion(await loadPublicacionInput(id));
      if (!canPublish(result)) {
        return errors.publicacionIncompleta(result);
      }
    }

    const [updated] = await db
      .update(capModel)
      .set({ status: "published", publishedAt: new Date() })
      .where(eq(capModel.id, id))
      .returning();

    return NextResponse.json(updated);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return errors.noAutorizado();

  try {
    const { id } = await params;
    const [updated] = await db
      .update(capModel)
      .set({ status: "draft", publishedAt: null })
      .where(eq(capModel.id, id))
      .returning();

    if (!updated) {
      return apiError(404, "no_encontrado");
    }
    return NextResponse.json(updated);
  } catch (error) {
    return handleApiError(error);
  }
}
