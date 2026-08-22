import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { customer } from "@/lib/db/schema";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createCustomerSession } from "@/lib/auth/customer-session";
import {
  isLocked,
  registerFailedAttempt,
  resetAttempts,
} from "@/lib/auth/login-lockout";
import { errors, handleApiError } from "@/lib/http/errors";

// Mismo hash señuelo que app/api/panel/login/route.ts: tiempo de respuesta
// constante entre correo inexistente y contraseña incorrecta (FR-005).
const DUMMY_HASH = hashPassword("no-existe-un-cliente-con-este-correo");

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    if (typeof email !== "string" || typeof password !== "string") {
      return errors.credencialesInvalidas();
    }

    const [found] = await db
      .select()
      .from(customer)
      .where(eq(customer.email, email.toLowerCase().trim()))
      .limit(1);

    const bloqueado =
      found?.active &&
      isLocked({
        failedLoginAttempts: found.failedLoginAttempts,
        lockedUntil: found.lockedUntil,
      });

    const valid = verifyPassword(
      password,
      found?.active && !bloqueado ? found.passwordHash : DUMMY_HASH,
    );

    if (!found || !found.active || bloqueado || !valid) {
      if (found && found.active && !bloqueado) {
        const next = registerFailedAttempt({
          failedLoginAttempts: found.failedLoginAttempts,
          lockedUntil: found.lockedUntil,
        });
        await db
          .update(customer)
          .set(next)
          .where(eq(customer.id, found.id));
      }
      return errors.credencialesInvalidas();
    }

    await db
      .update(customer)
      .set(resetAttempts())
      .where(eq(customer.id, found.id));

    await createCustomerSession({
      customerId: found.id,
      email: found.email,
      name: found.name,
    });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleApiError(error);
  }
}
