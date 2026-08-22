import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { request as requestTable, logoAsset } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";
import { errors, handleApiError } from "@/lib/http/errors";

// Descarga el logotipo tal como lo cargó el cliente: mapas de bits en su
// resolución original, SVG en su forma saneada, sin reescalar ni recomprimir
// (FR-061, FR-037b, SC-028). 410 si la solicitud está anonimizada (SC-034).
export async function GET(
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
      return errors.logoEliminado();
    }

    const [logo] = await db
      .select()
      .from(logoAsset)
      .where(eq(logoAsset.requestId, id))
      .limit(1);
    if (!logo) {
      return NextResponse.json({ error: "no_encontrado" }, { status: 404 });
    }

    const fileResponse = await fetch(logo.url);
    const bytes = await fileResponse.arrayBuffer();

    return new NextResponse(bytes, {
      headers: {
        "Content-Type": logo.mime,
        "Content-Disposition": `attachment; filename="${logo.originalFilename}"`,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
