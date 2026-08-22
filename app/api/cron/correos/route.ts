import { NextRequest, NextResponse } from "next/server";
import { inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { request as requestTable } from "@/lib/db/schema";
import { env } from "@/lib/config/env";
import { sendRequestNotifications } from "@/lib/email/enviar";

// Reintenta las notificaciones pendientes y fallidas, cada hora (FR-056b).
export async function POST(request: NextRequest) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${env.cronSecret}`) {
    return NextResponse.json({ error: "no_autorizado" }, { status: 403 });
  }

  const pending = await db
    .select({ id: requestTable.id })
    .from(requestTable)
    .where(inArray(requestTable.notificationStatus, ["pending", "failed"]));

  let sent = 0;
  let stillFailing = 0;
  for (const { id } of pending) {
    try {
      await sendRequestNotifications(id);
      sent += 1;
    } catch {
      stillFailing += 1;
    }
  }

  return NextResponse.json({ retried: pending.length, sent, stillFailing });
}
