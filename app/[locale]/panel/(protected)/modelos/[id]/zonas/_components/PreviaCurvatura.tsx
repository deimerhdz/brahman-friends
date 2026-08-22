"use client";

import { useEffect, useRef } from "react";
import { drawWarped, type WarpParams } from "@/lib/design/warp";

/**
 * Vista previa en vivo del efecto de la curvatura sobre la imagen base
 * (FR-035a, SC-033). Como todavía no hay un logotipo real en el panel, se
 * deforma un patrón de referencia (una cuadrícula) para que el
 * administrador vea el efecto de las tres perillas al moverlas.
 */
export function PreviaCurvatura({
  baseImageUrl,
  box,
  params,
}: {
  baseImageUrl: string | null;
  box: { x: number; y: number; w: number; h: number };
  params: WarpParams;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let cancelled = false;

    async function render() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (baseImageUrl) {
        const base = await loadImage(baseImageUrl);
        if (cancelled) return;
        canvas.width = base.naturalWidth;
        canvas.height = base.naturalHeight;
        ctx.drawImage(base, 0, 0);
      }

      const placeholder = buildPlaceholder();
      ctx.strokeStyle = "#b45309";
      ctx.lineWidth = 2;
      ctx.strokeRect(box.x, box.y, box.w, box.h);
      drawWarped(ctx, placeholder, box, params, 40);
    }

    render();
    return () => {
      cancelled = true;
    };
    // `box` y `params` ya vienen memoizados desde quien llama a este
    // componente (ver _ZonasEditor.tsx), así que es seguro usarlos enteros.
  }, [baseImageUrl, box, params]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full max-w-md rounded-lg border border-outline-variant/60"
    />
  );
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function buildPlaceholder(): HTMLCanvasElement {
  const size = 200;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#fef3c7";
  ctx.fillRect(0, 0, size, size);
  ctx.strokeStyle = "#b45309";
  ctx.lineWidth = 3;
  ctx.strokeRect(4, 4, size - 8, size - 8);
  ctx.font = "bold 28px sans-serif";
  ctx.fillStyle = "#b45309";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("LOGO", size / 2, size / 2);
  return canvas;
}
