import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { component } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";
import { errors, handleApiError } from "@/lib/http/errors";

// Fija el color por defecto del componente, entre los ya habilitados (RN9).
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return errors.noAutorizado();

  try {
    const { id } = await params;
    const body = await request.json();
    const patch: Partial<typeof component.$inferInsert> = {};
    if (body.defaultColorId !== undefined) patch.defaultColorId = body.defaultColorId;
    if (body.layerOrder !== undefined) patch.layerOrder = body.layerOrder;

    const [updated] = await db
      .update(component)
      .set(patch)
      .where(eq(component.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "no_encontrado" }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (error) {
    return handleApiError(error);
  }
}
