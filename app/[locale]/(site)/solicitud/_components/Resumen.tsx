import type { Locale } from "@/lib/i18n/t";
import type { ModelManifest } from "@/lib/catalogo/model-manifest";
import type { Decoration } from "@/lib/design/borrador";
import type { SizeQuantity } from "@/lib/solicitud/tallas";

/**
 * Resumen con modelo, color por componente, elementos decorativos, técnica,
 * cantidad y tallas, y el aviso de que enviar no genera precio ni compromiso
 * de venta (FR-049, RN18, SC-018).
 */
export function Resumen({
  locale,
  manifest,
  colors,
  decorations,
  technique,
  quantity,
  sizes,
  labels,
}: {
  locale: Locale;
  manifest: ModelManifest;
  colors: Record<string, string>;
  decorations: Decoration[];
  technique: string | null;
  quantity: number;
  sizes: SizeQuantity[];
  labels: Record<string, string>;
}) {
  const techniqueLabel = manifest.techniques.find((t) => t.id === technique);

  return (
    <div className="flex flex-col gap-3 rounded border border-gray-200 p-4 text-sm">
      <p className="font-medium">
        {locale === "es" ? manifest.model.nameEs : manifest.model.nameEn}
      </p>

      <div>
        <p className="text-gray-500">{labels.colors}</p>
        <ul className="list-inside list-disc">
          {manifest.components
            .filter((c) => c.customizable)
            .map((c) => {
              const color = c.colors.find((col) => col.id === colors[c.id]);
              return (
                <li key={c.id}>
                  {locale === "es" ? c.nameEs : c.nameEn}:{" "}
                  {color ? (locale === "es" ? color.nameEs : color.nameEn) : "—"}
                </li>
              );
            })}
        </ul>
      </div>

      {decorations.length > 0 && (
        <div>
          <p className="text-gray-500">{labels.decorations}</p>
          <ul className="list-inside list-disc">
            {decorations.map((d, i) => (
              <li key={i}>
                {labels[`zone_${d.zone}`]} — {d.kind === "logo" ? labels.logo : labels.text} (
                {d.widthCm.toFixed(1)}×{d.heightCm.toFixed(1)} cm)
              </li>
            ))}
          </ul>
        </div>
      )}

      {techniqueLabel && (
        <p>
          <span className="text-gray-500">{labels.technique}: </span>
          {locale === "es" ? techniqueLabel.nameEs : techniqueLabel.nameEn}
        </p>
      )}

      <p>
        <span className="text-gray-500">{labels.quantity}: </span>
        {quantity}
      </p>

      <ul className="list-inside list-disc">
        {sizes.map((s) => (
          <li key={s.label}>
            {s.label}: {s.quantity}
          </li>
        ))}
      </ul>

      <p className="rounded bg-yellow-50 p-2 text-yellow-800">{labels.noPriceWarning}</p>
    </div>
  );
}
