import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { technique } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";
import { errors, handleApiError } from "@/lib/http/errors";

// Alta de técnicas de decoración (FR-036). Lista global; su asociación a un
// modelo concreto vive en `model_technique`.
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return errors.noAutorizado();

  try {
    const body = await request.json();
    if (
      typeof body.nameEs !== "string" ||
      !body.nameEs ||
      typeof body.nameEn !== "string" ||
      !body.nameEn
    ) {
      return NextResponse.json({ error: "datos_invalidos" }, { status: 400 });
    }

    const [created] = await db
      .insert(technique)
      .values({ nameEs: body.nameEs, nameEn: body.nameEn })
      .returning();

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
