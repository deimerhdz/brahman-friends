"use client";

import { useRef, type PointerEvent as ReactPointerEvent } from "react";
import { clampOffsetToZone, type OffsetPct, type SizeCm, type ZoneLimits } from "@/lib/design/rules";

/**
 * Arrastre con eventos de puntero: unifican ratón y dedo en una sola
 * implementación (research.md, decisión 16; FR-040). Al soltar fuera de la
 * zona, vuelve a la posición válida más cercana.
 */
export function useArrastrarElemento({
  containerRef,
  size,
  zone,
  onChange,
}: {
  containerRef: React.RefObject<HTMLElement | null>;
  size: SizeCm;
  zone: ZoneLimits;
  onChange: (offset: OffsetPct) => void;
}) {
  const dragging = useRef(false);
  const start = useRef({ pointerX: 0, pointerY: 0, offsetXPct: 0, offsetYPct: 0 });

  function onPointerDown(
    event: ReactPointerEvent<HTMLElement>,
    current: OffsetPct,
  ) {
    if (event.pointerType === "touch" && (event as unknown as { isPrimary: boolean }).isPrimary === false) {
      return; // deja el gesto de dos dedos para redimensionar
    }
    dragging.current = true;
    start.current = {
      pointerX: event.clientX,
      pointerY: event.clientY,
      offsetXPct: current.offsetXPct,
      offsetYPct: current.offsetYPct,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event: ReactPointerEvent<HTMLElement>) {
    if (!dragging.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const dxPct = (event.clientX - start.current.pointerX) / rect.width;
    const dyPct = (event.clientY - start.current.pointerY) / rect.height;
    onChange({
      offsetXPct: start.current.offsetXPct + dxPct,
      offsetYPct: start.current.offsetYPct + dyPct,
    });
  }

  function onPointerUp(current: OffsetPct) {
    if (!dragging.current) return;
    dragging.current = false;
    onChange(clampOffsetToZone(current, size, zone));
  }

  return { onPointerDown, onPointerMove, onPointerUp };
}
