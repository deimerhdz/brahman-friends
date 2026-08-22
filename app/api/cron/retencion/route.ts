import { NextRequest, NextResponse } from "next/server";
import { and, eq, inArray, isNull, lt } from "drizzle-orm";
import { db } from "@/lib/db";
import { request as requestTable, logoAsset } from "@/lib/db/schema";
import { env } from "@/lib/config/env";
import { deletePublicFile } from "@/lib/media/storage";
import { FINAL_STATUSES } from "@/lib/solicitud/estados";

const TWELVE_MONTHS_MS = 365 * 24 * 60 * 60 * 1000;
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

// Tarea diaria: anonimiza solicitudes con más de 12 meses en estado final
// (FR-068) y borra logotipos huérfanos de más de 30 días (FR-039).
export async function POST(request: NextRequest) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${env.cronSecret}`) {
    return NextResponse.json({ error: "no_autorizado" }, { status: 403 });
  }

  const cutoffRequests = new Date(Date.now() - TWELVE_MONTHS_MS);
  const toAnonymize = await db
    .select()
    .from(requestTable)
    .where(
      and(
        inArray(requestTable.status, FINAL_STATUSES),
        lt(requestTable.statusChangedAt, cutoffRequests),
        isNull(requestTable.anonymizedAt),
      ),
    );

  for (const req of toAnonymize) {
    const requestLogos = await db
      .select()
      .from(logoAsset)
      .where(and(eq(logoAsset.requestId, req.id), isNull(logoAsset.deletedAt)));
    for (const logo of requestLogos) {
      await deletePublicFile(logo.url).catch(() => {});
    }
    if (requestLogos.length > 0) {
      await db
        .update(logoAsset)
        .set({ deletedAt: new Date() })
        .where(inArray(logoAsset.id, requestLogos.map((l) => l.id)));
    }
    await db
      .update(requestTable)
      .set({
        contactName: null,
        contactEmail: null,
        contactPhone: null,
        anonymizedAt: new Date(),
      })
      .where(eq(requestTable.id, req.id));
  }

  const cutoffLogos = new Date(Date.now() - THIRTY_DAYS_MS);
  const orphaned = await db
    .select()
    .from(logoAsset)
    .where(and(isNull(logoAsset.requestId), lt(logoAsset.createdAt, cutoffLogos)));

  for (const logo of orphaned) {
    await deletePublicFile(logo.url).catch(() => {});
  }
  if (orphaned.length > 0) {
    await db.delete(logoAsset).where(
      inArray(
        logoAsset.id,
        orphaned.map((l) => l.id),
      ),
    );
  }

  return NextResponse.json({ anonymized: toAnonymize.length, logosDeleted: orphaned.length });
}
