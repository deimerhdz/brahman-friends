import DOMPurify from "isomorphic-dompurify";

/**
 * Limpia un SVG antes de guardarlo (FR-037a, FR-037b; research.md, decisión
 * 10). Se usa la librería estándar de la industria en vez de una expresión
 * regular propia: los vectores de ataque de SVG (entidades, referencias
 * externas, atributos de evento) son demasiados para cubrirlos a mano.
 */
export function sanitizeSvg(input: string): {
  sanitized: string;
  valid: boolean;
} {
  const sanitized = DOMPurify.sanitize(input, {
    USE_PROFILES: { svg: true, svgFilters: true },
  });

  // Si tras la limpieza no queda un <svg> con contenido dibujable, se
  // rechaza pidiendo otro formato (FR-037a).
  const hasSvgRoot = /<svg[\s>]/i.test(sanitized);
  const hasDrawableContent =
    /<(path|circle|rect|line|polyline|polygon|ellipse|text|image|use)[\s/>]/i.test(
      sanitized,
    );

  return { sanitized, valid: hasSvgRoot && hasDrawableContent };
}
