import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { adminUser } from "@/lib/db/schema";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { errors, handleApiError } from "@/lib/http/errors";

// Hash fijo para consumir el mismo tiempo cuando el correo no existe:
// mismo mensaje y mismo tiempo de respuesta en ambos casos (contrato api.md).
const DUMMY_HASH = hashPassword("no-existe-un-usuario-con-este-correo");

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    if (typeof email !== "string" || typeof password !== "string") {
      return errors.credencialesInvalidas();
    }

    const [user] = await db
      .select()
      .from(adminUser)
      .where(eq(adminUser.email, email.toLowerCase().trim()))
      .limit(1);

    const valid = verifyPassword(
      password,
      user?.active ? user.passwordHash : DUMMY_HASH,
    );

    if (!user || !user.active || !valid) {
      return errors.credencialesInvalidas();
    }

    await createSession({ userId: user.id, email: user.email, name: user.name });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleApiError(error);
  }
}
