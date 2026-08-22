/**
 * La suma por tallas debe igualar la cantidad total (FR-048, RN17). Se valida
 * en el navegador para avisar en el momento y otra vez en el servidor antes
 * de registrar (data-model.md, "Reglas de validación").
 */

export interface SizeQuantity {
  label: string;
  quantity: number;
}

export function totalOf(sizes: readonly SizeQuantity[]): number {
  return sizes.reduce((sum, s) => sum + s.quantity, 0);
}

export function sizesMatchQuantity(
  sizes: readonly SizeQuantity[],
  quantity: number,
): boolean {
  if (sizes.length === 0) return false;
  if (sizes.some((s) => s.quantity <= 0)) return false;
  return totalOf(sizes) === quantity;
}

/** Las tallas usadas deben ser tallas del modelo, sin repetirse. */
export function sizesAreValidForModel(
  sizes: readonly SizeQuantity[],
  modelSizeLabels: readonly string[],
): boolean {
  const labels = sizes.map((s) => s.label);
  const uniqueLabels = new Set(labels);
  if (uniqueLabels.size !== labels.length) return false;
  return labels.every((label) => modelSizeLabels.includes(label));
}
