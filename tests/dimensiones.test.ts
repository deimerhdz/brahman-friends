import { describe, it, expect } from "vitest";
import { dimensionsMatch, findMismatched } from "@/lib/media/dimensiones";

describe("lib/media/dimensiones — igualdad de dimensiones (FR-011, RN5)", () => {
  it("dimensionsMatch compara ancho y alto exactos", () => {
    expect(dimensionsMatch({ width: 800, height: 600 }, { width: 800, height: 600 })).toBe(true);
    expect(dimensionsMatch({ width: 800, height: 600 }, { width: 801, height: 600 })).toBe(false);
    expect(dimensionsMatch({ width: 800, height: 600 }, { width: 800, height: 601 })).toBe(false);
  });

  it("sin dimensiones previas, toma la primera imagen del lote como base", () => {
    const images = [
      { name: "a", width: 800, height: 600 },
      { name: "b", width: 800, height: 600 },
      { name: "c", width: 400, height: 300 },
    ];
    const { expected, mismatched } = findMismatched(images, null);
    expect(expected).toEqual(images[0]);
    expect(mismatched).toEqual([images[2]]);
  });

  it("con dimensiones ya fijadas por el modelo, todo lo que no coincida se rechaza", () => {
    const images = [
      { name: "a", width: 800, height: 600 },
      { name: "b", width: 400, height: 300 },
    ];
    const { mismatched } = findMismatched(images, { width: 800, height: 600 });
    expect(mismatched).toEqual([images[1]]);
  });

  it("un lote sin discrepancias no devuelve nada", () => {
    const images = [
      { width: 800, height: 600 },
      { width: 800, height: 600 },
    ];
    const { mismatched } = findMismatched(images, { width: 800, height: 600 });
    expect(mismatched).toHaveLength(0);
  });

  it("un lote vacío sin base no falla", () => {
    const { expected, mismatched } = findMismatched([], null);
    expect(expected).toBeNull();
    expect(mismatched).toEqual([]);
  });
});
