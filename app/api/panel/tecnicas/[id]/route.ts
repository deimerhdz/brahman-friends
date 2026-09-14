import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { technique } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";
import { errors, handleApiError } from "@/lib/http/errors";

// Cambia cómo se renderiza una técnica existente (010-lateral-real): "flat"
// (relleno plano, como estampado/vinil/sublimado) o "embroidery" (relieve +
// puntada + textura de hilo, ver lib/design/embroidery.ts). No hay forma de
// inferirlo por el nombre libre que el admin le puso a la técnica.
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return errors.noAutorizado();

  try {
    const { id } = await params;
    const body = await request.json();
    if (body.renderStyle !== "flat" && body.renderStyle !== "embroidery") {
      return NextResponse.json({ error: "datos_invalidos" }, { status: 400 });
    }

    const [updated] = await db
      .update(technique)
      .set({ renderStyle: body.renderStyle })
      .where(eq(technique.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "no_encontrado" }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (error) {
    return handleApiError(error);
  }
}
