import { describe, it, expect } from "vitest";
import { validarNombreTraducido } from "@/lib/catalogo/traduccion";

describe("ambos idiomas obligatorios al guardar (FR-011 a FR-016)", () => {
  it("acepta cuando ambos idiomas vienen completos", () => {
    expect(validarNombreTraducido({ es: "Rojo", en: "Red" })).toEqual({
      es: "Rojo",
      en: "Red",
    });
  });

  it("recorta espacios en ambos idiomas", () => {
    expect(validarNombreTraducido({ es: " Rojo ", en: " Red " })).toEqual({
      es: "Rojo",
      en: "Red",
    });
  });

  it("rechaza cuando falta el español", () => {
    expect(validarNombreTraducido({ en: "Red" })).toBeNull();
  });

  it("rechaza cuando falta el inglés", () => {
    expect(validarNombreTraducido({ es: "Rojo" })).toBeNull();
  });

  it("rechaza cuando alguno viene vacío", () => {
    expect(validarNombreTraducido({ es: "  ", en: "Red" })).toBeNull();
  });

  it("rechaza cuando el valor no es un objeto", () => {
    expect(validarNombreTraducido("Rojo")).toBeNull();
    expect(validarNombreTraducido(undefined)).toBeNull();
  });
});
