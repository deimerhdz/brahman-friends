import { describe, it, expect } from "vitest";
import {
  checkPublicacion,
  canPublish,
  checkPublicacionProductoFijo,
  canPublishProductoFijo,
  type PublicacionInput,
} from "@/lib/catalogo/publicacion";

function baseInput(): PublicacionInput {
  return {
    activeViews: ["front", "side"],
    viewsWithBaseImage: ["front", "side"],
    colors: [
      { id: "azul", nameEs: "Azul Rey", nameEn: "Royal Blue" },
      { id: "rojo", nameEs: "Rojo", nameEn: "Red" },
    ],
    colorImages: [
      { colorId: "azul", view: "front" },
      { colorId: "azul", view: "side" },
      { colorId: "rojo", view: "front" },
      { colorId: "rojo", view: "side" },
    ],
  };
}

describe("lib/catalogo/publicacion — qué falta para publicar (FR-012, RN2)", () => {
  it("un modelo completo puede publicarse", () => {
    const result = checkPublicacion(baseInput());
    expect(result.missing).toEqual([]);
    expect(result.missingBaseViews).toEqual([]);
    expect(result.noColors).toBe(false);
    expect(canPublish(result)).toBe(true);
  });

  it("señala exactamente la combinación de imagen faltante", () => {
    const input = baseInput();
    input.colorImages = input.colorImages.filter(
      (img) => !(img.colorId === "rojo" && img.view === "side"),
    );
    const result = checkPublicacion(input);
    expect(result.missing).toEqual([{ color: "Rojo", view: "side" }]);
    expect(canPublish(result)).toBe(false);
  });

  it("señala las vistas base sin imagen", () => {
    const input = baseInput();
    input.viewsWithBaseImage = ["front"];
    const result = checkPublicacion(input);
    expect(result.missingBaseViews).toEqual(["side"]);
    expect(canPublish(result)).toBe(false);
  });

  it("señala que el modelo no tiene ningún color configurado", () => {
    const input = baseInput();
    input.colors = [];
    input.colorImages = [];
    const result = checkPublicacion(input);
    expect(result.noColors).toBe(true);
    expect(canPublish(result)).toBe(false);
  });

  it("solo exige fotos para las vistas activas del modelo", () => {
    const input = baseInput();
    input.activeViews = ["front"];
    input.colorImages = input.colorImages.filter((img) => img.view === "front");
    const result = checkPublicacion(input);
    expect(result.missing).toEqual([]);
    expect(canPublish(result)).toBe(true);
  });
});

describe("lib/catalogo/publicacion — producto fijo (009-modelos-producto-fijo, FR-002, FR-006)", () => {
  it("con precio y al menos una foto, se puede publicar", () => {
    const result = checkPublicacionProductoFijo({
      price: "35.00",
      viewsWithBaseImage: ["front"],
    });
    expect(result).toEqual({ missingPrice: false, missingPhoto: false });
    expect(canPublishProductoFijo(result)).toBe(true);
  });

  it("sin precio, señala missingPrice y no se puede publicar", () => {
    const result = checkPublicacionProductoFijo({
      price: null,
      viewsWithBaseImage: ["front"],
    });
    expect(result.missingPrice).toBe(true);
    expect(canPublishProductoFijo(result)).toBe(false);
  });

  it("sin ninguna foto, señala missingPhoto y no se puede publicar", () => {
    const result = checkPublicacionProductoFijo({
      price: "35.00",
      viewsWithBaseImage: [],
    });
    expect(result.missingPhoto).toBe(true);
    expect(canPublishProductoFijo(result)).toBe(false);
  });

  it("sin precio ni fotos, señala ambos", () => {
    const result = checkPublicacionProductoFijo({
      price: null,
      viewsWithBaseImage: [],
    });
    expect(result).toEqual({ missingPrice: true, missingPhoto: true });
    expect(canPublishProductoFijo(result)).toBe(false);
  });

  it("no le importan colores ni componentes, a diferencia de un modelo configurable", () => {
    const result = checkPublicacionProductoFijo({
      price: "10.00",
      viewsWithBaseImage: ["front", "side", "back"],
    });
    expect(canPublishProductoFijo(result)).toBe(true);
  });
});
