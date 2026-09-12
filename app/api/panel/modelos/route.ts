import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { capModel, capModelTranslation } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";
import { errors, handleApiError } from "@/lib/http/errors";
import { validarNombreTraducido } from "@/lib/catalogo/traduccion";
import { sanitizeDescriptionHtml } from "@/lib/media/sanitize-html";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return errors.noAutorizado();

  try {
    const body = await request.json();
    const name = validarNombreTraducido(body.name);
    if (typeof body.code !== "string" || !body.code || !name) {
      return errors.datosInvalidos();
    }
    // Descripción del editor de texto enriquecido (009-modelos-producto-fijo):
    // se sanea acá, la única vez que se confía en el HTML que manda el panel.
    const descriptionEs =
      typeof body.description?.es === "string"
        ? sanitizeDescriptionHtml(body.description.es.trim())
        : "";
    const descriptionEn =
      typeof body.description?.en === "string"
        ? sanitizeDescriptionHtml(body.description.en.trim())
        : "";

    // Tipo de modelo (009-modelos-producto-fijo): por defecto "configurable"
    // para no romper a nadie que todavía no manda este campo.
    let type: "configurable" | "fixed_product" = "configurable";
    if (body.type !== undefined) {
      if (body.type !== "configurable" && body.type !== "fixed_product") {
        return errors.datosInvalidos();
      }
      type = body.type;
    }

    // Precio base en USD, opcional (008-formulario-creacion-modelo): misma
    // regla de validación que ya usa el PATCH de [id]/route.ts. Obligatorio
    // para un "Producto fijo" (009-modelos-producto-fijo, FR-002).
    let price: string | null = null;
    if (body.price !== undefined && body.price !== null) {
      if (typeof body.price !== "number" || !Number.isFinite(body.price) || body.price < 0) {
        return errors.datosInvalidos();
      }
      price = body.price.toFixed(2);
    }
    if (type === "fixed_product" && price === null) {
      return errors.datosInvalidos();
    }

    const [created] = await db
      .insert(capModel)
      .values({ code: body.code, type, price })
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
