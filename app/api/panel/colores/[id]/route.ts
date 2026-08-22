import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { color, colorTranslation } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";
import { errors, apiError, handleApiError } from "@/lib/http/errors";
import { isMaterial } from "@/lib/catalogo/materiales";
import { validarNombreTraducido } from "@/lib/catalogo/traduccion";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return errors.noAutorizado();

  try {
    const { id } = await params;
    const body = await request.json();
    const patch: Partial<typeof color.$inferInsert> = {};

    // `name` es opcional en el PATCH, igual que el resto de los campos: se
    // puede seguir editando solo la disponibilidad sin tocar el nombre. Si
    // se envía, debe traer ambos idiomas (FR-011).
    let name: { es: string; en: string } | null = null;
    if (body.name !== undefined) {
      name = validarNombreTraducido(body.name);
      if (!name) {
        return errors.datosInvalidos();
      }
    }

    if (body.supplierRef !== undefined) patch.supplierRef = body.supplierRef;
    if (body.sampleImageUrl !== undefined)
      patch.sampleImageUrl = body.sampleImageUrl;
    if (body.material !== undefined) {
      if (!isMaterial(body.material)) {
        return NextResponse.json({ error: "datos_invalidos" }, { status: 400 });
      }
      patch.material = body.material;
    }
    if (body.status !== undefined) patch.status = body.status;

    // `name` vive en `color_translation`, no en `color`: si es el único
    // campo enviado, `patch` queda vacío y no hay nada que actualizar en
    // esta tabla (Drizzle rechaza un `.set({})` vacío).
    const [updated] =
      Object.keys(patch).length > 0
        ? await db.update(color).set(patch).where(eq(color.id, id)).returning()
        : await db.select().from(color).where(eq(color.id, id)).limit(1);

    if (!updated) {
      return NextResponse.json({ error: "no_encontrado" }, { status: 404 });
    }

    if (name) {
      await Promise.all([
        db
          .update(colorTranslation)
          .set({ name: name.es })
          .where(and(eq(colorTranslation.colorId, id), eq(colorTranslation.locale, "es"))),
        db
          .update(colorTranslation)
          .set({ name: name.en })
          .where(and(eq(colorTranslation.colorId, id), eq(colorTranslation.locale, "en"))),
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

// Un color usado no se borra, se descontinúa (FR-023, RN8). La base de datos
// lo impide con claves foráneas; aquí se traduce ese fallo a un error claro.
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return errors.noAutorizado();

  try {
    const { id } = await params;
    const [deleted] = await db
      .delete(color)
      .where(eq(color.id, id))
      .returning({ id: color.id });

    if (!deleted) {
      return NextResponse.json({ error: "no_encontrado" }, { status: 404 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("foreign key") || message.includes("violates")) {
      return apiError(409, "color_en_uso");
    }
    return handleApiError(error);
  }
}
