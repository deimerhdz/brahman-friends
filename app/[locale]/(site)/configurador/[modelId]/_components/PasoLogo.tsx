"use client";

import type { Locale } from "@/lib/i18n/t";
import type { ModelManifest } from "@/lib/catalogo/model-manifest";
import type { Decoration } from "@/lib/design/borrador";
import { VIEW_FOR_ZONE } from "@/lib/design/compose";
import type { DisplayView } from "./CapasGorra";
import { PanelDecoracion } from "./PanelDecoracion";
import { SelectorTecnica } from "./SelectorTecnica";

const POSITION_ORDER: Decoration["zone"][] = ["front", "left", "right", "back"];
const POSITION_ICON: Record<Decoration["zone"], string> = {
  front: "front_hand",
  left: "swipe_right",
  right: "swipe_left",
  back: "back_hand",
};

/**
 * Paso 2 del configurador. Los botones de posición son solo un atajo para
 * saltar a la vista donde vive esa zona; el arrastre y redimensionamiento
 * libre siguen ocurriendo en `Decoracion.tsx`, sin cambios (spec.md
 * Clarifications: paso "Colocación de logo"). Envuelve `PanelDecoracion.tsx`
 * y `SelectorTecnica.tsx` existentes tal cual (FR-034 a FR-047 de
 * 001-configurador-gorras).
 */
export function PasoLogo({
  locale,
  manifest,
  view,
  onViewChange,
  decorations,
  maxZones,
  technique,
  onSelectTechnique,
  onAddDecoration,
  onUpdateDecoration,
  onRemoveDecoration,
  labels,
}: {
  locale: Locale;
  manifest: ModelManifest;
  view: DisplayView;
  onViewChange: (view: DisplayView) => void;
  decorations: Decoration[];
  maxZones: number;
  technique: string | null;
  onSelectTechnique: (techniqueId: string) => void;
  onAddDecoration: (decoration: Decoration) => boolean;
  onUpdateDecoration: (index: number, patch: Partial<Decoration>) => void;
  onRemoveDecoration: (index: number) => void;
  labels: Record<string, string>;
}) {
  const availablePositions = POSITION_ORDER.filter((pos) =>
    manifest.zones.some((z) => z.position === pos),
  );

  return (
    <div className="flex flex-col gap-6">
      {availablePositions.length > 0 && (
        <div>
          <label className="mb-2 block font-label-caps text-label-caps text-on-surface-variant">
            {labels.position}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {availablePositions.map((pos) => {
              const active = VIEW_FOR_ZONE[pos] === view;
              return (
                <button
                  key={pos}
                  type="button"
                  onClick={() => onViewChange(VIEW_FOR_ZONE[pos])}
                  className={`flex flex-col items-center gap-1 rounded p-3 ${
                    active
                      ? "border-2 border-primary bg-surface"
                      : "border border-outline-variant bg-surface hover:border-primary"
                  }`}
                >
                  <span
                    className={`material-symbols-outlined text-xl ${active ? "text-primary" : "text-on-surface-variant"}`}
                  >
                    {POSITION_ICON[pos]}
                  </span>
                  <span
                    className={`text-[10px] font-medium ${active ? "text-primary" : "text-on-surface"}`}
                  >
                    {labels[`zone_${pos}`]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <PanelDecoracion
        manifest={manifest}
        view={view}
        decorations={decorations}
        maxZones={maxZones}
        onAdd={onAddDecoration}
        onUpdate={onUpdateDecoration}
        onRemove={onRemoveDecoration}
        labels={labels}
      />

      <div className="px-4">
        <SelectorTecnica
          locale={locale}
          techniques={manifest.techniques}
          selected={technique}
          onSelect={onSelectTechnique}
          label={labels.chooseTechnique}
        />
      </div>
    </div>
  );
}
