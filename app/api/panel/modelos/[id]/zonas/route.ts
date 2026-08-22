import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { decorationZone } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";
import { errors, handleApiError } from "@/lib/http/errors";

const POSITIONS = ["front", "left", "right", "back"] as const;

// Alta y edición de zonas decorables (FR-034, FR-035). Una por posición y
// modelo: se actualiza si ya existe.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return errors.noAutorizado();

  try {
    const { id: modelId } = await params;
    const body = await request.json();

    if (!POSITIONS.includes(body.position)) {
      return NextResponse.json({ error: "datos_invalidos" }, { status: 400 });
    }

    const values = {
      modelId,
      position: body.position,
      maxWidthCm: String(body.maxWidthCm ?? 11),
      maxHeightCm: String(body.maxHeightCm ?? 5.5),
      boxX: Number(body.boxX ?? 0),
      boxY: Number(body.boxY ?? 0),
      boxW: Number(body.boxW ?? 100),
      boxH: Number(body.boxH ?? 100),
      arc: String(body.arc ?? 0),
      tilt: String(body.tilt ?? 0),
      taper: String(body.taper ?? 0),
      maxTextChars: Number(body.maxTextChars ?? 20),
    };

    const [existing] = await db
      .select()
      .from(decorationZone)
      .where(
        and(
          eq(decorationZone.modelId, modelId),
          eq(decorationZone.position, body.position),
        ),
      )
      .limit(1);

    if (existing) {
      const [updated] = await db
        .update(decorationZone)
        .set(values)
        .where(eq(decorationZone.id, existing.id))
        .returning();
      return NextResponse.json(updated);
    }

    const [created] = await db.insert(decorationZone).values(values).returning();
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
