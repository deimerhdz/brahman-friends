/**
 * Ambos idiomas son obligatorios al guardar un atributo traducible
 * (FR-011 a FR-016): antes de la migración esto lo garantizaba `NOT NULL`
 * en `name_es`/`name_en`; ahora que el dato vive en filas, se aplica aquí,
 * en el mismo punto donde antes ya se validaba que no vinieran vacíos.
 */
export function validarNombreTraducido(
  value: unknown,
): { es: string; en: string } | null {
  if (typeof value !== "object" || value === null) return null;
  const { es, en } = value as { es?: unknown; en?: unknown };
  if (typeof es !== "string" || typeof en !== "string") return null;
  const trimmedEs = es.trim();
  const trimmedEn = en.trim();
  if (!trimmedEs || !trimmedEn) return null;
  return { es: trimmedEs, en: trimmedEn };
}
