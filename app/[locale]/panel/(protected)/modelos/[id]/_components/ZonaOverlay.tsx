"use client";

import { useRef, useState, type PointerEvent as ReactPointerEvent } from "react";

export interface BoxPx {
  x: number;
  y: number;
  w: number;
  h: number;
}

const HANDLES = [
  { key: "nw", className: "-top-1.5 -left-1.5 cursor-nwse-resize" },
  { key: "n", className: "-top-1.5 left-1/2 -translate-x-1/2 cursor-ns-resize" },
  { key: "ne", className: "-top-1.5 -right-1.5 cursor-nesw-resize" },
  { key: "e", className: "-right-1.5 top-1/2 -translate-y-1/2 cursor-ew-resize" },
  { key: "se", className: "-bottom-1.5 -right-1.5 cursor-nwse-resize" },
  { key: "s", className: "-bottom-1.5 left-1/2 -translate-x-1/2 cursor-ns-resize" },
  { key: "sw", className: "-bottom-1.5 -left-1.5 cursor-nesw-resize" },
  { key: "w", className: "-left-1.5 top-1/2 -translate-y-1/2 cursor-ew-resize" },
] as const;

const MIN_SIZE = 20;

/**
 * Caja arrastrable/redimensionable que representa la zona de
 * personalización sobre la foto del modelo (equivalente a `.dashed-box` +
 * `.resize-handle` del mockup). Las coordenadas de `box` están en píxeles
 * de la imagen original (mismo espacio que `decoration_zone.box_x/y/w/h`);
 * se posicionan como % del contenedor asumiendo que la imagen lo llena
 * (mismo supuesto que ya usa Decoracion.tsx en el configurador de cliente).
 * Solo reacciona a punteros cuando `editable` es true; en los demás pasos
 * se muestra de solo lectura, igual que en el mockup.
 */
export function ZonaOverlay({
  box,
  imageWidth,
  imageHeight,
  editable,
  label,
  onChange,
  onCommit,
}: {
  box: BoxPx;
  imageWidth: number;
  imageHeight: number;
  editable: boolean;
  label: string;
  onChange: (box: BoxPx) => void;
  onCommit: (box: BoxPx) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const drag = useRef<{
    mode: "move" | (typeof HANDLES)[number]["key"];
    startClientX: number;
    startClientY: number;
    startBox: BoxPx;
  } | null>(null);

  function clientDeltaToImagePx(dxClient: number, dyClient: number) {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0 || rect.height === 0) return { dx: 0, dy: 0 };
    return {
      dx: (dxClient / rect.width) * imageWidth,
      dy: (dyClient / rect.height) * imageHeight,
    };
  }

  function startDrag(
    event: ReactPointerEvent<HTMLElement>,
    mode: (typeof drag.current & object)["mode"],
  ) {
    if (!editable) return;
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = {
      mode,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startBox: box,
    };
    setActive(true);
  }

  function onPointerMove(event: ReactPointerEvent<HTMLElement>) {
    if (!drag.current) return;
    const { dx, dy } = clientDeltaToImagePx(
      event.clientX - drag.current.startClientX,
      event.clientY - drag.current.startClientY,
    );
    onChange(applyDelta(drag.current.startBox, drag.current.mode, dx, dy, imageWidth, imageHeight));
  }

  function endDrag(event: ReactPointerEvent<HTMLElement>) {
    if (!drag.current) return;
    event.currentTarget.releasePointerCapture(event.pointerId);
    drag.current = null;
    setActive(false);
    onCommit(box);
  }

  const leftPct = (box.x / imageWidth) * 100;
  const topPct = (box.y / imageHeight) * 100;
  const widthPct = (box.w / imageWidth) * 100;
  const heightPct = (box.h / imageHeight) * 100;

  return (
    <div ref={containerRef} className="pointer-events-none absolute inset-0">
      <div
        onPointerDown={(e) => startDrag(e, "move")}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        className={`dashed-box group absolute rounded-sm transition-shadow ${
          editable ? "pointer-events-auto cursor-move hover:ring-2 hover:ring-primary/30" : ""
        } ${active ? "ring-2 ring-primary/50" : ""}`}
        style={{
          top: `${topPct}%`,
          left: `${leftPct}%`,
          width: `${widthPct}%`,
          height: `${heightPct}%`,
        }}
      >
        <div className="absolute -top-7 left-1/2 flex -translate-x-1/2 items-center gap-1 whitespace-nowrap rounded bg-primary px-2 py-0.5 text-[10px] font-semibold tracking-wider text-on-primary shadow-sm">
          <span className="material-symbols-outlined text-xs">select_all</span>
          {label}
        </div>

        <div className="pointer-events-none relative h-full w-full opacity-40 transition-opacity group-hover:opacity-70">
          <div className="absolute left-0 right-0 top-1/2 h-px border-t border-dotted border-primary/70" />
          <div className="absolute bottom-0 left-1/2 top-0 w-px border-l border-dotted border-primary/70" />
        </div>

        {editable &&
          HANDLES.map((h) => (
            <div
              key={h.key}
              onPointerDown={(e) => startDrag(e, h.key)}
              onPointerMove={onPointerMove}
              onPointerUp={endDrag}
              className={`resize-handle pointer-events-auto absolute ${h.className}`}
            />
          ))}
      </div>
    </div>
  );
}

function applyDelta(
  start: BoxPx,
  mode: "move" | (typeof HANDLES)[number]["key"],
  dx: number,
  dy: number,
  imageWidth: number,
  imageHeight: number,
): BoxPx {
  let { x, y, w, h } = start;

  if (mode === "move") {
    x = start.x + dx;
    y = start.y + dy;
  } else {
    if (mode.includes("w")) {
      const newX = start.x + dx;
      const newW = start.w - dx;
      if (newW >= MIN_SIZE) {
        x = newX;
        w = newW;
      }
    }
    if (mode.includes("e")) {
      w = Math.max(MIN_SIZE, start.w + dx);
    }
    if (mode.includes("n")) {
      const newY = start.y + dy;
      const newH = start.h - dy;
      if (newH >= MIN_SIZE) {
        y = newY;
        h = newH;
      }
    }
    if (mode.includes("s")) {
      h = Math.max(MIN_SIZE, start.h + dy);
    }
  }

  x = Math.min(Math.max(0, x), Math.max(0, imageWidth - w));
  y = Math.min(Math.max(0, y), Math.max(0, imageHeight - h));
  w = Math.min(w, imageWidth);
  h = Math.min(h, imageHeight);

  return { x: Math.round(x), y: Math.round(y), w: Math.round(w), h: Math.round(h) };
}
