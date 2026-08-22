import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { env } from "@/lib/config/env";

export const CUSTOMER_SESSION_COOKIE = "bf_customer_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 días

export interface CustomerSessionPayload {
  customerId: string;
  email: string;
  name: string;
}

function sign(data: string): string {
  return createHmac("sha256", env.sessionSecret).update(data).digest("hex");
}

function encode(payload: CustomerSessionPayload): string {
  const data = Buffer.from(JSON.stringify(payload), "utf8").toString(
    "base64url",
  );
  const signature = sign(data);
  return `${data}.${signature}`;
}

function decode(token: string): CustomerSessionPayload | null {
  const [data, signature] = token.split(".");
  if (!data || !signature) return null;
  const expected = sign(data);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    return JSON.parse(Buffer.from(data, "base64url").toString("utf8"));
  } catch {
    return null;
  }
}

/**
 * Cookie de sesión de cliente: firmada, `HttpOnly`, `Secure`, `SameSite=Lax`.
 * Módulo separado de `lib/auth/session.ts` (sesión del panel) — FR-009: las
 * dos cuentas nunca comparten cookie, tabla ni verificación.
 */
export async function createCustomerSession(
  payload: CustomerSessionPayload,
): Promise<void> {
  const store = await cookies();
  store.set(CUSTOMER_SESSION_COOKIE, encode(payload), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function destroyCustomerSession(): Promise<void> {
  const store = await cookies();
  store.delete(CUSTOMER_SESSION_COOKIE);
}

export async function getCustomerSession(): Promise<CustomerSessionPayload | null> {
  const store = await cookies();
  const token = store.get(CUSTOMER_SESSION_COOKIE)?.value;
  if (!token) return null;
  return decode(token);
}
