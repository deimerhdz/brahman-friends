"use client";

import type { Locale } from "@/lib/i18n/t";
import type { ModelManifest } from "@/lib/catalogo/model-manifest";

/** Selector de color por componente (FR-020, FR-021, FR-022, RN10). */
export function SelectorColor({
  locale,
  component,
  selectedColorId,
  onSelect,
  labels,
}: {
  locale: Locale;
  component: ModelManifest["components"][number];
  selectedColorId: string | undefined;
  onSelect: (colorId: string) => void;
  labels: { approximate: string };
}) {
  const availableColors = component.colors;

  return (
    <div>
      <h3 className="mb-2 text-sm font-medium">
        {locale === "es" ? component.nameEs : component.nameEn}
      </h3>
      <div className="flex flex-wrap gap-2">
        {availableColors.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => onSelect(c.id)}
            aria-pressed={c.id === selectedColorId}
            className={`rounded border px-3 py-2 text-xs ${
              c.id === selectedColorId
                ? "border-brand ring-2 ring-brand"
                : "border-gray-200"
            }`}
            title={locale === "es" ? c.nameEs : c.nameEn}
          >
            <span className="max-w-[6rem] truncate">
              {locale === "es" ? c.nameEs : c.nameEn}
            </span>
          </button>
        ))}
      </div>
      <p className="mt-1 text-xs text-gray-500">{labels.approximate}</p>
    </div>
  );
}
