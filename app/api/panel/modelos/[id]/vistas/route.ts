import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { capModel, modelView } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";
import { errors, handleApiError, apiError } from "@/lib/http/errors";
import { dimensionsMatch } from "@/lib/media/dimensiones";

const VIEWS = ["front", "side", "back"] as const;

// Activa o desactiva una vista y, opcionalmente, fija su imagen base
// (FR-006, FR-008). `front` nunca puede desactivarse.
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
      await db
        .delete(modelView)
        .where(and(eq(modelView.modelId, modelId), eq(modelView.view, view)));
      return new NextResponse(null, { status: 204 });
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
      const expected =
        model.imageWidth && model.imageHeight
          ? { width: model.imageWidth, height: model.imageHeight }
          : null;
      if (expected && !dimensionsMatch(expected, { width: body.width, height: body.height })) {
        return apiError(422, "dimensiones_no_coinciden", { expected });
      }
      if (!expected) {
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
        .set({ baseImageUrl: baseImageUrl ?? existing.baseImageUrl })
        .where(and(eq(modelView.modelId, modelId), eq(modelView.view, view)))
        .returning();
      return NextResponse.json(updated);
    }

    const [created] = await db
      .insert(modelView)
      .values({ modelId, view, baseImageUrl: baseImageUrl ?? null })
      .returning();
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
