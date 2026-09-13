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

/**
 * Redimensionado arrastrando una esquina del marco que rodea al elemento
 * (equivalente con mouse al pellizco táctil): la escala depende de cuánto se
 * aleja el puntero del centro respecto de dónde empezó a arrastrar, igual
 * que el gesto de pellizco. Se detiene en el máximo de la zona (FR-043,
 * SC-014).
 */
export function useRedimensionarBorde({
  containerRef,
  zone,
  onChange,
}: {
  containerRef: React.RefObject<HTMLElement | null>;
  zone: ZoneLimits;
  onChange: (size: SizeCm) => void;
}) {
  const drag = useRef<{
    centerX: number;
    centerY: number;
    startDistance: number;
    startSize: SizeCm;
  } | null>(null);

  function onPointerDown(event: React.PointerEvent<HTMLElement>, current: SizeCm) {
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    drag.current = {
      centerX,
      centerY,
      startDistance: Math.hypot(event.clientX - centerX, event.clientY - centerY),
      startSize: current,
    };
  }

  function onPointerMove(event: React.PointerEvent<HTMLElement>) {
    if (!drag.current || drag.current.startDistance === 0) return;
    const distance = Math.hypot(
      event.clientX - drag.current.centerX,
      event.clientY - drag.current.centerY,
    );
    const scale = distance / drag.current.startDistance;
    onChange(
      clampSizeToZone(
        {
          widthCm: drag.current.startSize.widthCm * scale,
          heightCm: drag.current.startSize.heightCm * scale,
        },
        zone,
      ),
    );
  }

  function onPointerUp(event: React.PointerEvent<HTMLElement>) {
    event.currentTarget.releasePointerCapture(event.pointerId);
    drag.current = null;
  }

  return { onPointerDown, onPointerMove, onPointerUp };
}
