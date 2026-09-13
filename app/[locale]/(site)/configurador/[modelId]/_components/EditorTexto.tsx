"use client";

import { useEffect, useState } from "react";
import { FONTS } from "@/lib/design/fonts";

const HEX_RE = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
const RGB_RE = /^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(?:,\s*[\d.]+\s*)?\)$/i;

/** Acepta "#rgb", "#rrggbb" o "rgb(r, g, b)" / "rgba(r, g, b, a)" y devuelve siempre un hex de 6 dígitos, o null si no es un color válido. */
function normalizeToHex(value: string): string | null {
  const trimmed = value.trim();
  if (HEX_RE.test(trimmed)) {
    if (trimmed.length === 4) {
      const [, r, g, b] = trimmed;
      return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
    }
    return trimmed.toLowerCase();
  }
  const rgbMatch = trimmed.match(RGB_RE);
  if (rgbMatch) {
    const [, r, g, b] = rgbMatch;
    const toHex = (n: string) => Math.min(255, Number(n)).toString(16).padStart(2, "0");
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }
  return null;
}

/** Elemento de texto: contenido, tipografía, color y tamaño (FR-044). */
export function EditorTexto({
  content,
  font,
  color,
  maxChars,
  onChange,
  labels,
}: {
  content: string;
  font: string;
  color: string;
  maxChars: number;
  onChange: (patch: { content?: string; font?: string; color?: string }) => void;
  labels: Record<string, string>;
}) {
  const [colorText, setColorText] = useState(color);

  // Si el color cambia desde afuera (p. ej. el swatch nativo), refleja el
  // valor normalizado en el campo de texto.
  useEffect(() => {
    setColorText(color);
  }, [color]);

  function handleColorTextChange(value: string) {
    setColorText(value);
    const hex = normalizeToHex(value);
    if (hex) onChange({ color: hex });
  }

  const swatchValue = normalizeToHex(color) ?? "#000000";

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
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={swatchValue}
            onChange={(e) => handleColorTextChange(e.target.value)}
            aria-label={labels.color}
            className="h-9 w-9 shrink-0 cursor-pointer rounded border border-gray-300 p-0"
          />
          <input
            type="text"
            value={colorText}
            onChange={(e) => handleColorTextChange(e.target.value)}
            placeholder="#111827 o rgb(17, 24, 39)"
            className="flex-1 rounded border border-gray-300 px-2 py-1"
          />
        </div>
      </label>
    </div>
  );
}
