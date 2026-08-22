import { describe, it, expect } from "vitest";
import {
  clampSizeToZone,
  clampOffsetToZone,
  canPlaceDecoration,
} from "@/lib/design/rules";

const ZONE = { maxWidthCm: 11, maxHeightCm: 5.5 };

describe("lib/design/rules — límites de decoración (RN11, RN12, RN13)", () => {
  describe("clampSizeToZone — el redimensionado se detiene en el máximo (FR-043, SC-014)", () => {
    it("no cambia un tamaño que ya cabe", () => {
      const result = clampSizeToZone({ widthCm: 5, heightCm: 3 }, ZONE);
      expect(result).toEqual({ widthCm: 5, heightCm: 3 });
    });

    it("recorta manteniendo la proporción cuando el ancho excede", () => {
      const result = clampSizeToZone({ widthCm: 22, heightCm: 5 }, ZONE);
      expect(result.widthCm).toBeCloseTo(11);
      expect(result.heightCm).toBeCloseTo(2.5);
    });

    it("recorta manteniendo la proporción cuando el alto excede", () => {
      const result = clampSizeToZone({ widthCm: 8, heightCm: 11 }, ZONE);
      expect(result.heightCm).toBeCloseTo(5.5);
      expect(result.widthCm).toBeLessThanOrEqual(ZONE.maxWidthCm);
    });
  });

  describe("clampOffsetToZone — vuelve a la posición válida más cercana", () => {
    it("no cambia un desplazamiento ya válido", () => {
      const result = clampOffsetToZone(
        { offsetXPct: 0.1, offsetYPct: -0.1 },
        { widthCm: 4, heightCm: 2 },
        ZONE,
      );
      expect(result.offsetXPct).toBeCloseTo(0.1);
      expect(result.offsetYPct).toBeCloseTo(-0.1);
    });

    it("recorta un desplazamiento que saca el elemento de la zona", () => {
      const result = clampOffsetToZone(
        { offsetXPct: 5, offsetYPct: 5 },
        { widthCm: 4, heightCm: 2 },
        ZONE,
      );
      expect(Math.abs(result.offsetXPct)).toBeLessThanOrEqual(0.5);
      expect(Math.abs(result.offsetYPct)).toBeLessThanOrEqual(0.5);
    });

    it("un elemento del tamaño exacto de la zona solo puede ir centrado", () => {
      const result = clampOffsetToZone(
        { offsetXPct: 0.3, offsetYPct: 0.3 },
        { widthCm: 11, heightCm: 5.5 },
        ZONE,
      );
      expect(result.offsetXPct).toBeCloseTo(0);
      expect(result.offsetYPct).toBeCloseTo(0);
    });
  });

  describe("canPlaceDecoration — un elemento por zona, máximo de zonas (RN11, RN13, SC-015)", () => {
    it("permite decorar una zona libre por debajo del máximo", () => {
      const result = canPlaceDecoration(["front"], "back", 3);
      expect(result).toEqual({ allowed: true });
    });

    it("rechaza una zona ya ocupada", () => {
      const result = canPlaceDecoration(["front"], "front", 3);
      expect(result).toEqual({ allowed: false, reason: "zone_occupied" });
    });

    it("rechaza al llegar al máximo de zonas", () => {
      const result = canPlaceDecoration(["front", "back", "left"], "right", 3);
      expect(result).toEqual({ allowed: false, reason: "max_zones" });
    });
  });
});
