"use client";

import type { Locale } from "@/lib/i18n/t";

export type Position = "front" | "left" | "right" | "back";

export interface ZonaValue {
  position: Position;
  maxWidthCm: number;
  maxHeightCm: number;
  boxX: number;
  boxY: number;
  boxW: number;
  boxH: number;
  arc: number;
  tilt: number;
  taper: number;
  maxTextChars: number;
}

const TECHNIQUE_ICONS = ["print", "sell", "style", "brush", "texture"];

/**
 * Paso 3 del wizard: dimensiones y técnicas permitidas para la zona de
 * personalización activa (`value.position`, elegida junto con la caja
 * arrastrable del canvas — ver ModeloConfigurador). Los sliders de
 * ancho/alto (cm) son el límite de impresión real que ya guardaba
 * _ZonasEditor.tsx; el rectángulo en píxeles (boxX/Y/W/H) sobre la foto se
 * edita arrastrando/redimensionando la caja en el canvas, no hay una
 * fórmula de conversión cm↔px calibrada para derivar uno del otro.
 */
export function PasoPersonalizacion({
  locale,
  position,
  value,
  onChange,
  onCommit,
  saving,
  techniques,
  enabledTechniqueIds,
  onToggleTechnique,
  labels,
}: {
  locale: Locale;
  position: Position;
  value: ZonaValue;
  onChange: (patch: Partial<ZonaValue>) => void;
  onCommit: () => void;
  saving: boolean;
  techniques: { id: string; nameEs: string; nameEn: string }[];
  enabledTechniqueIds: string[];
  onToggleTechnique: (techniqueId: string, enable: boolean) => void;
  labels: Record<string, string>;
}) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-headline-md text-[13px] font-bold uppercase tracking-wider text-on-surface">
            {labels.stepPersonalization}
          </h2>
          <p className="mt-0.5 font-body-md text-[11px] text-on-surface-variant">
            {labels.stepPersonalizationHint}
          </p>
        </div>
        <span className="material-symbols-outlined text-lg text-on-surface-variant">tune</span>
      </div>

      <span className="inline-flex w-fit items-center rounded-full bg-surface-container-low px-3 py-1 font-label-caps text-label-caps text-on-surface-variant">
        {labels[`zone_${position}`]}
      </span>

      <div className="space-y-4 rounded-xl border border-outline-variant/60 bg-surface-container-low p-3.5">
        <SliderField
          label={labels.maxWidthCm}
          value={value.maxWidthCm}
          min={4}
          max={14}
          step={0.5}
          unit="cm"
          onChange={(maxWidthCm) => onChange({ maxWidthCm })}
          onCommit={onCommit}
        />
        <SliderField
          label={labels.maxHeightCm}
          value={value.maxHeightCm}
          min={2}
          max={8}
          step={0.5}
          unit="cm"
          onChange={(maxHeightCm) => onChange({ maxHeightCm })}
          onCommit={onCommit}
        />
      </div>

      <div className="space-y-2.5">
        <span className="block font-body-md text-body-md font-semibold text-on-surface">
          {labels.techniques}
        </span>
        {techniques.map((tech, i) => {
          const checked = enabledTechniqueIds.includes(tech.id);
          return (
            <label
              key={tech.id}
              className="flex cursor-pointer items-center justify-between rounded-xl border border-outline-variant/60 bg-surface-container-lowest p-3 transition-colors hover:border-outline-variant"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <span className="material-symbols-outlined text-base">
                    {TECHNIQUE_ICONS[i % TECHNIQUE_ICONS.length]}
                  </span>
                </div>
                <p className="font-body-md text-xs font-semibold text-on-surface">
                  {locale === "es" ? tech.nameEs : tech.nameEn}
                </p>
              </div>
              <input
                type="checkbox"
                checked={checked}
                onChange={(e) => onToggleTechnique(tech.id, e.target.checked)}
                className="h-4 w-4 rounded accent-primary"
              />
            </label>
          );
        })}
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-on-surface">{labels.maxTextChars}</span>
        </div>
        <input
          type="number"
          value={value.maxTextChars}
          min={1}
          max={40}
          onChange={(e) => onChange({ maxTextChars: Number(e.target.value) })}
          onBlur={onCommit}
          className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2 font-body-md text-xs font-medium text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <details className="rounded-xl border border-outline-variant/60 bg-surface-container-low p-3.5">
        <summary className="cursor-pointer select-none font-label-caps text-label-caps uppercase text-on-surface-variant">
          {labels.advanced}
        </summary>
        <div className="mt-3 space-y-3">
          <RangeField
            label={labels.arc}
            value={value.arc}
            min={-1}
            max={1}
            step={0.05}
            onChange={(arc) => onChange({ arc })}
            onCommit={onCommit}
          />
          <RangeField
            label={labels.tilt}
            value={value.tilt}
            min={-1}
            max={1}
            step={0.05}
            onChange={(tilt) => onChange({ tilt })}
            onCommit={onCommit}
          />
          <RangeField
            label={labels.taper}
            value={value.taper}
            min={0}
            max={1}
            step={0.05}
            onChange={(taper) => onChange({ taper })}
            onCommit={onCommit}
          />
        </div>
      </details>

      {saving && (
        <p className="font-label-caps text-label-caps text-on-surface-variant">
          {labels.uploading}
        </p>
      )}
    </div>
  );
}

function SliderField({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
  onCommit,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (value: number) => void;
  onCommit: () => void;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-xs">
        <span className="font-medium text-on-surface">{label}</span>
        <span className="rounded border border-outline-variant bg-surface px-2 py-0.5 font-mono text-[11px] font-semibold text-on-surface">
          {value} {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        onMouseUp={onCommit}
        onTouchEnd={onCommit}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-outline-variant/50 accent-on-surface"
      />
      <div className="mt-1 flex justify-between text-[10px] text-on-surface-variant">
        <span>
          {min} {unit}
        </span>
        <span>
          {max} {unit}
        </span>
      </div>
    </div>
  );
}

function RangeField({
  label,
  value,
  min,
  max,
  step,
  onChange,
  onCommit,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  onCommit: () => void;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="font-label-caps text-label-caps text-on-surface-variant">
        {label}: {value.toFixed(2)}
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        onMouseUp={onCommit}
        onTouchEnd={onCommit}
        className="accent-primary"
      />
    </label>
  );
}
