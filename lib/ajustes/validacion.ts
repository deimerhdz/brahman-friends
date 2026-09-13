/** Nombre del sitio requerido en ambos idiomas (FR-003, Principio II). */
export function validarAjustesBasicos(input: {
  siteNameEs: unknown;
  siteNameEn: unknown;
}): boolean {
  return (
    typeof input.siteNameEs === "string" &&
    input.siteNameEs.trim().length > 0 &&
    typeof input.siteNameEn === "string" &&
    input.siteNameEn.trim().length > 0
  );
}

/** Dirección web válida para un enlace de red social (FR-013). */
export function validarUrlRedSocial(url: unknown): boolean {
  if (typeof url !== "string" || url.trim() === "") return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}
