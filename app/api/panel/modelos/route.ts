import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { capModel } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";
import { errors, handleApiError } from "@/lib/http/errors";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return errors.noAutorizado();

  try {
    const body = await request.json();
    if (
      typeof body.code !== "string" ||
      !body.code ||
      typeof body.nameEs !== "string" ||
      !body.nameEs ||
      typeof body.nameEn !== "string" ||
      !body.nameEn
    ) {
      return NextResponse.json({ error: "datos_invalidos" }, { status: 400 });
    }

    const [created] = await db
      .insert(capModel)
      .values({
        code: body.code,
        nameEs: body.nameEs,
        nameEn: body.nameEn,
        descriptionEs: body.descriptionEs ?? "",
        descriptionEn: body.descriptionEn ?? "",
      })
      .returning();

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
