"use client";

import type { Locale } from "@/lib/i18n/t";
import type { ModelManifest } from "@/lib/catalogo/model-manifest";

/** Selector del color de la gorra: miniatura (vista frontal) por color (FR-020, FR-021, FR-022, RN10). */
export function SelectorColor({
  locale,
  colors,
  selectedColorId,
  onSelect,
  labels,
}: {
  locale: Locale;
  colors: ModelManifest["colors"];
  selectedColorId: string | undefined;
  onSelect: (colorId: string) => void;
  labels: { approximate: string };
}) {
  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {colors.map((c) => {
          const name = locale === "es" ? c.nameEs : c.nameEn;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onSelect(c.id)}
              aria-pressed={c.id === selectedColorId}
              aria-label={name}
              title={name}
              className={`flex h-16 w-16 items-center justify-center overflow-hidden rounded border p-1 ${
                c.id === selectedColorId
                  ? "border-brand ring-2 ring-brand"
                  : "border-gray-200"
              }`}
            >
              <span className="flex h-full w-full items-center justify-center overflow-hidden rounded bg-gray-100">
                {c.images.front ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={c.images.front}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-[10px] text-gray-400">{name.charAt(0)}</span>
                )}
              </span>
            </button>
          );
        })}
      </div>
      <p className="mt-1 text-xs text-gray-500">{labels.approximate}</p>
    </div>
  );
}
