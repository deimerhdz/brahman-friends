import { NextResponse } from "next/server";
import { destroyCustomerSession } from "@/lib/auth/customer-session";

export async function POST() {
  await destroyCustomerSession();
  return new NextResponse(null, { status: 204 });
}
