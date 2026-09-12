import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  component,
  componentColor,
  color,
  componentImage,
  modelView,
} from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";
import { errors, apiError, handleApiError } from "@/lib/http/errors";
import { deletePublicFile } from "@/lib/media/storage";

const VIEWS = ["front", "side", "back"] as const;

// Habilita un color en un componente para una vista puntual (FR-019,
// SC-004): el color debe pertenecer al mismo modelo que el componente
// (007-colores-por-modelo FR-002), y la vista debe estar activa en el
// modelo, o se rechaza.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return errors.noAutorizado();

  try {
    const { id: componentId } = await params;
    const body = await request.json();
    const colorId = body.colorId;
    if (
      typeof colorId !== "string" ||
      !colorId ||
      typeof body.view !== "string" ||
      !VIEWS.includes(body.view as (typeof VIEWS)[number])
    ) {
      return NextResponse.json({ error: "datos_invalidos" }, { status: 400 });
    }
    const view = body.view as (typeof VIEWS)[number];

    const [comp] = await db
      .select()
      .from(component)
      .where(eq(component.id, componentId))
      .limit(1);
    const [col] = await db
      .select()
      .from(color)
      .where(eq(color.id, colorId))
      .limit(1);

    if (!comp || !col) {
      return NextResponse.json({ error: "no_encontrado" }, { status: 404 });
    }
    if (col.modelId !== comp.modelId) {
      return apiError(422, "modelo_no_coincide");
    }

    const [activeView] = await db
      .select()
      .from(modelView)
      .where(
        and(
          eq(modelView.modelId, comp.modelId),
          eq(modelView.view, view),
          eq(modelView.active, true),
        ),
      )
      .limit(1);
    if (!activeView) {
      return apiError(422, "vista_no_activa");
    }

    await db
      .insert(componentColor)
      .values({ componentId, colorId, view })
      .onConflictDoNothing();

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleApiError(error);
  }
}

// Deshabilita un color en un componente: con `view`, solo esa vista puntual
// (y su imagen, si existe); sin `view`, la variante completa (todas sus
// vistas). Borra también las imágenes ya cargadas y sus archivos en R2 — si
// no, quedan huérfanas: ya no se ven en ningún lado pero siguen ocupando
// lugar.
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return errors.noAutorizado();

  try {
    const { id: componentId } = await params;
    const colorId = request.nextUrl.searchParams.get("colorId");
    const rawView = request.nextUrl.searchParams.get("view");
    if (!colorId) {
      return NextResponse.json({ error: "datos_invalidos" }, { status: 400 });
    }
    if (
      rawView !== null &&
      !VIEWS.includes(rawView as (typeof VIEWS)[number])
    ) {
      return NextResponse.json({ error: "datos_invalidos" }, { status: 400 });
    }
    const view = rawView as (typeof VIEWS)[number] | null;

    const pairCondition = and(
      eq(componentImage.componentId, componentId),
      eq(componentImage.colorId, colorId),
    );
    const images = await db
      .delete(componentImage)
      .where(
        view
          ? and(pairCondition, eq(componentImage.view, view))
          : pairCondition,
      )
      .returning({ imageUrl: componentImage.imageUrl });

    const colorViewCondition = and(
      eq(componentColor.componentId, componentId),
      eq(componentColor.colorId, colorId),
    );
    await db
      .delete(componentColor)
      .where(
        view
          ? and(colorViewCondition, eq(componentColor.view, view))
          : colorViewCondition,
      );

    await Promise.all(
      images.map((img) => deletePublicFile(img.imageUrl).catch(() => {})),
    );

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleApiError(error);
  }
}
