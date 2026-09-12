import DOMPurify from "isomorphic-dompurify";

/**
 * Limpia el HTML del editor de texto enriquecido de la descripción de un
 * modelo antes de guardarlo (009-modelos-producto-fijo): se sanea una sola
 * vez, al guardar, siguiendo el mismo criterio que ya usa `sanitize-svg.ts`
 * para no volver a confiar en contenido ya limpio en cada lectura. Lista de
 * etiquetas mínima: solo lo que produce el editor (negrita, cursiva,
 * subrayado, color de texto, alineación, listas), nada de scripts, iframes
 * ni imágenes.
 */
export function sanitizeDescriptionHtml(input: string): string {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ["p", "br", "b", "strong", "i", "em", "u", "ul", "ol", "li", "span", "div", "h3"],
    ALLOWED_ATTR: ["style"],
  });
}
