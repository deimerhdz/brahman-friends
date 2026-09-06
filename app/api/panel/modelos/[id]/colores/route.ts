import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { color, colorTranslation } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";
import { errors, handleApiError } from "@/lib/http/errors";
import { validarNombreTraducido } from "@/lib/catalogo/traduccion";

// Alta de colores (007-colores-por-modelo FR-001, FR-002, FR-003): un color
// se crea siempre dentro de un modelo, nunca suelto. Reemplaza al
// `POST /api/panel/colores` que existía cuando el catálogo era compartido.
// Solo nombre: sin referencia de proveedor, material, estado ni imagen de
// muestra (decisión del usuario tras el primer recorrido del formulario).
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return errors.noAutorizado();

  try {
    const { id: modelId } = await params;
    const body = await request.json();
    const name = validarNombreTraducido(body.name);
    if (!name) {
      return NextResponse.json({ error: "datos_invalidos" }, { status: 400 });
    }

    const [created] = await db.insert(color).values({ modelId }).returning();

    await db.insert(colorTranslation).values([
      { colorId: created.id, locale: "es", name: name.es },
      { colorId: created.id, locale: "en", name: name.en },
    ]);

    return NextResponse.json(
      { ...created, nameEs: name.es, nameEn: name.en },
      { status: 201 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
