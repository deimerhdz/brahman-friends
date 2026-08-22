import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  capModel,
  modelView,
  component,
  componentColor,
  color,
  componentImage,
} from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";
import { errors, handleApiError, apiError } from "@/lib/http/errors";
import { checkPublicacion, canPublish } from "@/lib/catalogo/publicacion";

async function loadPublicacionInput(modelId: string) {
  const [views, components, links, colors, images] = await Promise.all([
    db.select().from(modelView).where(eq(modelView.modelId, modelId)),
    db.select().from(component).where(eq(component.modelId, modelId)),
    db.select().from(componentColor),
    db.select().from(color),
    db.select().from(componentImage).where(eq(componentImage.modelId, modelId)),
  ]);

  const componentIds = new Set(components.map((c) => c.id));

  return {
    activeViews: views.map((v) => v.view),
    viewsWithBaseImage: views.filter((v) => v.baseImageUrl).map((v) => v.view),
    components: components.map((c) => ({
      id: c.id,
      nameEs: c.nameEs,
      nameEn: c.nameEn,
      material: c.material,
      customizable: c.customizable,
      defaultColorId: c.defaultColorId,
    })),
    componentColors: links.filter((l) => componentIds.has(l.componentId)),
    colors: colors.map((c) => ({
      id: c.id,
      nameEs: c.nameEs,
      nameEn: c.nameEn,
      status: c.status,
    })),
    images: images.map((i) => ({
      componentId: i.componentId,
      colorId: i.colorId,
      view: i.view,
    })),
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

    const result = checkPublicacion(await loadPublicacionInput(id));
    if (!canPublish(result)) {
      return errors.publicacionIncompleta(result);
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
