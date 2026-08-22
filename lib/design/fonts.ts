/** Conjunto curado de tipografías (FR-044). Sin librería: nombres de familias web-safe. */
export const FONTS = [
  { id: "sans-bold", label: "Sans", css: "system-ui, sans-serif" },
  { id: "serif", label: "Serif", css: "Georgia, serif" },
  { id: "condensed-bold", label: "Condensed", css: "'Arial Narrow', sans-serif" },
  { id: "mono", label: "Mono", css: "'Courier New', monospace" },
] as const;

export function fontCss(fontId: string): string {
  return FONTS.find((f) => f.id === fontId)?.css ?? FONTS[0].css;
}
