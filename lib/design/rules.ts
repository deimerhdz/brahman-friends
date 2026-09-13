/**
 * Límites de un elemento decorativo dentro de su zona: tamaño, posición, uno
 * por zona y un máximo de zonas por diseño (FR-043, FR-045, RN11, RN12, RN13).
 * Funciones puras: se usan en el navegador (para avisar en el momento) y en
 * el servidor (para volver a comprobar antes de registrar la solicitud).
 */

export interface ZoneLimits {
  maxWidthCm: number;
  maxHeightCm: number;
}

export interface SizeCm {
  widthCm: number;
  heightCm: number;
}

export interface OffsetPct {
  offsetXPct: number;
  offsetYPct: number;
}

/** El redimensionado se detiene en el máximo de la zona (FR-043, SC-014). */
export function clampSizeToZone(size: SizeCm, zone: ZoneLimits): SizeCm {
  const widthCm = Math.max(0.1, Math.min(size.widthCm, zone.maxWidthCm));
  const heightCm = Math.max(0.1, Math.min(size.heightCm, zone.maxHeightCm));
  const scale = Math.min(widthCm / size.widthCm, heightCm / size.heightCm, 1);
  return {
    widthCm: size.widthCm * scale,
    heightCm: size.heightCm * scale,
  };
}

/**
 * Vuelve a la posición válida más cercana al salir de la zona (research.md,
 * decisión 16). El desplazamiento máximo depende del tamaño del elemento:
 * uno grande no puede alejarse tanto del centro como uno chico.
 */
export function clampOffsetToZone(
  offset: OffsetPct,
  size: SizeCm,
  zone: ZoneLimits,
): OffsetPct {
  const halfWidthFrac = size.widthCm / zone.maxWidthCm / 2;
  const halfHeightFrac = size.heightCm / zone.maxHeightCm / 2;
  const maxX = Math.max(0, 0.5 - halfWidthFrac);
  const maxY = Math.max(0, 0.5 - halfHeightFrac);
  return {
    offsetXPct: Math.min(maxX, Math.max(-maxX, offset.offsetXPct)),
    offsetYPct: Math.min(maxY, Math.max(-maxY, offset.offsetYPct)),
  };
}

export type PlacementRejection = "zone_occupied" | "max_zones";

/** Un elemento por zona, máximo de zonas decoradas (RN11, RN13, SC-015). */
export function canPlaceDecoration(
  existingZones: readonly string[],
  targetZone: string,
  maxZones: number,
): { allowed: boolean; reason?: PlacementRejection } {
  if (existingZones.includes(targetZone)) {
    return { allowed: false, reason: "zone_occupied" };
  }
  if (existingZones.length >= maxZones) {
    return { allowed: false, reason: "max_zones" };
  }
  return { allowed: true };
}

/**
 * Gating del stepper del configurador (006-configurador-stepper FR-018).
 * Paso 1 exige haber elegido un color de la gorra; el paso 2 (logo) nunca
 * bloquea, la decoración es opcional (spec.md Clarifications).
 */
export function puedeAvanzarPaso(
  paso: number,
  draft: { colorId: string | null },
): boolean {
  if (paso === 1) return Boolean(draft.colorId);
  return true;
}

/**
 * Cantidad mínima de pedido efectiva (006-configurador-stepper FR-012): si
 * el administrador no definió MOQ para el modelo (`null`), el mínimo es 1.
 */
export function moqEfectivo(moq: number | null | undefined): number {
  return moq ?? 1;
}
