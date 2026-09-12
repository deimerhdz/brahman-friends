import type { ModelManifest } from "@/lib/catalogo/model-manifest";
import type { Decoration } from "@/lib/design/borrador";
import { drawWarped, type WarpParams } from "@/lib/design/warp";
import { fontCss } from "@/lib/design/fonts";

export type ComposableView = "front" | "side" | "side_mirrored" | "back";

export const VIEW_FOR_ZONE: Record<Decoration["zone"], ComposableView> = {
  front: "front",
  left: "side",
  right: "side_mirrored",
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
  colors: Record<string, string>,
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

  const sourceView = view === "side_mirrored" ? "side" : view;
  const mirrored = view === "side_mirrored";

  ctx.save();
  if (mirrored) {
    ctx.translate(width, 0);
    ctx.scale(-1, 1);
  }

  const baseUrl = manifest.baseImages[sourceView];
  if (baseUrl) {
    const base = await loadImage(baseUrl);
    ctx.drawImage(base, 0, 0, width, height);
  }

  for (const comp of manifest.components) {
    if (!comp.customizable) continue;
    const colorId = colors[comp.id];
    const compColor = comp.colors.find((c) => c.id === colorId);
    const imageUrl = compColor?.images[sourceView];
    if (!imageUrl) continue;
    const img = await loadImage(imageUrl);
    ctx.drawImage(img, 0, 0, width, height);
  }
  ctx.restore();

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
      const source = renderTextSource(decoration.content, decoration.font);
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

// Sin imagen de muestra por color (007-colores-por-modelo, enmienda
// 2026-09-06), el texto personalizado del cliente ya no tiene de dónde sacar
// un patrón por color: siempre se dibuja con este color de reserva fijo por
// defecto. `color` es un override opcional para otros usos (p. ej. la
// previsualización del panel admin, donde no hay una prenda real detrás y el
// color fijo se ve mal según la vista).
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
