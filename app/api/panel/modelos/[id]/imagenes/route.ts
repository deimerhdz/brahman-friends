import { NextRequest, NextResponse } from "next/server";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { capModel, componentImage } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";
import { errors, handleApiError } from "@/lib/http/errors";
import { deletePublicFile } from "@/lib/media/storage";

interface IncomingImage {
  componentId: string;
  colorId: string;
  view: "front" | "side" | "back";
  url: string;
  width: number;
  height: number;
}

// Registro por lotes de la carga masiva (FR-009, FR-010).
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

    if (!model.imageWidth || !model.imageHeight) {
      await db
        .update(capModel)
        .set({ imageWidth: images[0].width, imageHeight: images[0].height })
        .where(eq(capModel.id, modelId));
    }

    const existing = await db
      .select({
        componentId: componentImage.componentId,
        colorId: componentImage.colorId,
        view: componentImage.view,
        imageUrl: componentImage.imageUrl,
      })
      .from(componentImage)
      .where(eq(componentImage.modelId, modelId));
    const existingByKey = new Map(
      existing.map((e) => [
        `${e.componentId}:${e.colorId}:${e.view}`,
        e.imageUrl,
      ]),
    );

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

    const oldUrlsToDelete = images.flatMap((img) => {
      const oldUrl = existingByKey.get(
        `${img.componentId}:${img.colorId}:${img.view}`,
      );
      return oldUrl && oldUrl !== img.url ? [oldUrl] : [];
    });
    await Promise.all(
      oldUrlsToDelete.map((url) => deletePublicFile(url).catch(() => {})),
    );

    return NextResponse.json({ inserted: inserted.length }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

// Borra una imagen de componente puntual (componente + color + vista),
// dejándola de nuevo como "falta". Borra también el archivo en R2 para no
// dejarlo huérfano.
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return errors.noAutorizado();

  try {
    const { id: modelId } = await params;
    const componentId = request.nextUrl.searchParams.get("componentId");
    const colorId = request.nextUrl.searchParams.get("colorId");
    const view = request.nextUrl.searchParams.get("view");
    if (!componentId || !colorId || !view) {
      return NextResponse.json({ error: "datos_invalidos" }, { status: 400 });
    }

    const [deleted] = await db
      .delete(componentImage)
      .where(
        and(
          eq(componentImage.modelId, modelId),
          eq(componentImage.componentId, componentId),
          eq(componentImage.colorId, colorId),
          eq(componentImage.view, view as "front" | "side" | "back"),
        ),
      )
      .returning({ imageUrl: componentImage.imageUrl });

    if (!deleted) {
      return NextResponse.json({ error: "no_encontrado" }, { status: 404 });
    }

    await deletePublicFile(deleted.imageUrl).catch(() => {});

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleApiError(error);
  }
}
