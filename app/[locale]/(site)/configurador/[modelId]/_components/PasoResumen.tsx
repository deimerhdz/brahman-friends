"use client";

import type { Locale } from "@/lib/i18n/t";
import type { ModelManifest } from "@/lib/catalogo/model-manifest";
import type { Draft } from "@/lib/design/borrador";

/**
 * Último paso del configurador: resumen de color por componente y
 * logo/texto elegidos (FR-019), más el control de cantidad con el mínimo
 * MOQ del modelo (FR-011). El botón "Solicitar cotización" vive en el pie
 * del `Stepper`, no acá.
 */
export function PasoResumen({
  locale,
  manifest,
  draft,
  quantity,
  minQuantity,
  onQuantityChange,
  labels,
}: {
  locale: Locale;
  manifest: ModelManifest;
  draft: Draft;
  quantity: number;
  minQuantity: number;
  onQuantityChange: (quantity: number) => void;
  labels: Record<string, string>;
}) {
  const componentSummaries = manifest.components
    .filter((c) => c.customizable)
    .map((comp) => {
      const color = comp.colors.find((c) => c.id === draft.colors[comp.id]);
      return {
        id: comp.id,
        componentName: locale === "es" ? comp.nameEs : comp.nameEn,
        colorName: color ? (locale === "es" ? color.nameEs : color.nameEn) : "—",
      };
    });

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded border border-outline-variant bg-surface-container p-4">
        <h3 className="mb-2 font-body-md text-body-md font-semibold text-on-surface">
          {labels.title}
        </h3>
        <ul className="space-y-2 text-sm text-on-surface-variant">
          {componentSummaries.map((c) => (
            <li key={c.id}>
              <strong>{c.componentName}:</strong> {c.colorName}
            </li>
          ))}
          <li>
            <strong>{labels.decoration}:</strong>{" "}
            {draft.decorations.length === 0
              ? labels.noDecoration
              : draft.decorations
                  .map((d) => (d.kind === "logo" ? labels.logo : `"${d.content}"`))
                  .join(", ")}
          </li>
        </ul>
      </div>

      <div className="flex items-center justify-between gap-4">
        <span className="font-label-caps text-label-caps text-on-surface-variant">
          {labels.quantity} (MOQ {minQuantity})
        </span>
        <div className="flex items-center overflow-hidden rounded border border-outline-variant bg-surface">
          <button
            type="button"
            onClick={() => onQuantityChange(Math.max(minQuantity, quantity - 1))}
            className="flex items-center justify-center border-r border-outline-variant p-2 transition-colors hover:bg-surface-variant"
          >
            <span className="material-symbols-outlined text-sm">remove</span>
          </button>
          <input
            type="number"
            min={minQuantity}
            value={quantity}
            onChange={(e) => {
              const next = Number.parseInt(e.target.value, 10);
              onQuantityChange(Number.isNaN(next) ? minQuantity : Math.max(minQuantity, next));
            }}
            className="w-16 border-none bg-transparent text-center font-medium text-on-surface focus:ring-0"
          />
          <button
            type="button"
            onClick={() => onQuantityChange(quantity + 1)}
            className="flex items-center justify-center border-l border-outline-variant p-2 transition-colors hover:bg-surface-variant"
          >
            <span className="material-symbols-outlined text-sm">add</span>
          </button>
        </div>
      </div>
    </div>
  );
}
