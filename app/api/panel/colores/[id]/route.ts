import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { color } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";
import { errors, apiError, handleApiError } from "@/lib/http/errors";
import { isMaterial } from "@/lib/catalogo/materiales";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return errors.noAutorizado();

  try {
    const { id } = await params;
    const body = await request.json();
    const patch: Partial<typeof color.$inferInsert> = {};

    if (body.nameEs !== undefined) patch.nameEs = body.nameEs;
    if (body.nameEn !== undefined) patch.nameEn = body.nameEn;
    if (body.supplierRef !== undefined) patch.supplierRef = body.supplierRef;
    if (body.sampleImageUrl !== undefined)
      patch.sampleImageUrl = body.sampleImageUrl;
    if (body.material !== undefined) {
      if (!isMaterial(body.material)) {
        return NextResponse.json({ error: "datos_invalidos" }, { status: 400 });
      }
      patch.material = body.material;
    }
    if (body.status !== undefined) patch.status = body.status;

    const [updated] = await db
      .update(color)
      .set(patch)
      .where(eq(color.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "no_encontrado" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    return handleApiError(error);
  }
}

// Un color usado no se borra, se descontinúa (FR-023, RN8). La base de datos
// lo impide con claves foráneas; aquí se traduce ese fallo a un error claro.
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
