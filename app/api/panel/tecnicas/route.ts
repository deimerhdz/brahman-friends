import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { technique, techniqueTranslation } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";
import { errors, handleApiError } from "@/lib/http/errors";
import { validarNombreTraducido } from "@/lib/catalogo/traduccion";

// Alta de técnicas de decoración (FR-036). Lista global; su asociación a un
// modelo concreto vive en `model_technique`.
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return errors.noAutorizado();

  try {
    const body = await request.json();
    const name = validarNombreTraducido(body.name);
    if (!name) {
      return NextResponse.json({ error: "datos_invalidos" }, { status: 400 });
    }
    const renderStyle = body.renderStyle === "embroidery" ? "embroidery" : "flat";

    const [created] = await db
      .insert(technique)
      .values({ renderStyle })
      .returning();

    await db.insert(techniqueTranslation).values([
      { techniqueId: created.id, locale: "es", name: name.es },
      { techniqueId: created.id, locale: "en", name: name.en },
    ]);

    return NextResponse.json(
      { ...created, nameEs: name.es, nameEn: name.en },
      { status: 201 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
