import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { color, colorTranslation } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";
import { errors, apiError, handleApiError } from "@/lib/http/errors";
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

    // El único campo editable de un color es su nombre, y ese vive en
    // `color_translation`, no en `color` (FR-011): esta ruta solo confirma
    // que el color existe antes de tocar la traducción.
    let name: { es: string; en: string } | null = null;
    if (body.name !== undefined) {
      name = validarNombreTraducido(body.name);
      if (!name) {
        return errors.datosInvalidos();
      }
    }

    const [updated] = await db
      .select()
      .from(color)
      .where(eq(color.id, id))
      .limit(1);

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

// Un color habilitado en algún componente no se puede borrar (RN8): la base
// de datos lo impide con claves foráneas; aquí se traduce ese fallo a un
// error claro. Hay que quitarlo de todas las vistas/componentes primero.
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
