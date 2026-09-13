import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { errors, handleApiError } from "@/lib/http/errors";
import { crearUrlPrefirmada } from "@/lib/media/presign";
import { env } from "@/lib/config/env";

const ALLOWED_CONTENT_TYPES = [
  "image/png",
  "image/jpeg",
  "image/svg+xml",
  "image/webp",
];

interface PresignBody {
  pathname: string;
  contentType: string;
  contentLength?: number;
}

// Autoriza al navegador del administrador a subir directo a R2 (color,
// vista de modelo, carga masiva — hasta ~540 imágenes por modelo, FR-010 del
// plan; también logo/banner/imagen de SEO de Ajustes, FR-006 de
// 010-panel-ajustes-generales). El servidor solo entrega la URL prefirmada;
// el archivo nunca pasa por él. Reemplaza al patrón de token de
// @vercel/blob/client.
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return errors.noAutorizado();

  try {
    const body = (await request.json()) as PresignBody;
    if (!body.pathname || !ALLOWED_CONTENT_TYPES.includes(body.contentType)) {
      return errors.formatoNoPermitido();
    }
    const maxBytes = env.maxLogoMb * 1024 * 1024;
    if (body.contentLength && body.contentLength > maxBytes) {
      return errors.archivoDemasiadoGrande(env.maxLogoMb);
    }

    const result = await crearUrlPrefirmada(body.pathname, body.contentType);
    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}
