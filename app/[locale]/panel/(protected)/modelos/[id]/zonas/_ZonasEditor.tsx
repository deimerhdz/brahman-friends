"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PreviaCurvatura } from "./_components/PreviaCurvatura";

const POSITIONS = ["front", "left", "right", "back"] as const;
type Position = (typeof POSITIONS)[number];

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

function defaultZona(position: Position, defaultChars: number): ZonaValue {
  return {
    position,
    maxWidthCm: position === "front" ? 11 : 8,
    maxHeightCm: position === "front" ? 5.5 : 5,
    boxX: 50,
    boxY: 50,
    boxW: 150,
    boxH: 80,
    arc: 0,
    tilt: 0,
    taper: 0,
    maxTextChars: defaultChars,
  };
}

export function ZonasEditor({
  modelId,
  baseImagesByView,
  existing,
  defaultChars,
  labels,
}: {
  modelId: string;
  baseImagesByView: Record<string, string | null>;
  existing: Partial<Record<Position, ZonaValue>>;
  defaultChars: number;
  labels: Record<string, string>;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<Position>("front");
  const [values, setValues] = useState<Partial<Record<Position, ZonaValue>>>(
    existing,
  );
  const [saving, setSaving] = useState(false);

  const value = values[selected] ?? defaultZona(selected, defaultChars);

  const viewForPosition: Record<Position, string> = {
    front: "front",
    left: "side",
    right: "side",
    back: "back",
  };
  const baseImage = baseImagesByView[viewForPosition[selected]] ?? null;

  function update(patch: Partial<ZonaValue>) {
    setValues((v) => ({ ...v, [selected]: { ...value, ...patch } }));
  }

  async function save() {
    setSaving(true);
    await fetch(`/api/panel/modelos/${modelId}/zonas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(value),
    });
    setSaving(false);
    router.refresh();
  }

  const warpParams = useMemo(
    () => ({ arc: value.arc, tilt: value.tilt, taper: value.taper }),
    [value.arc, value.tilt, value.taper],
  );
  const box = useMemo(
    () => ({ x: value.boxX, y: value.boxY, w: value.boxW, h: value.boxH }),
    [value.boxX, value.boxY, value.boxW, value.boxH],
  );

  return (
    <div className="flex flex-col gap-6 md:flex-row">
      <div className="flex max-w-sm flex-col gap-4 rounded-lg border border-outline-variant/60 bg-surface-container-lowest p-6 ambient-shadow">
        <div className="flex flex-wrap gap-2">
          {POSITIONS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setSelected(p)}
              className={
                selected === p
                  ? "rounded-full border border-primary bg-surface-container-high px-3 py-1 font-label-caps text-label-caps font-bold text-primary"
                  : "rounded-full border border-outline-variant px-3 py-1 font-label-caps text-label-caps text-on-surface-variant hover:bg-surface-container-low"
              }
            >
              {labels[`position_${p}`]}
            </button>
          ))}
        </div>

        <label className="flex flex-col gap-1">
          <span className="font-label-caps text-label-caps text-on-surface-variant">
            {labels.maxWidthCm}
          </span>
          <input
            type="number"
            step="0.1"
            value={value.maxWidthCm}
            onChange={(e) => update({ maxWidthCm: Number(e.target.value) })}
            className="rounded border border-outline-variant bg-surface px-3 py-2 font-body-md text-body-md text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="font-label-caps text-label-caps text-on-surface-variant">
            {labels.maxHeightCm}
          </span>
          <input
            type="number"
            step="0.1"
            value={value.maxHeightCm}
            onChange={(e) => update({ maxHeightCm: Number(e.target.value) })}
            className="rounded border border-outline-variant bg-surface px-3 py-2 font-body-md text-body-md text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </label>

        <div className="grid grid-cols-2 gap-2">
          {(["boxX", "boxY", "boxW", "boxH"] as const).map((field) => (
            <label key={field} className="flex flex-col gap-1">
              <span className="font-label-caps text-label-caps text-on-surface-variant">
                {labels[field]}
              </span>
              <input
                type="number"
                value={value[field]}
                onChange={(e) => update({ [field]: Number(e.target.value) })}
                className="rounded border border-outline-variant bg-surface px-3 py-2 font-body-md text-body-md text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </label>
          ))}
        </div>

        <label className="flex flex-col gap-1">
          <span className="font-label-caps text-label-caps text-on-surface-variant">
            {labels.arc}: {value.arc.toFixed(2)}
          </span>
          <input
            type="range"
            min={-1}
            max={1}
            step={0.05}
            value={value.arc}
            onChange={(e) => update({ arc: Number(e.target.value) })}
            className="accent-primary"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="font-label-caps text-label-caps text-on-surface-variant">
            {labels.tilt}: {value.tilt.toFixed(2)}
          </span>
          <input
            type="range"
            min={-1}
            max={1}
            step={0.05}
            value={value.tilt}
            onChange={(e) => update({ tilt: Number(e.target.value) })}
            className="accent-primary"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="font-label-caps text-label-caps text-on-surface-variant">
            {labels.taper}: {value.taper.toFixed(2)}
          </span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={value.taper}
            onChange={(e) => update({ taper: Number(e.target.value) })}
            className="accent-primary"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="font-label-caps text-label-caps text-on-surface-variant">
            {labels.maxTextChars}
          </span>
          <input
            type="number"
            value={value.maxTextChars}
            onChange={(e) => update({ maxTextChars: Number(e.target.value) })}
            className="rounded border border-outline-variant bg-surface px-3 py-2 font-body-md text-body-md text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </label>

        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="w-fit rounded bg-on-surface px-6 py-2 font-button text-button text-on-primary transition-colors duration-200 hover:bg-primary disabled:opacity-50"
        >
          {labels.save}
        </button>
      </div>

      <div>
        <PreviaCurvatura baseImageUrl={baseImage} box={box} params={warpParams} />
      </div>
    </div>
  );
}
