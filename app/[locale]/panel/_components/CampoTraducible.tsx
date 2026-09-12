"use client";

import { useState } from "react";
import type { Locale } from "@/lib/i18n/t";
import { RichTextEditor } from "./RichTextEditor";

export interface ValorTraducido {
  es: string;
  en: string;
}

/**
 * Un único campo por atributo traducible, con un switch ES/EN que decide
 * qué idioma se lee o escribe en este momento (FR-013, FR-014). El valor
 * de ambos idiomas vive en memoria mientras el formulario está abierto, así
 * que cambiar el switch nunca pierde lo ya escrito del otro (FR-015).
 */
export function CampoTraducible({
  label,
  value,
  onChange,
  multiline = false,
  richText = false,
  required = false,
  defaultLocale,
  switchLabels,
  placeholder,
}: {
  label: string;
  value: ValorTraducido;
  onChange: (value: ValorTraducido) => void;
  multiline?: boolean;
  /** Reemplaza el `<textarea>` por un editor de texto enriquecido
   * (009-modelos-producto-fijo). Solo tiene efecto junto con `multiline`. */
  richText?: boolean;
  required?: boolean;
  defaultLocale: Locale;
  switchLabels: { es: string; en: string };
  placeholder?: string;
}) {
  const [active, setActive] = useState<Locale>(defaultLocale);

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span>{label}</span>
        <div role="group" aria-label={label} className="flex gap-1 text-xs">
          {(["es", "en"] as const).map((locale) => (
            <button
              key={locale}
              type="button"
              onClick={() => setActive(locale)}
              aria-pressed={active === locale}
              className={`rounded px-2 py-0.5 ${
                active === locale
                  ? "bg-brand text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {switchLabels[locale]}
            </button>
          ))}
        </div>
      </div>
      {multiline && richText ? (
        <RichTextEditor
          editorKey={active}
          value={value[active]}
          onChange={(html) => onChange({ ...value, [active]: html })}
          placeholder={placeholder}
        />
      ) : multiline ? (
        <textarea
          value={value[active]}
          onChange={(e) => onChange({ ...value, [active]: e.target.value })}
          required={required && active === defaultLocale}
          className="rounded border border-gray-300 px-3 py-2"
        />
      ) : (
        <input
          value={value[active]}
          onChange={(e) => onChange({ ...value, [active]: e.target.value })}
          required={required && active === defaultLocale}
          className="rounded border border-gray-300 px-3 py-2"
        />
      )}
    </div>
  );
}
