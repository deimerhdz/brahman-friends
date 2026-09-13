import type { ModelManifest } from "@/lib/catalogo/model-manifest";

export type DisplayView = "front" | "side" | "side_mirrored" | "back";

/**
 * Muestra la imagen base del modelo y, encima, la foto del color elegido
 * para esa vista (FR-024, decisión 6). Se espera un contenedor padre
 * posicionado (`relative`) con el tamaño ya fijado a la proporción de la
 * imagen: este componente solo llena ese espacio (`absolute inset-0`), para
 * poder convivir con la capa de decoración (`Decoracion.tsx`) que no debe
 * heredar el reflejo del lateral derecho (FR-026, FR-042).
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
  const sourceView = view === "side_mirrored" ? "side" : view;
  const mirrored = view === "side_mirrored";
  const baseImage = manifest.baseImages[sourceView];
  const selectedColor = manifest.colors.find((c) => c.id === colorId);
  const colorImageUrl = selectedColor?.images[sourceView];

  return (
    <div
      className="absolute inset-0"
      style={{ transform: mirrored ? "scaleX(-1)" : undefined }}
    >
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
