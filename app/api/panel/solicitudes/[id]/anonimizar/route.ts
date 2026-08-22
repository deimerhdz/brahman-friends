import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { request as requestTable, logoAsset } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";
import { errors, handleApiError } from "@/lib/http/errors";
import { deletePublicFile } from "@/lib/media/storage";

// Borra nombre, correo y teléfono, borra el logotipo y registra fecha y
// responsable (FR-069, FR-070). Irreversible (RN23).
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return errors.noAutorizado();

  try {
    const { id } = await params;
    const [req] = await db
      .select()
      .from(requestTable)
      .where(eq(requestTable.id, id))
      .limit(1);
    if (!req) {
      return NextResponse.json({ error: "no_encontrado" }, { status: 404 });
    }
    if (req.anonymizedAt) {
      return errors.yaAnonimizada();
    }

    const logos = await db.select().from(logoAsset).where(eq(logoAsset.requestId, id));
    for (const logo of logos) {
      await deletePublicFile(logo.url).catch(() => {});
    }
    if (logos.length > 0) {
      await db
        .update(logoAsset)
        .set({ deletedAt: new Date() })
        .where(eq(logoAsset.requestId, id));
    }

    await db
      .update(requestTable)
      .set({
        contactName: null,
        contactEmail: null,
        contactPhone: null,
        anonymizedAt: new Date(),
        anonymizedBy: session.userId,
      })
      .where(eq(requestTable.id, id));

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleApiError(error);
  }
}
