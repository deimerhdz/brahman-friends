"use client";

import type { Locale } from "@/lib/i18n/t";
import type { ModelManifest } from "@/lib/catalogo/model-manifest";
import { SelectorColor } from "./SelectorColor";

/**
 * Paso 1 del configurador: una paleta en cuadrícula de swatches por cada
 * componente personalizable (spec.md Clarifications — no una paleta global).
 * Envuelve `SelectorColor.tsx` existente sin cambiar su comportamiento
 * (FR-016 a FR-030 de 001-configurador-gorras).
 */
export function PasoColores({
  locale,
  manifest,
  colors,
  onSelect,
  labels,
}: {
  locale: Locale;
  manifest: ModelManifest;
  colors: Record<string, string>;
  onSelect: (componentId: string, colorId: string) => void;
  labels: { approximate: string };
}) {
  return (
    <div className="flex flex-col gap-6">
      {manifest.components
        .filter((c) => c.customizable)
        .map((comp) => (
          <SelectorColor
            key={comp.id}
            locale={locale}
            component={comp}
            selectedColorId={colors[comp.id]}
            onSelect={(colorId) => onSelect(comp.id, colorId)}
            labels={labels}
          />
        ))}
    </div>
  );
}
