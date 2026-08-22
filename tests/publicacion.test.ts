import { describe, it, expect } from "vitest";
import {
  checkPublicacion,
  canPublish,
  type PublicacionInput,
} from "@/lib/catalogo/publicacion";

function baseInput(): PublicacionInput {
  return {
    activeViews: ["front", "side"],
    viewsWithBaseImage: ["front", "side"],
    components: [
      {
        id: "corona",
        nameEs: "Corona",
        nameEn: "Crown",
        material: "fabric",
        customizable: true,
        defaultColorId: "azul",
      },
      {
        id: "boton",
        nameEs: "Botón",
        nameEn: "Button",
        material: "plastic",
        customizable: false,
        defaultColorId: null,
      },
    ],
    componentColors: [
      { componentId: "corona", colorId: "azul" },
      { componentId: "corona", colorId: "rojo" },
    ],
    colors: [
      { id: "azul", nameEs: "Azul Rey", nameEn: "Royal Blue", status: "available" },
      { id: "rojo", nameEs: "Rojo", nameEn: "Red", status: "available" },
    ],
    images: [
      { componentId: "corona", colorId: "azul", view: "front" },
      { componentId: "corona", colorId: "azul", view: "side" },
      { componentId: "corona", colorId: "rojo", view: "front" },
      { componentId: "corona", colorId: "rojo", view: "side" },
    ],
  };
}

describe("lib/catalogo/publicacion — qué falta para publicar (FR-012, RN2, RN9)", () => {
  it("un modelo completo puede publicarse", () => {
    const result = checkPublicacion(baseInput());
    expect(result.missing).toEqual([]);
    expect(result.missingBaseViews).toEqual([]);
    expect(result.componentsWithoutColors).toEqual([]);
    expect(canPublish(result)).toBe(true);
  });

  it("señala exactamente la combinación de imagen faltante", () => {
    const input = baseInput();
    input.images = input.images.filter(
      (img) => !(img.colorId === "rojo" && img.view === "side"),
    );
    const result = checkPublicacion(input);
    expect(result.missing).toEqual([
      { component: "Corona", color: "Rojo", view: "side" },
    ]);
    expect(canPublish(result)).toBe(false);
  });

  it("señala las vistas base sin imagen", () => {
    const input = baseInput();
    input.viewsWithBaseImage = ["front"];
    const result = checkPublicacion(input);
    expect(result.missingBaseViews).toEqual(["side"]);
    expect(canPublish(result)).toBe(false);
  });

  it("señala un componente personalizable sin ningún color habilitado", () => {
    const input = baseInput();
    input.componentColors = [];
    const result = checkPublicacion(input);
    expect(result.componentsWithoutColors).toEqual(["Corona"]);
    expect(canPublish(result)).toBe(false);
  });

  it("un componente no personalizable nunca exige imágenes por color", () => {
    const input = baseInput();
    const result = checkPublicacion(input);
    expect(
      result.missing.some((m) => m.component === "Botón"),
    ).toBe(false);
  });

  it("el color por defecto debe estar entre los habilitados y disponibles (RN9)", () => {
    const input = baseInput();
    input.colors = input.colors.map((c) =>
      c.id === "azul" ? { ...c, status: "out_of_stock" as const } : c,
    );
    const result = checkPublicacion(input);
    expect(result.componentsWithoutColors).toEqual(["Corona"]);
  });
});
