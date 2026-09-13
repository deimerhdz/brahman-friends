import type { ModelManifest } from "@/lib/catalogo/model-manifest";
import type { Decoration } from "@/lib/design/borrador";
import { drawWarped, type WarpParams } from "@/lib/design/warp";
import { fontCss } from "@/lib/design/fonts";

export type ComposableView = "front" | "left" | "right" | "back";

// Cada zona decorable vive en su propia foto/vista real (antes "left" y
// "right" compartían la misma foto "side", espejada por CSS/canvas para el
// lado derecho); el mapeo queda como identidad, pero se conserva para no
// acoplar el resto del código a que `Decoration["zone"]` y `ComposableView`
// sean el mismo tipo.
export const VIEW_FOR_ZONE: Record<Decoration["zone"], ComposableView> = {
  front: "front",
  left: "left",
  right: "right",
  back: "back",
};

/**
 * Composición a imagen en el navegador (FR-053, decisión 9): el navegador
 * del cliente toma exactamente lo que hay en pantalla —capas de la gorra más
 * elementos decorativos ya deformados— y lo convierte en un PNG por vista.
 * Requiere que las imágenes se sirvan con permiso de origen cruzado
 * (`crossOrigin="anonymous"`), o el canvas queda "manchado" y no exporta.
 */
export async function composeView(
  manifest: ModelManifest,
  colorId: string | null,
  decorations: Decoration[],
  view: ComposableView,
): Promise<Blob> {
  const width = manifest.model.imageWidth ?? 1000;
  const height = manifest.model.imageHeight ?? 1000;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No se pudo crear el lienzo de composición");

  const baseUrl = manifest.baseImages[view];
  if (baseUrl) {
    const base = await loadImage(baseUrl);
    ctx.drawImage(base, 0, 0, width, height);
  }

  const selectedColor = manifest.colors.find((c) => c.id === colorId);
  const colorImageUrl = selectedColor?.images[view];
  if (colorImageUrl) {
    const img = await loadImage(colorImageUrl);
    ctx.drawImage(img, 0, 0, width, height);
  }

  const visibleDecorations = decorations.filter(
    (d) => VIEW_FOR_ZONE[d.zone] === view,
  );
  for (const decoration of visibleDecorations) {
    const zone = manifest.zones.find((z) => z.position === decoration.zone);
    if (!zone) continue;
    const warpParams: WarpParams = { arc: zone.arc, tilt: zone.tilt, taper: zone.taper };
    const box = { x: zone.box.x, y: zone.box.y, w: zone.box.w, h: zone.box.h };

    if (decoration.kind === "logo") {
      const img = await loadImage(decoration.url);
      drawWarped(ctx, img, box, warpParams);
    } else {
      const source = renderTextSource(decoration.content, decoration.font, decoration.color);
      drawWarped(ctx, source, box, warpParams);
    }
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("No se pudo componer la imagen"));
    }, "image/png");
  });
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`No se pudo cargar la imagen: ${src}`));
    img.src = src;
  });
}

// `color` es el color hexadecimal elegido por el cliente para el texto
// (borrador.ts `DecorationText.color`); el valor por defecto solo cubre
// llamadas que no editorializan un color propio (p. ej. placeholders).
export function renderTextSource(
  content: string,
  fontId: string,
  color = "#111827",
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = 600;
  canvas.height = 240;
  const ctx = canvas.getContext("2d")!;
  ctx.font = `bold 90px ${fontCss(fontId)}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = color;
  ctx.fillText(content || " ", canvas.width / 2, canvas.height / 2);
  return canvas;
}
