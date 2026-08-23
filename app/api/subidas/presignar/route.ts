import { NextRequest, NextResponse } from "next/server";
import { errors, handleApiError } from "@/lib/http/errors";
import { crearUrlPrefirmada } from "@/lib/media/presign";

const ALLOWED_CONTENT_TYPE = "image/png";
const MAX_SIZE_BYTES = 10 * 1024 * 1024;

interface PresignBody {
  pathname: string;
  contentType: string;
  contentLength?: number;
}

// Autoriza la subida de las imágenes compuestas del diseño antes de
// registrar la solicitud (FR-053, plan.md). Pública: el cliente sigue
// siendo anónimo en este paso, pero solo admite PNG y un tamaño acotado.
// Reemplaza al patrón de token de @vercel/blob/client.
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as PresignBody;
    if (!body.pathname || body.contentType !== ALLOWED_CONTENT_TYPE) {
      return errors.formatoNoPermitido();
    }
    if (body.contentLength && body.contentLength > MAX_SIZE_BYTES) {
      return errors.archivoDemasiadoGrande(MAX_SIZE_BYTES / (1024 * 1024));
    }

    const result = await crearUrlPrefirmada(body.pathname, body.contentType);
    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}
