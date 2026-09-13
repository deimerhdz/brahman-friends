import { describe, it, expect } from "vitest";
import { validarAjustesBasicos, validarUrlRedSocial } from "@/lib/ajustes/validacion";

describe("lib/ajustes/validacion — validarAjustesBasicos (FR-003)", () => {
  it("acepta nombre completo en ambos idiomas", () => {
    expect(
      validarAjustesBasicos({ siteNameEs: "Brahman Friends", siteNameEn: "Brahman Friends" }),
    ).toBe(true);
  });

  it("rechaza si falta el nombre en español", () => {
    expect(validarAjustesBasicos({ siteNameEs: "", siteNameEn: "Brahman Friends" })).toBe(false);
  });

  it("rechaza si falta el nombre en inglés", () => {
    expect(validarAjustesBasicos({ siteNameEs: "Brahman Friends", siteNameEn: "" })).toBe(false);
  });

  it("rechaza espacios en blanco como si estuvieran vacíos", () => {
    expect(validarAjustesBasicos({ siteNameEs: "   ", siteNameEn: "Brahman Friends" })).toBe(
      false,
    );
  });

  it("rechaza valores ausentes o de tipo incorrecto", () => {
    expect(validarAjustesBasicos({ siteNameEs: undefined, siteNameEn: "Brahman Friends" })).toBe(
      false,
    );
    expect(validarAjustesBasicos({ siteNameEs: 123, siteNameEn: "Brahman Friends" })).toBe(false);
  });
});

describe("lib/ajustes/validacion — validarUrlRedSocial (FR-013)", () => {
  it("acepta una URL http o https válida", () => {
    expect(validarUrlRedSocial("https://instagram.com/brahmanfriends")).toBe(true);
    expect(validarUrlRedSocial("http://example.com")).toBe(true);
  });

  it("rechaza texto que no es una URL", () => {
    expect(validarUrlRedSocial("no-es-un-link")).toBe(false);
  });

  it("rechaza un protocolo que no sea http/https", () => {
    expect(validarUrlRedSocial("javascript:alert(1)")).toBe(false);
  });

  it("rechaza vacío o valores de tipo incorrecto", () => {
    expect(validarUrlRedSocial("")).toBe(false);
    expect(validarUrlRedSocial(undefined)).toBe(false);
  });
});
