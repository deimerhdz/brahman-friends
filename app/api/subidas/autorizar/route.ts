import { NextRequest, NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { handleApiError } from "@/lib/http/errors";

// Autoriza la subida de las imágenes compuestas del diseño antes de
// registrar la solicitud (FR-053, decisión 9). Pública: el cliente sigue
// siendo anónimo en este paso, pero solo admite PNG y un tamaño acotado.
export async function POST(request: NextRequest) {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ["image/png"],
        addRandomSuffix: true,
        maximumSizeInBytes: 10 * 1024 * 1024,
      }),
      onUploadCompleted: async () => {},
    });
    return NextResponse.json(jsonResponse);
  } catch (error) {
    return handleApiError(error);
  }
}
