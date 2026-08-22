import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { customer } from "@/lib/db/schema";
import { hashPassword } from "@/lib/auth/password";
import { createCustomerSession } from "@/lib/auth/customer-session";
import { errors, handleApiError } from "@/lib/http/errors";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const email =
      typeof body.email === "string" ? body.email.toLowerCase().trim() : "";

    if (!name || !email || !password) {
      return errors.datosInvalidos();
    }

    const [existing] = await db
      .select({ id: customer.id })
      .from(customer)
      .where(eq(customer.email, email))
      .limit(1);

    if (existing) {
      return errors.correoYaRegistrado();
    }

    const [created] = await db
      .insert(customer)
      .values({ name, email, passwordHash: hashPassword(password) })
      .returning();

    await createCustomerSession({
      customerId: created.id,
      email: created.email,
      name: created.name,
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleApiError(error);
  }
}
