import type { ModelManifest } from "@/lib/catalogo/model-manifest";

export type DisplayView = "front" | "left" | "right" | "back";

/**
 * Muestra la imagen base del modelo y, encima, la foto del color elegido
 * para esa vista (FR-024, decisión 6). Se espera un contenedor padre
 * posicionado (`relative`) con el tamaño ya fijado a la proporción de la
 * imagen: este componente solo llena ese espacio (`absolute inset-0`).
 */
export function CapasGorra({
  manifest,
  colorId,
  view,
}: {
  manifest: ModelManifest;
  colorId: string | null;
  view: DisplayView;
}) {
  const baseImage = manifest.baseImages[view];
  const selectedColor = manifest.colors.find((c) => c.id === colorId);
  const colorImageUrl = selectedColor?.images[view];

  return (
    <div className="absolute inset-0">
      {baseImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={baseImage}
          alt=""
          className="absolute inset-0 h-full w-full object-contain"
        />
      )}
      {colorImageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={colorImageUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-contain"
        />
      )}
    </div>
  );
}
