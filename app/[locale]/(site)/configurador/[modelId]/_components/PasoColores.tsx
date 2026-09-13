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
  colorId,
  onSelect,
  labels,
}: {
  locale: Locale;
  manifest: ModelManifest;
  colorId: string | null;
  onSelect: (colorId: string) => void;
  labels: { approximate: string };
}) {
  return (
    <div className="flex flex-col gap-6">
      <SelectorColor
        locale={locale}
        colors={manifest.colors}
        selectedColorId={colorId ?? undefined}
        onSelect={onSelect}
        labels={labels}
      />
    </div>
  );
}
