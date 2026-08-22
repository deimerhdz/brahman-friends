import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq, gte, lte, type SQL } from "drizzle-orm";
import { db } from "@/lib/db";
import { request as requestTable } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";
import { errors, handleApiError } from "@/lib/http/errors";
import { REQUEST_STATUSES } from "@/lib/solicitud/estados";

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

// Exporta el listado con los mismos filtros de la pantalla (FR-058, FR-064).
// Sin librería: es un CSV plano, abre en Excel y en Google Sheets.
export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) return errors.noAutorizado();

  try {
    const estado = request.nextUrl.searchParams.get("estado");
    const desde = request.nextUrl.searchParams.get("desde");
    const hasta = request.nextUrl.searchParams.get("hasta");

    const conditions: SQL[] = [];
    if (estado && (REQUEST_STATUSES as readonly string[]).includes(estado)) {
      conditions.push(eq(requestTable.status, estado as (typeof REQUEST_STATUSES)[number]));
    }
    if (desde) conditions.push(gte(requestTable.createdAt, new Date(desde)));
    if (hasta) conditions.push(lte(requestTable.createdAt, new Date(hasta)));

    const rows = await db
      .select()
      .from(requestTable)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(requestTable.createdAt));

    const header = ["code", "created_at", "contact_name", "quantity", "status", "notification_status"];
    const lines = [header.join(",")];
    for (const r of rows) {
      lines.push(
        [
          r.code,
          r.createdAt.toISOString(),
          r.contactName ?? "",
          String(r.quantity),
          r.status,
          r.notificationStatus,
        ]
          .map(csvEscape)
          .join(","),
      );
    }

    return new NextResponse(lines.join("\n"), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="solicitudes.csv"',
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
