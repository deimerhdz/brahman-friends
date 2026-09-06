import type { Material } from "@/lib/catalogo/materiales";

/**
 * Qué falta para publicar un modelo (FR-012, RN2, RN9). Función pura: la
 * ruta que la usa arma estas estructuras a partir de la base de datos.
 */

export type View = "front" | "side" | "back";

export interface PublicacionComponente {
  id: string;
  nameEs: string;
  nameEn: string;
  material: Material | string;
  customizable: boolean;
  defaultColorId: string | null;
}

export interface PublicacionColor {
  id: string;
  nameEs: string;
  nameEn: string;
}

export interface PublicacionInput {
  activeViews: View[];
  viewsWithBaseImage: View[];
  components: PublicacionComponente[];
  /** Colores habilitados por componente, vista por vista (FR-019). */
  componentColors: { componentId: string; colorId: string; view: View }[];
  colors: PublicacionColor[];
  /** Imágenes ya cargadas por componente/color/vista. */
  images: { componentId: string; colorId: string; view: View }[];
}

export interface MissingCombination {
  component: string;
  color: string;
  view: View;
}

export interface PublicacionResultado {
  missing: MissingCombination[];
  missingBaseViews: View[];
  componentsWithoutColors: string[];
}

export function canPublish(result: PublicacionResultado): boolean {
  return (
    result.missing.length === 0 &&
    result.missingBaseViews.length === 0 &&
    result.componentsWithoutColors.length === 0
  );
}

export function checkPublicacion(
  input: PublicacionInput,
): PublicacionResultado {
  const colorsById = new Map(input.colors.map((c) => [c.id, c]));
  const imageKeys = new Set(
    input.images.map((img) => `${img.componentId}:${img.colorId}:${img.view}`),
  );

  const missingBaseViews = input.activeViews.filter(
    (view) => !input.viewsWithBaseImage.includes(view),
  );

  const missing: MissingCombination[] = [];
  const componentsWithoutColors: string[] = [];

  for (const component of input.components) {
    if (!component.customizable) continue;

    const enabledColorIds = [
      ...new Set(
        input.componentColors
          .filter((cc) => cc.componentId === component.id)
          .map((cc) => cc.colorId),
      ),
    ];

    const enabledColors = enabledColorIds
      .map((id) => colorsById.get(id))
      .filter((c): c is PublicacionColor => !!c);

    const defaultIsUsable =
      !!component.defaultColorId &&
      enabledColorIds.includes(component.defaultColorId) &&
      colorsById.has(component.defaultColorId);

    if (enabledColors.length === 0 || !defaultIsUsable) {
      componentsWithoutColors.push(component.nameEs);
      continue;
    }

    for (const colorId of enabledColorIds) {
      const c = colorsById.get(colorId);
      if (!c) continue;
      const requiredViews = input.componentColors
        .filter(
          (cc) => cc.componentId === component.id && cc.colorId === colorId,
        )
        .map((cc) => cc.view)
        // defensivo: ignora vistas que ya no están activas en el modelo
        .filter((view) => input.activeViews.includes(view));
      for (const view of requiredViews) {
        if (!imageKeys.has(`${component.id}:${colorId}:${view}`)) {
          missing.push({ component: component.nameEs, color: c.nameEs, view });
        }
      }
    }
  }

  return { missing, missingBaseViews, componentsWithoutColors };
}
