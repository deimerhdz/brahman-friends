import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { errors, handleApiError } from "@/lib/http/errors";
import { crearUrlPrefirmada } from "@/lib/media/presign";

const ALLOWED_CONTENT_TYPES = [
  "image/png",
  "image/jpeg",
  "image/svg+xml",
  "image/webp",
];

interface PresignBody {
  pathname: string;
  contentType: string;
}

// Autoriza al navegador del administrador a subir directo a R2 (color,
// vista de modelo, carga masiva — hasta ~540 imágenes por modelo, FR-010 del
// plan). El servidor solo entrega la URL prefirmada; el archivo nunca pasa
// por él. Reemplaza al patrón de token de @vercel/blob/client.
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return errors.noAutorizado();

  try {
    const body = (await request.json()) as PresignBody;
    if (!body.pathname || !ALLOWED_CONTENT_TYPES.includes(body.contentType)) {
      return errors.formatoNoPermitido();
    }

    const result = await crearUrlPrefirmada(body.pathname, body.contentType);
    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}
