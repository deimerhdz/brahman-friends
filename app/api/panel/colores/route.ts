import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { color, colorTranslation } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";
import { errors, handleApiError } from "@/lib/http/errors";
import { isMaterial } from "@/lib/catalogo/materiales";
import { validarNombreTraducido } from "@/lib/catalogo/traduccion";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return errors.noAutorizado();

  try {
    const body = await request.json();
    const name = validarNombreTraducido(body.name);
    if (
      !name ||
      typeof body.supplierRef !== "string" ||
      !body.supplierRef ||
      typeof body.material !== "string" ||
      !isMaterial(body.material) ||
      typeof body.sampleImageUrl !== "string" ||
      !body.sampleImageUrl
    ) {
      return NextResponse.json({ error: "datos_invalidos" }, { status: 400 });
    }

    const [created] = await db
      .insert(color)
      .values({
        supplierRef: body.supplierRef,
        material: body.material,
        sampleImageUrl: body.sampleImageUrl,
        status: body.status ?? "available",
      })
      .returning();

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
