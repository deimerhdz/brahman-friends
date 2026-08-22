import type { ModelManifest } from "@/lib/catalogo/model-manifest";

export type DisplayView = "front" | "side" | "side_mirrored" | "back";

/**
 * Apila las capas de imagen por `layer_order` (FR-024, decisión 6). Se
 * espera un contenedor padre posicionado (`relative`) con el tamaño ya
 * fijado a la proporción de la imagen: este componente solo llena ese
 * espacio (`absolute inset-0`), para poder convivir con la capa de
 * decoración (`Decoracion.tsx`) que no debe heredar el reflejo del lateral
 * derecho (FR-026, FR-042).
 */
export function CapasGorra({
  manifest,
  colors,
  view,
}: {
  manifest: ModelManifest;
  colors: Record<string, string>;
  view: DisplayView;
}) {
  const sourceView = view === "side_mirrored" ? "side" : view;
  const mirrored = view === "side_mirrored";
  const baseImage = manifest.baseImages[sourceView];

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
      {manifest.components
        .filter((c) => c.customizable)
        .map((comp) => {
          const colorId = colors[comp.id];
          const compColor = comp.colors.find((c) => c.id === colorId);
          const imageUrl = compColor?.images[sourceView];
          if (!imageUrl) return null;
          return (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={comp.id}
              src={imageUrl}
              alt=""
              className="absolute inset-0 h-full w-full object-contain"
              style={{ zIndex: comp.layerOrder }}
            />
          );
        })}
    </div>
  );
}
