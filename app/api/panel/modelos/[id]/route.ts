import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { capModel, capModelTranslation } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";
import { errors, handleApiError } from "@/lib/http/errors";
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
    const patch: Partial<typeof capModel.$inferInsert> = {};

    let name: { es: string; en: string } | null = null;
    if (body.name !== undefined) {
      name = validarNombreTraducido(body.name);
      if (!name) {
        return errors.datosInvalidos();
      }
    }

    let description: { es: string; en: string } | null = null;
    if (body.description !== undefined) {
      const descriptionEs =
        typeof body.description?.es === "string" ? body.description.es.trim() : "";
      const descriptionEn =
        typeof body.description?.en === "string" ? body.description.en.trim() : "";
      description = { es: descriptionEs, en: descriptionEn };
    }

    if (body.code !== undefined) {
      if (typeof body.code !== "string" || !body.code) {
        return errors.datosInvalidos();
      }
      patch.code = body.code;
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
