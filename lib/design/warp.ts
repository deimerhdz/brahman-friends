/**
 * Deformación por curvatura: arco, inclinación y estrechamiento
 * (research.md, decisión 8; FR-035, FR-041). Un elemento decorativo se corta
 * en franjas verticales; cada franja se desplaza y escala según estos tres
 * parámetros. Función matemática pura, sin dependencias — se prueba sola y
 * se reutiliza en el configurador, la vista previa del panel y la imagen
 * congelada de la solicitud (research.md, decisión 9).
 */

export interface WarpParams {
  /** Cuánto se arquea verticalmente. Rango -1..1. */
  arc: number;
  /** Cuánto se inclina. Rango -1..1. */
  tilt: number;
  /** Cuánto se estrecha hacia los bordes. Rango 0..1. */
  taper: number;
}

export interface WarpStrip {
  /** Posición horizontal del centro de la franja, 0 (izquierda) a 1 (derecha). */
  u: number;
  /** Ancho de la franja, en fracción del ancho total. */
  width: number;
  /** Centro vertical de la franja, en fracción de la altura (-0.5 a 0.5, 0 = centro). */
  offsetY: number;
  /** Alto de la franja, en fracción de la altura total (0 a 1). */
  scaleY: number;
}

const MIN_STRIP_HEIGHT = 0.35;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Calcula las franjas de deformación. Garantiza que ninguna franja sale de la
 * caja de la zona (FR-035, SC-013): el centro y la altura de cada franja se
 * mantienen siempre dentro de -0.5..0.5.
 */
export function computeStrips(
  stripCount: number,
  params: WarpParams,
): WarpStrip[] {
  const arc = clamp(params.arc, -1, 1);
  const tilt = clamp(params.tilt, -1, 1);
  const taper = clamp(params.taper, 0, 1);
  const width = 1 / stripCount;

  return Array.from({ length: stripCount }, (_, i) => {
    const u = (i + 0.5) / stripCount;
    const t = u - 0.5; // -0.5..0.5, 0 en el centro

    const scaleY = clamp(1 - taper * Math.abs(t) * 2 * 0.6, MIN_STRIP_HEIGHT, 1);

    const archTerm = arc * (0.25 - t * t) * 2; // máximo en el centro, 0 en los bordes
    const tiltTerm = tilt * t;
    const maxOffset = 0.5 - scaleY / 2;
    const offsetY = clamp(archTerm + tiltTerm, -maxOffset, maxOffset);

    return { u, width, offsetY, scaleY };
  });
}

/**
 * Dibuja una imagen ya cargada deformada según `params` sobre un rectángulo
 * `box` (en píxeles del canvas destino). No se prueba automáticamente: usa la
 * API del DOM (research.md, decisión 8: "se prueba" se refiere a `computeStrips`).
 */
export function drawWarped(
  ctx: CanvasRenderingContext2D,
  image: CanvasImageSource,
  box: { x: number; y: number; w: number; h: number },
  params: WarpParams,
  stripCount = 48,
): void {
  const strips = computeStrips(stripCount, params);
  const sourceWidth = "naturalWidth" in image ? image.naturalWidth : box.w;
  const sourceHeight = "naturalHeight" in image ? image.naturalHeight : box.h;

  for (const strip of strips) {
    const sx = strip.u * sourceWidth - (strip.width * sourceWidth) / 2;
    const sw = strip.width * sourceWidth;
    const dx = box.x + strip.u * box.w - (strip.width * box.w) / 2;
    const dw = strip.width * box.w + 1; // +1 evita líneas visibles entre franjas
    const dh = strip.scaleY * box.h;
    const dy = box.y + box.h / 2 + strip.offsetY * box.h - dh / 2;
    ctx.drawImage(image, sx, 0, sw, sourceHeight, dx, dy, dw, dh);
  }
}
