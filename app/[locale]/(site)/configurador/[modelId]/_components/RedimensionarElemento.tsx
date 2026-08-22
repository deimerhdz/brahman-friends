"use client";

import { useRef } from "react";
import { clampSizeToZone, type SizeCm, type ZoneLimits } from "@/lib/design/rules";

/**
 * Redimensionado con pellizco y con un deslizador visible como alternativa
 * accesible (research.md, decisión 16; FR-043, SC-014). Se detiene en el
 * máximo de la zona.
 */
export function useRedimensionarPellizco({
  zone,
  onChange,
}: {
  zone: ZoneLimits;
  onChange: (size: SizeCm) => void;
}) {
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const startDistance = useRef(0);
  const startSize = useRef<SizeCm>({ widthCm: 0, heightCm: 0 });

  function onPointerDown(
    event: React.PointerEvent<HTMLElement>,
    current: SizeCm,
  ) {
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointers.current.size === 2) {
      startDistance.current = distanceBetween(pointers.current);
      startSize.current = current;
    }
  }

  function onPointerMove(event: React.PointerEvent<HTMLElement>) {
    if (!pointers.current.has(event.pointerId)) return;
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointers.current.size !== 2 || startDistance.current === 0) return;
    const distance = distanceBetween(pointers.current);
    const scale = distance / startDistance.current;
    onChange(
      clampSizeToZone(
        {
          widthCm: startSize.current.widthCm * scale,
          heightCm: startSize.current.heightCm * scale,
        },
        zone,
      ),
    );
  }

  function onPointerUp(event: React.PointerEvent<HTMLElement>) {
    pointers.current.delete(event.pointerId);
    if (pointers.current.size < 2) startDistance.current = 0;
  }

  return { onPointerDown, onPointerMove, onPointerUp };
}

function distanceBetween(pointers: Map<number, { x: number; y: number }>): number {
  const [a, b] = [...pointers.values()];
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function DeslizadorTamano({
  size,
  zone,
  onChange,
  label,
}: {
  size: SizeCm;
  zone: ZoneLimits;
  onChange: (size: SizeCm) => void;
  label: string;
}) {
  const ratio = size.widthCm / zone.maxWidthCm;

  function onSlide(value: number) {
    const scale = value / ratio;
    onChange(
      clampSizeToZone(
        { widthCm: size.widthCm * scale, heightCm: size.heightCm * scale },
        zone,
      ),
    );
  }

  return (
    <label className="flex items-center gap-2 text-xs">
      <span>{label}</span>
      <input
        type="range"
        min={0.1}
        max={1}
        step={0.02}
        value={ratio}
        onChange={(e) => onSlide(Number(e.target.value))}
      />
    </label>
  );
}
