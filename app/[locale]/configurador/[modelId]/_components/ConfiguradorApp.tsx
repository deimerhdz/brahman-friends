"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Locale } from "@/lib/i18n/t";
import type { ModelManifest } from "@/lib/catalogo/model-manifest";
import {
  createEmptyDraft,
  loadDraft,
  saveDraft,
  type Decoration,
  type Draft,
} from "@/lib/design/borrador";
import { canPlaceDecoration } from "@/lib/design/rules";
import { CapasGorra, type DisplayView } from "./CapasGorra";
import { Decoracion } from "./Decoracion";
import { PanelDecoracion } from "./PanelDecoracion";
import { SelectorColor } from "./SelectorColor";
import { SelectorTecnica } from "./SelectorTecnica";
import { Vistas } from "./Vistas";
import { Restablecer } from "./Restablecer";
import { AvisoDisponibilidad } from "./AvisoDisponibilidad";
import { BarraControles } from "./BarraControles";
import { usePrecarga } from "./Precarga";

function defaultColorsOf(manifest: ModelManifest): Record<string, string> {
  const colors: Record<string, string> = {};
  for (const comp of manifest.components) {
    if (!comp.customizable) continue;
    const def = comp.colors.find((c) => c.id === comp.defaultColorId) ?? comp.colors[0];
    if (def) colors[comp.id] = def.id;
  }
  return colors;
}

export function ConfiguradorApp({
  locale,
  manifest,
  maxDecoratedZones,
  labels,
}: {
  locale: Locale;
  manifest: ModelManifest;
  maxDecoratedZones: number;
  labels: Record<string, string>;
}) {
  const [draft, setDraft] = useState<Draft>(() => {
    const existing = loadDraft(manifest.model.id);
    return existing ?? createEmptyDraft(manifest.model.id, defaultColorsOf(manifest));
  });
  const [view, setView] = useState<DisplayView>("front");
  const [unavailable, setUnavailable] = useState<string[]>([]);

  // Al abrir, valida que los colores del borrador sigan disponibles (FR-033, SC-009).
  useEffect(() => {
    const defaults = defaultColorsOf(manifest);
    const fixed: string[] = [];
    const nextColors = { ...draft.colors };
    for (const comp of manifest.components) {
      if (!comp.customizable) continue;
      const colorId = nextColors[comp.id];
      const color = comp.colors.find((c) => c.id === colorId);
      if (!colorId || !color || color.status !== "available") {
        nextColors[comp.id] = defaults[comp.id];
        fixed.push(locale === "es" ? comp.nameEs : comp.nameEn);
      }
    }
    if (fixed.length > 0) {
      setUnavailable(fixed);
      setDraft((d) => ({ ...d, colors: nextColors }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [manifest.model.id]);

  useEffect(() => {
    saveDraft(draft);
  }, [draft]);

  const priorityUrls = useMemo(() => {
    const urls: string[] = [];
    for (const comp of manifest.components) {
      for (const c of comp.colors) {
        const url = c.images.front;
        if (url) urls.push(url);
      }
    }
    return urls;
  }, [manifest]);

  usePrecarga(manifest, priorityUrls);

  const aspectRatio =
    manifest.model.imageWidth && manifest.model.imageHeight
      ? manifest.model.imageWidth / manifest.model.imageHeight
      : 1;

  function selectColor(componentId: string, colorId: string) {
    setDraft((d) => ({ ...d, colors: { ...d.colors, [componentId]: colorId } }));
  }

  function reset() {
    setDraft(createEmptyDraft(manifest.model.id, defaultColorsOf(manifest)));
  }

  function addDecoration(decoration: Decoration): boolean {
    const placement = canPlaceDecoration(
      draft.decorations.map((d) => d.zone),
      decoration.zone,
      maxDecoratedZones,
    );
    if (!placement.allowed) return false;
    setDraft((d) => ({ ...d, decorations: [...d.decorations, decoration] }));
    return true;
  }

  function updateDecoration(index: number, patch: Partial<Decoration>) {
    setDraft((d) => ({
      ...d,
      decorations: d.decorations.map((dec, i) =>
        i === index ? ({ ...dec, ...patch } as Decoration) : dec,
      ),
    }));
  }

  function removeDecoration(index: number) {
    setDraft((d) => ({
      ...d,
      decorations: d.decorations.filter((_, i) => i !== index),
    }));
  }

  return (
    <div className="flex flex-col gap-4 pb-4">
      <AvisoDisponibilidad
        componentNames={unavailable}
        labels={{ title: labels.unavailableTitle }}
      />

      <div className="relative w-full overflow-hidden" style={{ aspectRatio }}>
        <CapasGorra manifest={manifest} colors={draft.colors} view={view} />
        <Decoracion
          manifest={manifest}
          view={view}
          decorations={draft.decorations}
          onChange={updateDecoration}
          onRemove={removeDecoration}
          labels={{ remove: labels.removeElement, resize: labels.resize }}
        />
      </div>

      <Vistas
        manifest={manifest}
        current={view}
        onChange={setView}
        labels={{
          previous: labels.previousView,
          next: labels.nextView,
          view_front: labels.viewFront,
          view_side: labels.viewSide,
          view_side_mirrored: labels.viewSideMirrored,
          view_back: labels.viewBack,
        }}
      />

      <div className="flex flex-col gap-4 px-4">
        {manifest.components
          .filter((c) => c.customizable)
          .map((comp) => (
            <SelectorColor
              key={comp.id}
              locale={locale}
              component={comp}
              selectedColorId={draft.colors[comp.id]}
              onSelect={(colorId) => selectColor(comp.id, colorId)}
              labels={{ approximate: labels.approximateColor }}
            />
          ))}
      </div>

      <div className="px-4">
        <SelectorTecnica
          locale={locale}
          techniques={manifest.techniques}
          selected={draft.technique}
          onSelect={(techniqueId) => setDraft((d) => ({ ...d, technique: techniqueId }))}
          label={labels.chooseTechnique}
        />
      </div>

      <PanelDecoracion
        locale={locale}
        manifest={manifest}
        view={view}
        decorations={draft.decorations}
        maxZones={maxDecoratedZones}
        onAdd={addDecoration}
        onUpdate={updateDecoration}
        labels={labels}
      />

      <BarraControles>
        <div className="flex items-center justify-between gap-3">
          <Restablecer
            onConfirm={reset}
            labels={{
              reset: labels.reset,
              confirmMessage: labels.resetConfirm,
              confirm: labels.confirmYes,
              cancel: labels.confirmNo,
            }}
          />
          <Link
            href={`/${locale}/solicitud`}
            className="rounded bg-brand px-4 py-2 text-sm text-white"
          >
            {labels.continueToQuote}
          </Link>
        </div>
      </BarraControles>
    </div>
  );
}
