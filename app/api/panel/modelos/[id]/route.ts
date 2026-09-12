import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { capModel, capModelTranslation, color } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";
import { apiError, errors, handleApiError } from "@/lib/http/errors";
import { validarNombreTraducido } from "@/lib/catalogo/traduccion";
import { sanitizeDescriptionHtml } from "@/lib/media/sanitize-html";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return errors.noAutorizado();

  try {
    const { id } = await params;
    const body = await request.json();
    const patch: Partial<typeof capModel.$inferInsert> = {};

    // El tipo del modelo no se edita por esta vía (009-modelos-producto-fijo,
    // FR-010): se fija al crear. Si el modelo es "fixed_product", el precio
    // no se puede vaciar (FR-002) — hace falta saber el tipo actual antes de
    // validar `price` más abajo.
    const [currentModel] = await db
      .select({ type: capModel.type })
      .from(capModel)
      .where(eq(capModel.id, id))
      .limit(1);
    if (!currentModel) {
      return NextResponse.json({ error: "no_encontrado" }, { status: 404 });
    }
    if (
      currentModel.type === "fixed_product" &&
      body.price === null
    ) {
      return errors.datosInvalidos();
    }

    let name: { es: string; en: string } | null = null;
    if (body.name !== undefined) {
      name = validarNombreTraducido(body.name);
      if (!name) {
        return errors.datosInvalidos();
      }
    }

    let description: { es: string; en: string } | null = null;
    if (body.description !== undefined) {
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
      description = { es: descriptionEs, en: descriptionEn };
    }

    if (body.code !== undefined) {
      if (typeof body.code !== "string" || !body.code) {
        return errors.datosInvalidos();
      }
      patch.code = body.code;
    }

    // Cantidad mínima de pedido (006-configurador-stepper FR-010).
    if (body.moq !== undefined) {
      if (body.moq !== null && (!Number.isInteger(body.moq) || body.moq < 1)) {
        return errors.datosInvalidos();
      }
      patch.moq = body.moq;
    }

    // Precio base en USD.
    if (body.price !== undefined) {
      if (
        body.price !== null &&
        (typeof body.price !== "number" || !Number.isFinite(body.price) || body.price < 0)
      ) {
        return errors.datosInvalidos();
      }
      patch.price = body.price === null ? null : body.price.toFixed(2);
    }

    // Variante predeterminada de tienda/catálogo — debe pertenecer a este modelo.
    if (body.defaultColorId !== undefined) {
      if (body.defaultColorId !== null) {
        if (typeof body.defaultColorId !== "string") {
          return errors.datosInvalidos();
        }
        const [matchingColor] = await db
          .select({ id: color.id })
          .from(color)
          .where(and(eq(color.id, body.defaultColorId), eq(color.modelId, id)))
          .limit(1);
        if (!matchingColor) {
          return apiError(422, "modelo_no_coincide");
        }
      }
      patch.defaultColorId = body.defaultColorId;
    }

    const [updated] =
      Object.keys(patch).length > 0
        ? await db.update(capModel).set(patch).where(eq(capModel.id, id)).returning()
        : await db.select().from(capModel).where(eq(capModel.id, id)).limit(1);

    if (!updated) {
      return NextResponse.json({ error: "no_encontrado" }, { status: 404 });
    }

    if (name) {
      await Promise.all([
        db
          .update(capModelTranslation)
          .set({ name: name.es })
          .where(
            and(
              eq(capModelTranslation.modelId, id),
              eq(capModelTranslation.locale, "es"),
            ),
          ),
        db
          .update(capModelTranslation)
          .set({ name: name.en })
          .where(
            and(
              eq(capModelTranslation.modelId, id),
              eq(capModelTranslation.locale, "en"),
            ),
          ),
      ]);
    }

    if (description) {
      await Promise.all([
        db
          .update(capModelTranslation)
          .set({ description: description.es })
          .where(
            and(
              eq(capModelTranslation.modelId, id),
              eq(capModelTranslation.locale, "es"),
            ),
          ),
        db
          .update(capModelTranslation)
          .set({ description: description.en })
          .where(
            and(
              eq(capModelTranslation.modelId, id),
              eq(capModelTranslation.locale, "en"),
            ),
          ),
      ]);
    }

    return NextResponse.json({
      ...updated,
      ...(name ? { nameEs: name.es, nameEn: name.en } : {}),
      ...(description
        ? { descriptionEs: description.es, descriptionEn: description.en }
        : {}),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
