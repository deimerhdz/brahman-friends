import type { ModelManifest } from "@/lib/catalogo/model-manifest";
import type { Decoration } from "@/lib/design/borrador";
import { subirVistas } from "@/lib/solicitud/subir-vistas";

export interface DatosContacto {
  name: string;
  phone: string;
  comments: string;
  privacyAccepted: boolean;
}

export type ResultadoEnvio =
  | { ok: true; code: string; notificationPending: boolean }
  | { ok: false; errorCode: string };

/**
 * Sube las vistas compuestas y registra la solicitud (FR-053 a FR-055). Se
 * usa tanto desde la página standalone `/solicitud` como desde el modal que
 * se abre sin salir del configurador — ambos comparten exactamente esta
 * lógica de envío para no tener dos implementaciones que puedan divergir.
 * Un error de red (falla `subirVistas` o el propio `fetch`) se propaga como
 * excepción: el llamador decide cómo mostrarlo.
 */
export async function enviarSolicitud(params: {
  manifest: ModelManifest;
  submissionId: string;
  colorId: string | null;
  technique: string | null;
  decorations: Decoration[];
  quantity: number;
  contact: DatosContacto;
  locale: string;
}): Promise<ResultadoEnvio> {
  const viewImages = await subirVistas(
    params.manifest,
    params.colorId,
    params.decorations,
    params.technique,
  );

  const response = await fetch("/api/solicitudes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      submissionId: params.submissionId,
      design: {
        modelId: params.manifest.model.id,
        colorId: params.colorId,
        technique: params.technique,
        decorations: params.decorations,
      },
      quantity: params.quantity,
      contact: {
        name: params.contact.name,
        phone: params.contact.phone,
      },
      comments: params.contact.comments || undefined,
      privacyAccepted: params.contact.privacyAccepted,
      viewImages,
      locale: params.locale,
    }),
  });

  const body = await response.json();
  if (!response.ok) {
    return { ok: false, errorCode: body.error ?? "generic" };
  }
  return { ok: true, code: body.code, notificationPending: body.notificationPending };
}
