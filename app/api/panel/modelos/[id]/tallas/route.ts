import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { modelSize } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";
import { errors, handleApiError } from "@/lib/http/errors";

// Alta de tallas del modelo (FR-015). Solo estas se pueden usar al distribuir
// la cantidad de una solicitud (RN17).
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return errors.noAutorizado();

  try {
    const { id: modelId } = await params;
    const body = await request.json();
    if (typeof body.label !== "string" || !body.label) {
      return NextResponse.json({ error: "datos_invalidos" }, { status: 400 });
    }

    const [created] = await db
      .insert(modelSize)
      .values({
        modelId,
        label: body.label,
        sortOrder: Number.isFinite(body.sortOrder) ? body.sortOrder : 0,
      })
      .onConflictDoNothing()
      .returning();

    return NextResponse.json(created ?? { modelId, label: body.label }, {
      status: 201,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return errors.noAutorizado();

  try {
    const { id: modelId } = await params;
    const label = request.nextUrl.searchParams.get("label");
    if (!label) {
      return NextResponse.json({ error: "datos_invalidos" }, { status: 400 });
    }

    await db
      .delete(modelSize)
      .where(and(eq(modelSize.modelId, modelId), eq(modelSize.label, label)));

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleApiError(error);
  }
}
