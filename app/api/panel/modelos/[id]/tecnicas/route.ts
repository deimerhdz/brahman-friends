import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { modelTechnique } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";
import { errors, handleApiError } from "@/lib/http/errors";

// Asocia o desasocia una técnica a un modelo (FR-036).
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return errors.noAutorizado();

  try {
    const { id: modelId } = await params;
    const { techniqueId } = await request.json();
    if (typeof techniqueId !== "string" || !techniqueId) {
      return NextResponse.json({ error: "datos_invalidos" }, { status: 400 });
    }

    await db
      .insert(modelTechnique)
      .values({ modelId, techniqueId })
      .onConflictDoNothing();

    return new NextResponse(null, { status: 204 });
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
    const techniqueId = request.nextUrl.searchParams.get("techniqueId");
    if (!techniqueId) {
      return NextResponse.json({ error: "datos_invalidos" }, { status: 400 });
    }

    await db
      .delete(modelTechnique)
      .where(
        and(
          eq(modelTechnique.modelId, modelId),
          eq(modelTechnique.techniqueId, techniqueId),
        ),
      );

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleApiError(error);
  }
}
