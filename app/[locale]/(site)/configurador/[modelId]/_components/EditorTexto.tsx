"use client";

import type { Locale } from "@/lib/i18n/t";
import type { ModelManifest } from "@/lib/catalogo/model-manifest";
import { FONTS } from "@/lib/design/fonts";

/** Elemento de texto: contenido, tipografía, color y tamaño (FR-044). */
export function EditorTexto({
  locale,
  content,
  font,
  colorId,
  maxChars,
  colors,
  onChange,
  labels,
}: {
  locale: Locale;
  content: string;
  font: string;
  colorId: string;
  maxChars: number;
  colors: ModelManifest["colors"];
  onChange: (patch: { content?: string; font?: string; colorId?: string }) => void;
  labels: Record<string, string>;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="flex flex-col gap-1">
        <span>
          {labels.content} ({content.length}/{maxChars})
        </span>
        <input
          value={content}
          maxLength={maxChars}
          onChange={(e) => onChange({ content: e.target.value })}
          className="rounded border border-gray-300 px-2 py-1"
        />
      </label>
      <label className="flex flex-col gap-1">
        <span>{labels.font}</span>
        <select
          value={font}
          onChange={(e) => onChange({ font: e.target.value })}
          className="rounded border border-gray-300 px-2 py-1"
        >
          {FONTS.map((f) => (
            <option key={f.id} value={f.id} style={{ fontFamily: f.css }}>
              {f.label}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1">
        <span>{labels.color}</span>
        <select
          value={colorId}
          onChange={(e) => onChange({ colorId: e.target.value })}
          className="rounded border border-gray-300 px-2 py-1"
        >
          {colors.map((c) => (
            <option key={c.id} value={c.id}>
              {locale === "es" ? c.nameEs : c.nameEn}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
