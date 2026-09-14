/**
 * Bordado falso (010-lateral-real): sin IA, tres capas de Canvas 2D sobre la
 * misma fuente que ya usa la técnica "plana" (`renderTextSource`, el logo
 * subido) — relieve, contorno de puntada y textura de hilo — para que un
 * elemento con `technique.renderStyle === "embroidery"` se vea cosido en vez
 * de impreso. El resultado es una fuente más (mismo alto/ancho que la
 * original) que `drawWarped` deforma exactamente igual que cualquier otra.
 */

import { fontCss } from "@/lib/design/fonts";

const TEXT_CANVAS_WIDTH = 600;
const TEXT_CANVAS_HEIGHT = 240;

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace("#", "");
  const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean;
  const n = Number.parseInt(full, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function shade(hex: string, factor: number): string {
  const { r, g, b } = hexToRgb(hex);
  const f = (v: number) => Math.max(0, Math.min(255, Math.round(v * factor)));
  return `rgb(${f(r)}, ${f(g)}, ${f(b)})`;
}

/** Patrón repetible de líneas a 45° que simula la dirección del hilo. */
function threadTexturePattern(
  ctx: CanvasRenderingContext2D,
  tint: string,
): CanvasPattern {
  const tile = document.createElement("canvas");
  tile.width = 8;
  tile.height = 8;
  const t = tile.getContext("2d")!;
  t.strokeStyle = `rgba(${hexOrRgbToRgbTuple(tint)}, 0.5)`;
  t.lineWidth = 1.4;
  t.beginPath();
  t.moveTo(-2, 10);
  t.lineTo(10, -2);
  t.moveTo(-2, 2);
  t.lineTo(2, -2);
  t.moveTo(6, 10);
  t.lineTo(10, 6);
  t.stroke();
  return ctx.createPattern(tile, "repeat")!;
}

function hexOrRgbToRgbTuple(color: string): string {
  if (color.startsWith("rgb")) {
    const m = color.match(/[\d.]+/g);
    return m ? m.slice(0, 3).join(", ") : "0, 0, 0";
  }
  const { r, g, b } = hexToRgb(color);
  return `${r}, ${g}, ${b}`;
}

/**
 * Overlay de textura de hilo recortado a lo que ya esté dibujado en `canvas`
 * (su canal alfa), sin tocar lo de afuera. Se usa tanto para texto como para
 * logos: en ambos casos "lo ya dibujado" es la forma real del elemento.
 */
function applyThreadTexture(canvas: HTMLCanvasElement, tint: string): void {
  const ctx = canvas.getContext("2d")!;
  ctx.save();
  ctx.globalCompositeOperation = "source-atop";
  ctx.fillStyle = threadTexturePattern(ctx, tint);
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.restore();
}

/**
 * Texto renderizado como bordado: relieve (brillo/sombra desplazados),
 * relleno del color de hilo, contorno de puntada punteado (el trazo real del
 * glyph, vía `strokeText`) y textura de hilo. Reemplaza a `renderTextSource`
 * cuando la técnica elegida es de bordado.
 */
export function renderEmbroideredText(
  content: string,
  fontId: string,
  color = "#111827",
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = TEXT_CANVAS_WIDTH;
  canvas.height = TEXT_CANVAS_HEIGHT;
  const ctx = canvas.getContext("2d")!;
  const fontSize = 90;
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const text = content || " ";

  ctx.font = `bold ${fontSize}px ${fontCss(fontId)}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const offset = fontSize * 0.03;
  ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
  ctx.fillText(text, cx - offset, cy - offset);
  ctx.fillStyle = "rgba(0, 0, 0, 0.38)";
  ctx.fillText(text, cx + offset, cy + offset);

  ctx.fillStyle = color;
  ctx.fillText(text, cx, cy);

  ctx.setLineDash([fontSize * 0.045, fontSize * 0.032]);
  ctx.lineWidth = fontSize * 0.028;
  ctx.strokeStyle = shade(color, 0.55);
  ctx.strokeText(text, cx, cy);

  applyThreadTexture(canvas, shade(color, 1.9));

  return canvas;
}

/**
 * Silueta sólida (relleno `tint`) con la misma forma alfa que `source`: sirve
 * para el relieve de un logo, donde no hay un glyph que desplazar como en el
 * texto — se desplaza la silueta en su lugar.
 */
function solidSilhouette(
  source: CanvasImageSource,
  width: number,
  height: number,
  tint: string,
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(source, 0, 0, width, height);
  ctx.globalCompositeOperation = "source-in";
  ctx.fillStyle = tint;
  ctx.fillRect(0, 0, width, height);
  return canvas;
}

/**
 * Logo (imagen ya cargada) renderizado como bordado: mismo relieve y textura
 * que el texto, pero sin contorno de puntada — un logo arbitrario no tiene un
 * único trazo de glyph que seguir, y aproximar su silueta con un trazo
 * quedaría distinto a como borda una máquina real. Reemplaza al `img` crudo
 * cuando la técnica elegida es de bordado.
 */
export function renderEmbroideredLogo(
  source: CanvasImageSource,
  width: number,
  height: number,
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  const offset = Math.max(1, Math.min(width, height) * 0.012);

  const highlight = solidSilhouette(source, width, height, "#ffffff");
  const shadow = solidSilhouette(source, width, height, "#000000");

  ctx.globalAlpha = 0.5;
  ctx.drawImage(highlight, -offset, -offset);
  ctx.globalAlpha = 0.38;
  ctx.drawImage(shadow, offset, offset);
  ctx.globalAlpha = 1;
  ctx.drawImage(source, 0, 0, width, height);

  applyThreadTexture(canvas, "#8a8a8a");

  return canvas;
}
