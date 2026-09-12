import { describe, it, expect } from "vitest";
import { computeStrips, drawWarped, type WarpParams } from "@/lib/design/warp";

function assertStaysInZone(params: WarpParams) {
  const strips = computeStrips(24, params);
  for (const strip of strips) {
    const top = strip.offsetY - strip.scaleY / 2;
    const bottom = strip.offsetY + strip.scaleY / 2;
    expect(top).toBeGreaterThanOrEqual(-0.5 - 1e-9);
    expect(bottom).toBeLessThanOrEqual(0.5 + 1e-9);
  }
}

describe("lib/design/warp — deformación por curvatura (FR-035, SC-013)", () => {
  it("sin deformación, las franjas cubren exactamente la zona", () => {
    const strips = computeStrips(10, { arc: 0, tilt: 0, taper: 0 });
    for (const strip of strips) {
      expect(strip.offsetY).toBeCloseTo(0);
      expect(strip.scaleY).toBeCloseTo(1);
    }
  });

  it("ninguna franja sale de la zona en los extremos de los parámetros", () => {
    const extremes = [-1, 0, 1];
    for (const arc of extremes) {
      for (const tilt of extremes) {
        for (const taper of [0, 0.5, 1]) {
          assertStaysInZone({ arc, tilt, taper });
        }
      }
    }
  });

  it("ninguna franja sale de la zona con parámetros aleatorios", () => {
    for (let i = 0; i < 200; i++) {
      assertStaysInZone({
        arc: Math.random() * 2 - 1,
        tilt: Math.random() * 2 - 1,
        taper: Math.random(),
      });
    }
  });

  it("las franjas cubren el ancho completo en orden", () => {
    const strips = computeStrips(8, { arc: 0.5, tilt: 0, taper: 0 });
    expect(strips).toHaveLength(8);
    expect(strips[0].u).toBeLessThan(strips[7].u);
    const totalWidth = strips.reduce((sum, s) => sum + s.width, 0);
    expect(totalWidth).toBeCloseTo(1);
  });

  it("el arco es simétrico respecto al centro", () => {
    const strips = computeStrips(10, { arc: 0.6, tilt: 0, taper: 0 });
    const left = strips[1];
    const right = strips[strips.length - 2];
    expect(left.offsetY).toBeCloseTo(right.offsetY, 5);
  });

  it("drawWarped usa el tamaño real de una fuente tipo canvas (width/height), no el de la caja destino", () => {
    // Regresión: una fuente sin `naturalWidth` (p. ej. el <canvas> del texto
    // ya renderizado, ver lib/design/compose.ts) caía al tamaño de la caja
    // DESTINO como si fuera el de la fuente ORIGEN, recortando una esquina
    // diminuta y vacía del canvas de texto en vez del texto real.
    const calls: number[][] = [];
    const ctx = {
      drawImage: (
        _img: unknown,
        sx: number,
        sy: number,
        sw: number,
        sh: number,
        dx: number,
        dy: number,
        dw: number,
        dh: number,
      ) => {
        calls.push([sx, sy, sw, sh, dx, dy, dw, dh]);
      },
    } as unknown as CanvasRenderingContext2D;

    const fakeCanvasSource = { width: 600, height: 240 } as unknown as CanvasImageSource;
    const box = { x: 0, y: 0, w: 100, h: 40 };

    drawWarped(ctx, fakeCanvasSource, box, { arc: 0, tilt: 0, taper: 0 }, 4);

    expect(calls).toHaveLength(4);
    // Con el bug, sw nunca podía superar box.w (100) porque se calculaba
    // sobre la caja destino; con el fix, se calcula sobre el ancho real de
    // la fuente (600), así que una franja de 1/4 del ancho ya lo supera.
    const maxSourceWidth = Math.max(...calls.map((c) => c[2]));
    expect(maxSourceWidth).toBeGreaterThan(box.w);
  });

  it("drawWarped sigue usando naturalWidth/Height para fuentes tipo imagen", () => {
    const calls: number[][] = [];
    const ctx = {
      drawImage: (_img: unknown, sx: number, sy: number, sw: number, sh: number) => {
        calls.push([sx, sy, sw, sh]);
      },
    } as unknown as CanvasRenderingContext2D;

    const fakeImageSource = {
      naturalWidth: 800,
      naturalHeight: 300,
    } as unknown as CanvasImageSource;
    const box = { x: 0, y: 0, w: 50, h: 20 };

    drawWarped(ctx, fakeImageSource, box, { arc: 0, tilt: 0, taper: 0 }, 2);

    const maxSourceWidth = Math.max(...calls.map((c) => c[2]));
    expect(maxSourceWidth).toBeCloseTo(400, 0); // mitad de naturalWidth (800) para 2 franjas
  });
});
