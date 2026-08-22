import { NextRequest, NextResponse } from "next/server";
import { loadModelManifest } from "@/lib/catalogo/model-manifest";
import { apiError, handleApiError } from "@/lib/http/errors";

// Todo lo que el configurador necesita para arrancar (contracts/api.md). La
// página del configurador ya trae este mismo contenido renderizado en el
// servidor (FR-031a); esta ruta existe para recargar el mapa sin recargar la
// página (reintentos, disponibilidad).
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ modelId: string }> },
) {
  try {
    const { modelId } = await params;
    const manifest = await loadModelManifest(modelId);
    if (!manifest) {
      return apiError(404, "modelo_no_disponible");
    }
    return NextResponse.json(manifest);
  } catch (error) {
    return handleApiError(error);
  }
}
