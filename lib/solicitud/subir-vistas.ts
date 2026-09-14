import { subirDirecto } from "@/lib/media/subir-directo";
import type { ModelManifest } from "@/lib/catalogo/model-manifest";
import type { Decoration } from "@/lib/design/borrador";
import { composeView, VIEW_FOR_ZONE, type ComposableView } from "@/lib/design/compose";

/**
 * Compone y sube solo las vistas donde el cliente puso una decoración: si
 * solo personalizó el frente, no tiene sentido generar y subir también
 * left/right/back — esas vistas nunca cambian respecto a la foto de
 * catálogo del color, así que no aportan nada a la ficha técnica y solo
 * suman peso/tiempo de envío.
 */
export async function subirVistas(
  manifest: ModelManifest,
  colorId: string | null,
  decorations: Decoration[],
  techniqueId: string | null,
): Promise<{ view: ComposableView; url: string }[]> {
  const decoratedViews = new Set(decorations.map((d) => VIEW_FOR_ZONE[d.zone]));
  const views = (manifest.views as ComposableView[]).filter((v) => decoratedViews.has(v));

  const results: { view: ComposableView; url: string }[] = [];
  for (const view of views) {
    const blob = await composeView(manifest, colorId, decorations, view, techniqueId);
    const url = await subirDirecto(
      "/api/subidas/presignar",
      `solicitudes/${Date.now()}-${view}.png`,
      blob,
      "image/png",
    );
    results.push({ view, url });
  }
  return results;
}
