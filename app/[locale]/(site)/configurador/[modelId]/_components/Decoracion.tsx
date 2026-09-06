"use client";

import { useEffect, useRef } from "react";
import type { ModelManifest } from "@/lib/catalogo/model-manifest";
import type { Decoration } from "@/lib/design/borrador";
import { drawWarped } from "@/lib/design/warp";
import { loadImage, renderTextSource, VIEW_FOR_ZONE } from "@/lib/design/compose";
import type { DisplayView } from "./CapasGorra";
import { useArrastrarElemento } from "./ArrastrarElemento";
import { useRedimensionarPellizco, DeslizadorTamano } from "./RedimensionarElemento";

/**
 * Dibuja cada elemento decorativo deformado sobre su zona (FR-041, SC-013),
 * solo en las vistas donde su zona es visible (FR-026, FR-042, SC-006,
 * SC-012), sin reflejar el contenido en el lateral derecho: el elemento del
 * lateral derecho se dibuja normal, aunque el contenedor de la gorra esté
 * reflejado (research.md, decisión 8; contracts/design-payload.md).
 */
export function Decoracion({
  manifest,
  view,
  decorations,
  onChange,
  onRemove,
  labels,
}: {
  manifest: ModelManifest;
  view: DisplayView;
  decorations: Decoration[];
  onChange: (index: number, patch: Partial<Decoration>) => void;
  onRemove: (index: number) => void;
  labels: Record<string, string>;
}) {
  const imageWidth = manifest.model.imageWidth ?? 1;
  const imageHeight = manifest.model.imageHeight ?? 1;

  return (
    <>
      {decorations.map((decoration, index) => {
        if (VIEW_FOR_ZONE[decoration.zone] !== view) return null;
        const zone = manifest.zones.find((z) => z.position === decoration.zone);
        if (!zone) return null;

        return (
          <ElementoDecorativo
            key={`${decoration.zone}-${index}`}
            decoration={decoration}
            zone={zone}
            imageWidth={imageWidth}
            imageHeight={imageHeight}
            logoUrl={decoration.kind === "logo" ? decoration.url : undefined}
            onChange={(patch) => onChange(index, patch)}
            onRemove={() => onRemove(index)}
            labels={labels}
          />
        );
      })}
    </>
  );
}

function ElementoDecorativo({
  decoration,
  zone,
  imageWidth,
  imageHeight,
  logoUrl,
  onChange,
  onRemove,
  labels,
}: {
  decoration: Decoration;
  zone: ModelManifest["zones"][number];
  imageWidth: number;
  imageHeight: number;
  logoUrl: string | undefined;
  onChange: (patch: Partial<Decoration>) => void;
  onRemove: () => void;
  labels: Record<string, string>;
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const drag = useArrastrarElemento({
    containerRef: wrapperRef,
    size: { widthCm: decoration.widthCm, heightCm: decoration.heightCm },
    zone,
    onChange: (offset) => onChange(offset),
  });
  const pinch = useRedimensionarPellizco({
    zone,
    onChange: (size) => onChange(size),
  });

  useEffect(() => {
    let cancelled = false;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    canvas.width = zone.box.w;
    canvas.height = zone.box.h;

    const warpParams = { arc: zone.arc, tilt: zone.tilt, taper: zone.taper };
    const box = { x: 0, y: 0, w: zone.box.w, h: zone.box.h };

    async function render() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (decoration.kind === "logo") {
        if (!logoUrl) return;
        const img = await loadImage(logoUrl);
        if (cancelled) return;
        drawWarped(ctx, img, box, warpParams);
      } else {
        const source = renderTextSource(decoration.content, decoration.font);
        drawWarped(ctx, source, box, warpParams);
      }
    }

    render();
    return () => {
      cancelled = true;
    };
  }, [decoration, zone, logoUrl]);

  return (
    <div
      ref={wrapperRef}
      className="absolute touch-none"
      style={{
        left: `${(zone.box.x / imageWidth) * 100}%`,
        top: `${(zone.box.y / imageHeight) * 100}%`,
        width: `${(zone.box.w / imageWidth) * 100}%`,
        height: `${(zone.box.h / imageHeight) * 100}%`,
        transform: `translate(${decoration.offsetXPct * 100}%, ${decoration.offsetYPct * 100}%)`,
      }}
      onPointerDown={(e) => {
        drag.onPointerDown(e, decoration);
        pinch.onPointerDown(e, decoration);
      }}
      onPointerMove={(e) => {
        drag.onPointerMove(e);
        pinch.onPointerMove(e);
      }}
      onPointerUp={(e) => {
        drag.onPointerUp(decoration);
        pinch.onPointerUp(e);
      }}
    >
      <canvas ref={canvasRef} className="pointer-events-none h-full w-full" />
      <button
        type="button"
        onClick={onRemove}
        className="pointer-events-auto absolute -top-6 right-0 rounded bg-white/90 px-1 text-xs text-red-600 shadow"
      >
        {labels.remove}
      </button>
      <div className="pointer-events-auto absolute -bottom-6 left-0">
        <DeslizadorTamano
          size={{ widthCm: decoration.widthCm, heightCm: decoration.heightCm }}
          zone={zone}
          onChange={(size) => onChange(size)}
          label={labels.resize}
        />
      </div>
    </div>
  );
}
