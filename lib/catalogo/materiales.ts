/**
 * Conjunto cerrado de materiales (Principio I: sin tabla ni pantalla de
 * administración). Sumar uno nuevo es una línea de código y un despliegue.
 * Usado por FR-007, FR-016, FR-019, RN6.
 */
export const MATERIALS = ["fabric", "embroidery_thread", "plastic", "metal"] as const;

export type Material = (typeof MATERIALS)[number];

export const MATERIAL_LABELS: Record<Material, { es: string; en: string }> = {
  fabric: { es: "Tela", en: "Fabric" },
  embroidery_thread: { es: "Hilo de bordado", en: "Embroidery thread" },
  plastic: { es: "Plástico", en: "Plastic" },
  metal: { es: "Metal", en: "Metal" },
};

export function isMaterial(value: string): value is Material {
  return (MATERIALS as readonly string[]).includes(value);
}
