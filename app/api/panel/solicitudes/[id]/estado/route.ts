import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { request as requestTable, requestStatusHistory } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";
import { errors, handleApiError } from "@/lib/http/errors";
import { canTransition, allowedTransitions, type RequestStatus } from "@/lib/solicitud/estados";

// Aplica la máquina de estados y escribe el historial con usuario y fecha
// (FR-062, FR-063, SC-026, SC-027).
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return errors.noAutorizado();

  try {
    const { id } = await params;
    const { to } = (await request.json()) as { to: RequestStatus };

    const [req] = await db
      .select()
      .from(requestTable)
      .where(eq(requestTable.id, id))
      .limit(1);
    if (!req) {
      return NextResponse.json({ error: "no_encontrado" }, { status: 404 });
    }

    if (!canTransition(req.status, to)) {
      return errors.transicionNoPermitida(req.status, allowedTransitions(req.status));
    }

    // El driver HTTP de Neon no soporta transacciones interactivas; `batch`
    // envía ambas escrituras como una sola operación atómica.
    await db.batch([
      db
        .update(requestTable)
        .set({ status: to, statusChangedAt: new Date() })
        .where(eq(requestTable.id, id)),
      db.insert(requestStatusHistory).values({
        requestId: id,
        fromStatus: req.status,
        toStatus: to,
        adminUserId: session.userId,
      }),
    ]);

    return NextResponse.json({ status: to });
  } catch (error) {
    return handleApiError(error);
  }
}
