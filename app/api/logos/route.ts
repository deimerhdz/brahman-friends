import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logoAsset } from "@/lib/db/schema";
import { env } from "@/lib/config/env";
import { errors, handleApiError } from "@/lib/http/errors";
import { sanitizeSvg } from "@/lib/media/sanitize-svg";
import { readImageInfo } from "@/lib/media/leer-imagen-servidor";
import { uploadPublicFile } from "@/lib/media/storage";

const EXTENSION_TO_MIME: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  svg: "image/svg+xml",
};

const LOW_RESOLUTION_PX = 300;

// Sube y sanea un logotipo. El cliente sigue siendo anónimo en este punto
// (Principio V): no se pide ningún dato personal aquí (contracts/api.md).
export async function POST(request: NextRequest) {
  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "datos_invalidos" }, { status: 400 });
    }

    const allowedMimes = env.logoFormats
      .map((ext) => EXTENSION_TO_MIME[ext])
      .filter(Boolean);
    if (!allowedMimes.includes(file.type)) {
      return errors.formatoNoPermitido();
    }

    const maxBytes = env.maxLogoMb * 1024 * 1024;
    if (file.size > maxBytes) {
      return errors.archivoDemasiadoGrande(env.maxLogoMb);
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const warnings: string[] = [];
    let finalBuffer: Buffer = bytes;
    const finalMime = file.type;

    if (file.type === "image/svg+xml") {
      const { sanitized, valid } = sanitizeSvg(bytes.toString("utf8"));
      if (!valid) {
        return errors.svgNoValidoTrasSaneo();
      }
      finalBuffer = Buffer.from(sanitized, "utf8");
    }

    const info = readImageInfo(finalBuffer, finalMime);
    if (info.width && info.height && (info.width < LOW_RESOLUTION_PX || info.height < LOW_RESOLUTION_PX)) {
      warnings.push("baja_resolucion");
    }
    if (info.hasTransparency === false) {
      warnings.push("fondo_no_transparente");
    }

    const extension = finalMime === "image/svg+xml" ? "svg" : finalMime === "image/png" ? "png" : "jpg";
    const { url } = await uploadPublicFile(
      `logos/${Date.now()}-${crypto.randomUUID()}.${extension}`,
      finalBuffer,
      finalMime,
    );

    const [created] = await db
      .insert(logoAsset)
      .values({
        url,
        mime: finalMime,
        bytes: finalBuffer.byteLength,
        originalFilename: file.name,
        width: info.width,
        height: info.height,
      })
      .returning();

    return NextResponse.json(
      {
        logoAssetId: created.id,
        url: created.url,
        width: created.width,
        height: created.height,
        warnings,
      },
      { status: 201 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
