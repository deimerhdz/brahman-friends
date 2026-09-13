/**
 * Qué falta para publicar un modelo (FR-012, RN2). Función pura: la ruta
 * que la usa arma estas estructuras a partir de la base de datos.
 */

export type View = "front" | "side" | "back";

export interface PublicacionColor {
  id: string;
  nameEs: string;
  nameEn: string;
}

export interface PublicacionInput {
  activeViews: View[];
  viewsWithBaseImage: View[];
  colors: PublicacionColor[];
  /** Vistas con imagen ya cargada, por color (FR-009). */
  colorImages: { colorId: string; view: View }[];
}

export interface MissingCombination {
  color: string;
  view: View;
}

export interface PublicacionResultado {
  missing: MissingCombination[];
  missingBaseViews: View[];
  /** El modelo no tiene ningún color configurado todavía. */
  noColors: boolean;
}

export function canPublish(result: PublicacionResultado): boolean {
  return (
    result.missing.length === 0 &&
    result.missingBaseViews.length === 0 &&
    !result.noColors
  );
}

export interface PublicacionProductoFijoResultado {
  missingPrice: boolean;
  missingPhoto: boolean;
}

export function canPublishProductoFijo(
  result: PublicacionProductoFijoResultado,
): boolean {
  return !result.missingPrice && !result.missingPhoto;
}

/**
 * Regla de publicación de un modelo "Producto fijo" (009-modelos-producto-fijo,
 * FR-002, FR-006): no depende de colores, solo de tener precio y al menos
 * una foto (vista activa con imagen base).
 */
export function checkPublicacionProductoFijo(input: {
  price: string | null;
  viewsWithBaseImage: View[];
}): PublicacionProductoFijoResultado {
  return {
    missingPrice: input.price === null,
    missingPhoto: input.viewsWithBaseImage.length === 0,
  };
}

/**
 * Regla de publicación de un modelo configurable: cada color debe tener su
 * foto para cada vista activa del modelo, para que el cliente nunca elija
 * un color sin imagen en el configurador.
 */
export function checkPublicacion(
  input: PublicacionInput,
): PublicacionResultado {
  const missingBaseViews = input.activeViews.filter(
    (view) => !input.viewsWithBaseImage.includes(view),
  );

  const imageKeys = new Set(
    input.colorImages.map((img) => `${img.colorId}:${img.view}`),
  );

  const missing: MissingCombination[] = [];
  for (const color of input.colors) {
    for (const view of input.activeViews) {
      if (!imageKeys.has(`${color.id}:${view}`)) {
        missing.push({ color: color.nameEs, view });
      }
    }
  }

  return { missing, missingBaseViews, noColors: input.colors.length === 0 };
}
