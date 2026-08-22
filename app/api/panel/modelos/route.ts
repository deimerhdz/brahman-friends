import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { capModel, capModelTranslation } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";
import { errors, handleApiError } from "@/lib/http/errors";
import { validarNombreTraducido } from "@/lib/catalogo/traduccion";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return errors.noAutorizado();

  try {
    const body = await request.json();
    const name = validarNombreTraducido(body.name);
    if (typeof body.code !== "string" || !body.code || !name) {
      return errors.datosInvalidos();
    }
    const descriptionEs =
      typeof body.description?.es === "string" ? body.description.es.trim() : "";
    const descriptionEn =
      typeof body.description?.en === "string" ? body.description.en.trim() : "";

    const [created] = await db
      .insert(capModel)
      .values({ code: body.code })
      .returning();

    await db.insert(capModelTranslation).values([
      { modelId: created.id, locale: "es", name: name.es, description: descriptionEs },
      { modelId: created.id, locale: "en", name: name.en, description: descriptionEn },
    ]);

    return NextResponse.json(
      {
        ...created,
        nameEs: name.es,
        nameEn: name.en,
        descriptionEs,
        descriptionEn,
      },
      { status: 201 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
