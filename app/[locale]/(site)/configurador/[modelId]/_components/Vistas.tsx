"use client";

import type { ModelManifest } from "@/lib/catalogo/model-manifest";
import type { DisplayView } from "./CapasGorra";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";

const ALL_VIEWS: DisplayView[] = ["front", "left", "right", "back"];

/** Avance/retroceso entre vistas de la galería, sin etiquetas por vista (FR-025, FR-026, FR-027, SC-005). */
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
  const available = ALL_VIEWS.filter((v) => stored.has(v));
  const index = available.indexOf(current);

  function go(delta: number) {
    const next = available[(index + delta + available.length) % available.length];
    onChange(next);
  }

  if (available.length <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-3">
      <button
        type="button"
        onClick={() => go(-1)}
        aria-label={labels.previous}
        className="rounded-full bg-gray-100 px-3 py-2"
      >
        <FaChevronLeft aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={() => go(1)}
        aria-label={labels.next}
        className="rounded-full bg-gray-100 px-3 py-2"
      >
        <FaChevronRight aria-hidden="true" />
      </button>
    </div>
  );
}
