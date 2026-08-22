import { NextRequest, NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { capModel, componentImage } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";
import { errors, apiError, handleApiError } from "@/lib/http/errors";
import { findMismatched } from "@/lib/media/dimensiones";

interface IncomingImage {
  componentId: string;
  colorId: string;
  view: "front" | "side" | "back";
  url: string;
  width: number;
  height: number;
}

// Registro por lotes de la carga masiva (FR-009, FR-010). Se rechaza el lote
// entero si alguna dimensión no coincide, indicando cuáles (FR-011, SC-024) —
// así el administrador nunca queda con un modelo a medio cargar sin saberlo.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return errors.noAutorizado();

  try {
    const { id: modelId } = await params;
    const body = (await request.json()) as { images: IncomingImage[] };
    const images = body.images ?? [];
    if (images.length === 0) {
      return NextResponse.json({ error: "datos_invalidos" }, { status: 400 });
    }

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
    const { expected: base, mismatched } = findMismatched(images, expected);

    if (mismatched.length > 0) {
      return apiError(422, "dimensiones_no_coinciden", {
        expected: base,
        mismatched: mismatched.map((m) => ({
          componentId: m.componentId,
          colorId: m.colorId,
          view: m.view,
          width: m.width,
          height: m.height,
        })),
      });
    }

    if (!expected && base) {
      await db
        .update(capModel)
        .set({ imageWidth: base.width, imageHeight: base.height })
        .where(eq(capModel.id, modelId));
    }

    const inserted = await db
      .insert(componentImage)
      .values(
        images.map((img) => ({
          modelId,
          componentId: img.componentId,
          colorId: img.colorId,
          view: img.view,
          imageUrl: img.url,
          width: img.width,
          height: img.height,
        })),
      )
      .onConflictDoUpdate({
        target: [
          componentImage.componentId,
          componentImage.colorId,
          componentImage.view,
        ],
        set: {
          imageUrl: sql`excluded.image_url`,
          width: sql`excluded.width`,
          height: sql`excluded.height`,
          modelId: sql`excluded.model_id`,
        },
      })
      .returning();

    return NextResponse.json({ inserted: inserted.length }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
