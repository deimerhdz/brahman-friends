import { NextRequest, NextResponse } from "next/server";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { capModel, color, colorImage } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";
import { errors, handleApiError } from "@/lib/http/errors";
import { deletePublicFile } from "@/lib/media/storage";

// Borra el archivo en R2 solo si ninguna otra fila de `color_image` todavía
// lo referencia. Necesario porque scripts de backfill (p. ej.
// scripts/migrar-vista-lateral-izq-der.ts) pueden dejar dos filas apuntando
// al mismo archivo mientras se sube la foto real de cada una: sin este
// chequeo, reemplazar una borra el archivo que la otra todavía necesita.
async function deleteIfUnused(imageUrl: string): Promise<void> {
  const [stillUsed] = await db
    .select({ id: colorImage.id })
    .from(colorImage)
    .where(eq(colorImage.imageUrl, imageUrl))
    .limit(1);
  if (!stillUsed) {
    await deletePublicFile(imageUrl).catch(() => {});
  }
}

// Sube (o reemplaza) la foto de un color para una vista puntual (FR-009,
// FR-010): la gorra entera en ese color, no una pieza suelta.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return errors.noAutorizado();

  try {
    const { id: colorId } = await params;
    const body = await request.json();
    const { view, url, width, height } = body as {
      view: "front" | "left" | "right" | "back";
      url: string;
      width: number;
      height: number;
    };
    if (!view || !url || !Number.isFinite(width) || !Number.isFinite(height)) {
      return NextResponse.json({ error: "datos_invalidos" }, { status: 400 });
    }

    const [existingColor] = await db
      .select({ modelId: color.modelId })
      .from(color)
      .where(eq(color.id, colorId))
      .limit(1);
    if (!existingColor) {
      return NextResponse.json({ error: "no_encontrado" }, { status: 404 });
    }

    const [model] = await db
      .select({ imageWidth: capModel.imageWidth, imageHeight: capModel.imageHeight })
      .from(capModel)
      .where(eq(capModel.id, existingColor.modelId))
      .limit(1);
    if (model && (!model.imageWidth || !model.imageHeight)) {
      await db
        .update(capModel)
        .set({ imageWidth: width, imageHeight: height })
        .where(eq(capModel.id, existingColor.modelId));
    }

    const [previous] = await db
      .select({ imageUrl: colorImage.imageUrl })
      .from(colorImage)
      .where(and(eq(colorImage.colorId, colorId), eq(colorImage.view, view)))
      .limit(1);

    const [inserted] = await db
      .insert(colorImage)
      .values({ modelId: existingColor.modelId, colorId, view, imageUrl: url, width, height })
      .onConflictDoUpdate({
        target: [colorImage.colorId, colorImage.view],
        set: {
          imageUrl: sql`excluded.image_url`,
          width: sql`excluded.width`,
          height: sql`excluded.height`,
        },
      })
      .returning();

    if (previous && previous.imageUrl !== url) {
      await deleteIfUnused(previous.imageUrl);
    }

    return NextResponse.json(inserted, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

// Borra la foto de un color para una vista puntual, dejándola de nuevo como
// "falta". Borra también el archivo en R2 para no dejarlo huérfano.
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return errors.noAutorizado();

  try {
    const { id: colorId } = await params;
    const view = request.nextUrl.searchParams.get("view");
    if (!view) {
      return NextResponse.json({ error: "datos_invalidos" }, { status: 400 });
    }

    const [deleted] = await db
      .delete(colorImage)
      .where(
        and(
          eq(colorImage.colorId, colorId),
          eq(colorImage.view, view as "front" | "left" | "right" | "back"),
        ),
      )
      .returning({ imageUrl: colorImage.imageUrl });

    if (!deleted) {
      return NextResponse.json({ error: "no_encontrado" }, { status: 404 });
    }

    await deleteIfUnused(deleted.imageUrl);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleApiError(error);
  }
}
