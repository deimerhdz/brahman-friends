"use client";

import type { Locale } from "@/lib/i18n/t";
import type { ModelManifest } from "@/lib/catalogo/model-manifest";

/** Técnica de decoración, única para todo el diseño (FR-047, RN14). */
export function SelectorTecnica({
  locale,
  techniques,
  selected,
  onSelect,
  label,
}: {
  locale: Locale;
  techniques: ModelManifest["techniques"];
  selected: string | null;
  onSelect: (techniqueId: string) => void;
  label: string;
}) {
  if (techniques.length === 0) return null;
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span>{label}</span>
      <select
        value={selected ?? ""}
        onChange={(e) => onSelect(e.target.value)}
        className="rounded border border-gray-300 px-2 py-1"
      >
        <option value="" disabled>
          {label}
        </option>
        {techniques.map((t) => (
          <option key={t.id} value={t.id}>
            {locale === "es" ? t.nameEs : t.nameEn}
          </option>
        ))}
      </select>
    </label>
  );
}
