/**
 * Convenio de nombre de archivo para la carga masiva: `vista_componente_color.ext`
 * (research.md, decisión 14). El componente y el color se identifican por una
 * versión "slug" de su nombre en español (minúsculas, sin acentos, espacios
 * como guiones), para que el administrador pueda nombrar los archivos a mano
 * sin depender de identificadores internos.
 */

const VIEWS = ["front", "side", "back"] as const;
type View = (typeof VIEWS)[number];

const DIACRITICS = /[\u0300-\u036f]/g;

export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(DIACRITICS, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-+|-+$)/g, "");
}

export interface ParsedFilename {
  view: View;
  componentSlug: string;
  colorSlug: string;
}

export function parseImageFilename(filename: string): ParsedFilename | null {
  const stem = filename.replace(/\.[^./]+$/, "");
  const firstUnderscore = stem.indexOf("_");
  if (firstUnderscore === -1) return null;
  const view = stem.slice(0, firstUnderscore);
  const rest = stem.slice(firstUnderscore + 1);
  const secondUnderscore = rest.indexOf("_");
  if (secondUnderscore === -1) return null;
  const componentSlug = rest.slice(0, secondUnderscore);
  const colorSlug = rest.slice(secondUnderscore + 1);
  if (!componentSlug || !colorSlug) return null;
  if (!(VIEWS as readonly string[]).includes(view)) return null;
  return { view: view as View, componentSlug, colorSlug };
}

export function matchBySlug<T extends { nameEs: string }>(
  slug: string,
  candidates: readonly T[],
): T | undefined {
  return candidates.find((c) => slugify(c.nameEs) === slug);
}
