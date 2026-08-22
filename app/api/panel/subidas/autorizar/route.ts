import { NextRequest, NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { getSession } from "@/lib/auth/session";
import { errors, handleApiError } from "@/lib/http/errors";

// Autoriza al navegador del administrador a subir directo al almacenamiento
// (carga masiva de hasta ~540 imágenes por modelo, FR-010). El servidor solo
// entrega el permiso; el archivo nunca pasa por él.
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return errors.noAutorizado();

  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: [
          "image/png",
          "image/jpeg",
          "image/svg+xml",
          "image/webp",
        ],
        addRandomSuffix: true,
      }),
      onUploadCompleted: async () => {
        // No hace falta reaccionar aquí: el navegador registra la imagen
        // explícitamente después (T046), con su componente/color/vista.
      },
    });
    return NextResponse.json(jsonResponse);
  } catch (error) {
    return handleApiError(error);
  }
}
