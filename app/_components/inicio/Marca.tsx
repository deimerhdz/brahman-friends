/**
 * Logotipo del sitio público (011-rediseno-paleta-inicio, FR-009): el subido
 * en Ajustes si existe; si no, la versión de marca de `public/` que
 * corresponde a cada lugar — `logotipo.jpeg` en el encabezado y
 * `logotipo-footer.png` en el pie.
 */
export function Marca({
  logoUrl,
  siteName,
  variante,
}: {
  logoUrl: string | null;
  siteName: string;
  variante: "encabezado" | "pie";
}) {
  if (variante === "pie") {
    // El "BRAHMAN" azul marino del logo no se lee sobre el pie azul marino:
    // va sobre una placa crema para conservar sus colores originales.
    return (
      <span className="inline-block rounded-lg bg-surface px-4 py-3">
        {/* El logo de Ajustes puede venir de cualquier almacenamiento: <img> evita depender de remotePatterns. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoUrl ?? "/logotipo-footer.png"}
          alt={siteName}
          className="h-14 w-auto object-contain"
        />
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={logoUrl ?? "/logotipo.jpeg"}
      alt={siteName}
      // El JPEG tiene fondo blanco: multiply lo funde con el crema del encabezado.
      className="h-14 w-auto object-contain mix-blend-multiply lg:h-16"
    />
  );
}
