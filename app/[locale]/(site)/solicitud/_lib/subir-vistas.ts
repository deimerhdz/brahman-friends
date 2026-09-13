import { subirDirecto } from "@/lib/media/subir-directo";
import type { ModelManifest } from "@/lib/catalogo/model-manifest";
import type { Decoration } from "@/lib/design/borrador";
import { composeView, type ComposableView } from "@/lib/design/compose";

/**
 * Compone cada vista que el cliente tenía y la sube antes de registrar la
 * solicitud (FR-053). Solo se generan las vistas que el modelo tiene
 * activas, incluyendo el lateral reflejado si hay vista lateral.
 */
export async function subirVistas(
  manifest: ModelManifest,
  colorId: string | null,
  decorations: Decoration[],
): Promise<{ view: ComposableView; url: string }[]> {
  const views: ComposableView[] = manifest.views.flatMap((v) =>
    v === "side" ? (["side", "side_mirrored"] as ComposableView[]) : [v as ComposableView],
  );

  const results: { view: ComposableView; url: string }[] = [];
  for (const view of views) {
    const blob = await composeView(manifest, colorId, decorations, view);
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
