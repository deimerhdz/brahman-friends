"use client";

import type { ModelManifest } from "@/lib/catalogo/model-manifest";
import type { DisplayView } from "./CapasGorra";

const ALL_VIEWS: DisplayView[] = ["front", "side", "side_mirrored", "back"];

/** Cambio de vista con miniaturas y avance/retroceso (FR-025, FR-026, FR-027, SC-005). */
export function Vistas({
  manifest,
  current,
  onChange,
  labels,
}: {
  manifest: ModelManifest;
  current: DisplayView;
  onChange: (view: DisplayView) => void;
  labels: Record<string, string>;
}) {
  const stored = new Set(manifest.views);
  const available = ALL_VIEWS.filter((v) =>
    v === "side_mirrored" ? stored.has("side") : stored.has(v),
  );
  const index = available.indexOf(current);

  function go(delta: number) {
    const next = available[(index + delta + available.length) % available.length];
    onChange(next);
  }

  return (
    <div className="flex items-center justify-center gap-3">
      <button
        type="button"
        onClick={() => go(-1)}
        aria-label={labels.previous}
        className="rounded-full bg-gray-100 px-3 py-2"
      >
        ‹
      </button>
      <div className="flex gap-2">
        {available.map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => onChange(v)}
            aria-pressed={v === current}
            className={`rounded px-2 py-1 text-xs ${
              v === current ? "bg-brand text-white" : "bg-gray-100"
            }`}
          >
            {labels[`view_${v}`]}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={() => go(1)}
        aria-label={labels.next}
        className="rounded-full bg-gray-100 px-3 py-2"
      >
        ›
      </button>
    </div>
  );
}
