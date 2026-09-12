"use client";

import { useEffect, useRef } from "react";
import { renderTextSource } from "@/lib/design/compose";
import { drawWarped, type WarpParams } from "@/lib/design/warp";
import type { BoxPx } from "./ZonaOverlay";

/**
 * Previsualización en vivo de arco/inclinación/estrechamiento dentro de la
 * zona, usando un texto de muestra como sustituto del logo/texto real (el
 * panel de admin no tiene un elemento del cliente para deformar). Reutiliza
 * `drawWarped`, la misma función que aplica el configurador de cliente
 * (Decoracion.tsx) y la composición final (lib/design/compose.ts), así el
 * resultado que ve el admin coincide con el que verá el cliente.
 */
export function ZonaWarpPreview({
  box,
  imageWidth,
  imageHeight,
  params,
  placeholderText,
  color,
}: {
  box: BoxPx;
  imageWidth: number;
  imageHeight: number;
  params: WarpParams;
  placeholderText: string;
  color: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || box.w <= 0 || box.h <= 0) return;
    canvas.width = box.w;
    canvas.height = box.h;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const source = renderTextSource(placeholderText, "sans-bold", color);
    drawWarped(ctx, source, { x: 0, y: 0, w: box.w, h: box.h }, params);
  }, [box.w, box.h, params, placeholderText, color]);

  const leftPct = (box.x / imageWidth) * 100;
  const topPct = (box.y / imageHeight) * 100;
  const widthPct = (box.w / imageWidth) * 100;
  const heightPct = (box.h / imageHeight) * 100;

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute opacity-90"
      style={{
        left: `${leftPct}%`,
        top: `${topPct}%`,
        width: `${widthPct}%`,
        height: `${heightPct}%`,
      }}
    />
  );
}
