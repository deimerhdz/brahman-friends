import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { component, componentColor, color } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";
import { errors, apiError, handleApiError } from "@/lib/http/errors";

// Habilita un color en un componente. El material del color debe coincidir
// con el del componente, o se rechaza (FR-019, RN6, SC-004).
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return errors.noAutorizado();

  try {
    const { id: componentId } = await params;
    const { colorId } = await request.json();
    if (typeof colorId !== "string" || !colorId) {
      return NextResponse.json({ error: "datos_invalidos" }, { status: 400 });
    }

    const [comp] = await db
      .select()
      .from(component)
      .where(eq(component.id, componentId))
      .limit(1);
    const [col] = await db.select().from(color).where(eq(color.id, colorId)).limit(1);

    if (!comp || !col) {
      return NextResponse.json({ error: "no_encontrado" }, { status: 404 });
    }
    if (comp.material !== col.material) {
      return apiError(422, "material_no_coincide", {
        componentMaterial: comp.material,
        colorMaterial: col.material,
      });
    }

    await db
      .insert(componentColor)
      .values({ componentId, colorId })
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
    const { id: componentId } = await params;
    const colorId = request.nextUrl.searchParams.get("colorId");
    if (!colorId) {
      return NextResponse.json({ error: "datos_invalidos" }, { status: 400 });
    }

    await db
      .delete(componentColor)
      .where(
        and(
          eq(componentColor.componentId, componentId),
          eq(componentColor.colorId, colorId),
        ),
      );

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleApiError(error);
  }
}
