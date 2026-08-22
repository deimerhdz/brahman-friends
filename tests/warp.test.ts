import { describe, it, expect } from "vitest";
import { computeStrips, type WarpParams } from "@/lib/design/warp";

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
});
