"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n/t";
import {
  CampoTraducible,
  type ValorTraducido,
} from "@/app/[locale]/panel/_components/CampoTraducible";
import { ColorImagenes } from "./ColorImagenes";

type View = "front" | "left" | "right" | "back";

interface ColorRow {
  id: string;
  nameEs: string;
  nameEn: string;
}

/**
 * Paso 2 del wizard: colores y sus fotos. Cada tarjeta es un color del
 * modelo (variante) con la foto de la gorra completa por cada vista activa.
 */
export function PasoColores({
  locale,
  modelId,
  colors,
  defaultColorId,
  activeViews,
  colorImages,
  labels,
  previewColorId,
  onPreviewColor,
}: {
  locale: Locale;
  modelId: string;
  colors: ColorRow[];
  defaultColorId: string | null;
  activeViews: View[];
  colorImages: Record<string, Partial<Record<View, string>>>;
  labels: Record<string, string>;
  previewColorId: string | null;
  onPreviewColor: (colorId: string) => void;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [newColorName, setNewColorName] = useState<ValorTraducido>({
    es: "",
    en: "",
  });
  const [savingColor, setSavingColor] = useState(false);

  async function setDefaultVariant(colorId: string) {
    onPreviewColor(colorId);
    setError(null);
    const response = await fetch(`/api/panel/modelos/${modelId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ defaultColorId: colorId }),
    });
    if (!response.ok) {
      setError(labels.error);
      return;
    }
    router.refresh();
  }

  async function deleteColor(colorId: string) {
    if (!window.confirm(labels.confirmDeleteColor)) return;
    setError(null);
    const response = await fetch(`/api/panel/colores/${colorId}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      setError(labels.error);
      return;
    }
    router.refresh();
  }

  async function createColor(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!newColorName.es.trim() || !newColorName.en.trim()) {
      setError(labels.translationRequired);
      return;
    }
    setSavingColor(true);
    setError(null);
    const response = await fetch(`/api/panel/modelos/${modelId}/colores`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newColorName }),
    });
    setSavingColor(false);
    if (!response.ok) {
      setError(labels.error);
      return;
    }
    setNewColorName({ es: "", en: "" });
    router.refresh();
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-headline-md text-[13px] font-bold uppercase tracking-wider text-on-surface">
            {labels.stepColors}
          </h2>
          <p className="mt-0.5 font-body-md text-[11px] text-on-surface-variant">
            {labels.stepColorsHint}
          </p>
        </div>
        <span className="material-symbols-outlined text-lg text-on-surface-variant">
          palette
        </span>
      </div>

      <div className="flex items-start gap-2.5 rounded-xl border border-[#F5E39A] bg-[#FFF8E1] p-3">
        <span className="material-symbols-outlined mt-0.5 shrink-0 text-base text-[#8D6E00]">
          star
        </span>
        <div className="text-xs leading-relaxed text-on-surface">
          <p className="flex items-center gap-1 font-bold text-[#8D6E00]">
            {labels.defaultVariant}
          </p>
          <p className="mt-0.5 text-[11px] text-on-surface-variant">
            {labels.defaultVariantHint}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <span className="font-body-md text-body-md font-semibold text-on-surface">
          {labels.configuredColors} ({colors.length})
        </span>

        {colors.map((c) => {
          const name = locale === "es" ? c.nameEs : c.nameEn;
          const isDefault = defaultColorId === c.id;
          const isPreviewed = previewColorId === c.id;
          return (
            <div
              key={c.id}
              className={
                isDefault
                  ? "space-y-3 rounded-xl border-2 border-on-surface bg-surface-container-lowest p-3.5 ambient-shadow"
                  : "space-y-3 rounded-xl border border-outline-variant/60 bg-surface-container-lowest p-3.5 transition-colors hover:border-outline-variant"
              }
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onPreviewColor(c.id)}
                    title={labels.preview}
                    aria-pressed={isPreviewed}
                    className={
                      isPreviewed
                        ? "flex h-7 w-7 items-center justify-center rounded-full border border-primary bg-primary/10 text-primary"
                        : "flex h-7 w-7 items-center justify-center rounded-full border border-outline-variant text-on-surface-variant transition-colors hover:border-primary hover:text-primary"
                    }
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      visibility
                    </span>
                  </button>
                  <label className="font-body-md text-body-md font-bold text-on-surface">
                    {name}
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  {isDefault ? (
                    <span className="flex items-center gap-0.5 rounded-full border border-[#F5E39A] bg-[#FFF8E1] px-2 py-0.5 text-[10px] font-bold text-[#8D6E00]">
                      <span className="material-symbols-outlined text-[11px]">
                        grade
                      </span>
                      {labels.defaultVariant}
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setDefaultVariant(c.id)}
                      className="flex items-center gap-1 rounded border border-outline-variant px-2 py-1 font-label-caps text-label-caps text-on-surface-variant transition-colors hover:border-primary hover:text-primary"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        grade
                      </span>
                      {labels.markDefault}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => deleteColor(c.id)}
                    className="flex items-center gap-1 rounded border border-outline-variant px-2 py-1 font-label-caps text-label-caps text-error transition-colors hover:border-error"
                  >
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                    {labels.deleteColor}
                  </button>
                </div>
              </div>

              <div className="pl-6">
                <ColorImagenes
                  modelId={modelId}
                  colorId={c.id}
                  activeViews={activeViews}
                  images={colorImages[c.id] ?? {}}
                  labels={labels}
                />
              </div>
            </div>
          );
        })}

        <form
          onSubmit={createColor}
          className="flex flex-wrap items-end gap-3 rounded-xl border border-dashed border-outline-variant bg-surface-container-low p-3.5"
        >
          <div className="flex-1">
            <CampoTraducible
              label={labels.addColor}
              value={newColorName}
              onChange={setNewColorName}
              required
              defaultLocale={locale}
              switchLabels={{ es: labels.switchEs, en: labels.switchEn }}
            />
          </div>
          <button
            type="submit"
            disabled={savingColor}
            className="flex items-center gap-1 rounded bg-on-surface px-4 py-2 font-button text-button text-on-primary transition-colors duration-200 hover:bg-primary disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            {labels.addColor}
          </button>
        </form>
      </div>

      {error && <p className="font-body-md text-body-md text-error">{error}</p>}
    </div>
  );
}
