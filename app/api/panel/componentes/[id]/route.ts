import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  component,
  componentTranslation,
  componentImage,
} from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";
import { errors, handleApiError } from "@/lib/http/errors";
import { isMaterial } from "@/lib/catalogo/materiales";
import { validarNombreTraducido } from "@/lib/catalogo/traduccion";
import { deletePublicFile } from "@/lib/media/storage";

// Edita un componente: nombre, material, personalizable, orden de capa y/o
// color por defecto (RN9). Todos los campos son opcionales en el PATCH.
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return errors.noAutorizado();

  try {
    const { id } = await params;
    const body = await request.json();
    const patch: Partial<typeof component.$inferInsert> = {};

    let name: { es: string; en: string } | null = null;
    if (body.name !== undefined) {
      name = validarNombreTraducido(body.name);
      if (!name) {
        return errors.datosInvalidos();
      }
    }

    if (body.material !== undefined) {
      if (!isMaterial(body.material)) {
        return NextResponse.json({ error: "datos_invalidos" }, { status: 400 });
      }
      patch.material = body.material;
    }
    if (body.customizable !== undefined) patch.customizable = body.customizable;
    if (body.defaultColorId !== undefined)
      patch.defaultColorId = body.defaultColorId;
    if (body.layerOrder !== undefined) patch.layerOrder = body.layerOrder;

    const [updated] =
      Object.keys(patch).length > 0
        ? await db
            .update(component)
            .set(patch)
            .where(eq(component.id, id))
            .returning()
        : await db
            .select()
            .from(component)
            .where(eq(component.id, id))
            .limit(1);

    if (!updated) {
      return NextResponse.json({ error: "no_encontrado" }, { status: 404 });
    }

    if (name) {
      await Promise.all([
        db
          .update(componentTranslation)
          .set({ name: name.es })
          .where(
            and(
              eq(componentTranslation.componentId, id),
              eq(componentTranslation.locale, "es"),
            ),
          ),
        db
          .update(componentTranslation)
          .set({ name: name.en })
          .where(
            and(
              eq(componentTranslation.componentId, id),
              eq(componentTranslation.locale, "en"),
            ),
          ),
      ]);
    }

    return NextResponse.json({
      ...updated,
      ...(name ? { nameEs: name.es, nameEn: name.en } : {}),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// Borra un componente y en cascada sus traducciones, imágenes y colores
// habilitados (FK con onDelete: cascade). Las imágenes viven en R2, no en
// la base de datos, así que hay que borrarlas aparte para no dejarlas
// huérfanas en el bucket.
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return errors.noAutorizado();

  try {
    const { id } = await params;
    const images = await db
      .select({ imageUrl: componentImage.imageUrl })
      .from(componentImage)
      .where(eq(componentImage.componentId, id));

    const [deleted] = await db
      .delete(component)
      .where(eq(component.id, id))
      .returning({ id: component.id });

    if (!deleted) {
      return NextResponse.json({ error: "no_encontrado" }, { status: 404 });
    }

    await Promise.all(
      images.map((img) => deletePublicFile(img.imageUrl).catch(() => {})),
    );

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleApiError(error);
  }
}
