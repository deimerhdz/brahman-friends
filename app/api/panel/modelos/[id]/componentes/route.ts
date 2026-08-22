import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { component } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";
import { errors, handleApiError } from "@/lib/http/errors";
import { isMaterial } from "@/lib/catalogo/materiales";

// Alta de componentes (FR-007): nombre bilingüe, material, personalizable,
// orden de capa. El color por defecto se fija después, entre los colores
// que se habiliten (FR-019, RN9).
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return errors.noAutorizado();

  try {
    const { id: modelId } = await params;
    const body = await request.json();

    if (
      typeof body.nameEs !== "string" ||
      !body.nameEs ||
      typeof body.nameEn !== "string" ||
      !body.nameEn ||
      typeof body.material !== "string" ||
      !isMaterial(body.material)
    ) {
      return NextResponse.json({ error: "datos_invalidos" }, { status: 400 });
    }

    const [created] = await db
      .insert(component)
      .values({
        modelId,
        nameEs: body.nameEs,
        nameEn: body.nameEn,
        material: body.material,
        customizable: body.customizable !== false,
        layerOrder: Number.isFinite(body.layerOrder) ? body.layerOrder : 0,
      })
      .returning();

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
