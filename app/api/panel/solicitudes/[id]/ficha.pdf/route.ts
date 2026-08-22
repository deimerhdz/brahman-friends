import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { db } from "@/lib/db";
import { request as requestTable, requestSize } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";
import { errors, handleApiError } from "@/lib/http/errors";
import type { DesignSnapshot } from "@/lib/solicitud/snapshot";

// Ficha técnica en PDF, generada siempre desde `design_snapshot`, nunca
// desde el catálogo actual (FR-064, SC-025).
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
    const sizes = await db.select().from(requestSize).where(eq(requestSize.requestId, id));

    const snapshot = req.designSnapshot as DesignSnapshot;
    const pdf = await PDFDocument.create();
    const page = pdf.addPage([595, 842]); // A4
    const font = await pdf.embedFont(StandardFonts.Helvetica);
    const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

    let y = 800;
    const draw = (text: string, opts: { size?: number; useBold?: boolean } = {}) => {
      page.drawText(text, {
        x: 40,
        y,
        size: opts.size ?? 11,
        font: opts.useBold ? bold : font,
        color: rgb(0.1, 0.1, 0.1),
      });
      y -= (opts.size ?? 11) + 8;
    };

    draw(`Brahman Friends — ${req.code}`, { size: 18, useBold: true });
    draw(`${snapshot.model.nameEs} / ${snapshot.model.nameEn} (${snapshot.model.code})`);
    draw(`Cantidad: ${req.quantity}`);
    draw(`Tallas: ${sizes.map((s) => `${s.sizeLabel}×${s.quantity}`).join(", ")}`);
    if (snapshot.technique) {
      draw(`Técnica: ${snapshot.technique.nameEs} / ${snapshot.technique.nameEn}`);
    }

    y -= 10;
    draw("Componentes", { useBold: true, size: 13 });
    for (const comp of snapshot.components) {
      draw(
        `${comp.nameEs}: ${comp.color ? `${comp.color.nameEs} (ref. ${comp.color.supplierRef})` : "—"}`,
      );
    }

    if (snapshot.decorations.length > 0) {
      y -= 10;
      draw("Decoración", { useBold: true, size: 13 });
      for (const d of snapshot.decorations) {
        const detail =
          d.kind === "logo" ? `logo (${d.logoFilename})` : `texto "${d.content}"`;
        draw(`${d.zone}: ${detail} — ${d.widthCm.toFixed(1)}×${d.heightCm.toFixed(1)} cm`);
      }
    }

    const bytes = await pdf.save();
    return new NextResponse(bytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${req.code}.pdf"`,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
