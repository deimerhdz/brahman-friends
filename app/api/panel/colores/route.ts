import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { color } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";
import { errors, handleApiError } from "@/lib/http/errors";
import { isMaterial } from "@/lib/catalogo/materiales";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return errors.noAutorizado();

  try {
    const body = await request.json();
    if (
      typeof body.nameEs !== "string" ||
      !body.nameEs ||
      typeof body.nameEn !== "string" ||
      !body.nameEn ||
      typeof body.supplierRef !== "string" ||
      !body.supplierRef ||
      typeof body.material !== "string" ||
      !isMaterial(body.material) ||
      typeof body.sampleImageUrl !== "string" ||
      !body.sampleImageUrl
    ) {
      return NextResponse.json({ error: "datos_invalidos" }, { status: 400 });
    }

    const [created] = await db
      .insert(color)
      .values({
        nameEs: body.nameEs,
        nameEn: body.nameEn,
        supplierRef: body.supplierRef,
        material: body.material,
        sampleImageUrl: body.sampleImageUrl,
        status: body.status ?? "available",
      })
      .returning();

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
