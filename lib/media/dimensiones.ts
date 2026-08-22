/**
 * Igualdad de dimensiones de las imágenes de un modelo (FR-011, RN5). La
 * primera imagen que se carga fija `cap_model.image_width/height`; toda
 * imagen posterior debe coincidir exacto.
 */

export interface ImageDimensions {
  width: number;
  height: number;
}

export function dimensionsMatch(
  a: ImageDimensions,
  b: ImageDimensions,
): boolean {
  return a.width === b.width && a.height === b.height;
}

/**
 * De un lote de imágenes recién leídas, cuáles no coinciden con las
 * dimensiones esperadas. Si el modelo todavía no tiene dimensiones fijas
 * (`expected` es `null`), se toma la primera imagen del lote como base.
 */
export function findMismatched<T extends ImageDimensions>(
  images: readonly T[],
  expected: ImageDimensions | null,
): { expected: ImageDimensions | null; mismatched: T[] } {
  const base = expected ?? images[0] ?? null;
  if (!base) return { expected: null, mismatched: [] };
  return {
    expected: base,
    mismatched: images.filter((img) => !dimensionsMatch(img, base)),
  };
}
