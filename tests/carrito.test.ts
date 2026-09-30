import { describe, it, expect } from "vitest";
import {
  reducirCarrito,
  totalUnidades,
  mensajeCarrito,
  leerCarritoGuardado,
  type LineaCarrito,
} from "@/lib/carrito/carrito";

const gorra = {
  modelId: "m1",
  nombre: "La Legado",
  imagenUrl: null,
  color: "",
};

function agregar(
  lineas: LineaCarrito[],
  linea: Omit<LineaCarrito, "clave" | "cantidad">,
) {
  return reducirCarrito(lineas, { tipo: "agregar", linea });
}

describe("carrito (FR-020)", () => {
  it("agrega una línea nueva con cantidad 1", () => {
    const lineas = agregar([], gorra);
    expect(lineas).toEqual([{ ...gorra, clave: "m1:", cantidad: 1 }]);
  });

  it("suma 1 si el mismo producto y color ya está", () => {
    const lineas = agregar(agregar([], gorra), gorra);
    expect(lineas).toHaveLength(1);
    expect(lineas[0]!.cantidad).toBe(2);
  });

  it("crea otra línea para el mismo modelo con otro color", () => {
    const lineas = agregar(agregar([], gorra), { ...gorra, color: "Negro" });
    expect(lineas.map((l) => l.clave)).toEqual(["m1:", "m1:Negro"]);
  });

  it("cambia cantidades y elimina la línea al llegar a 0", () => {
    let lineas = agregar([], gorra);
    lineas = reducirCarrito(lineas, {
      tipo: "cambiarCantidad",
      clave: "m1:",
      delta: 1,
    });
    expect(lineas[0]!.cantidad).toBe(2);
    lineas = reducirCarrito(lineas, {
      tipo: "cambiarCantidad",
      clave: "m1:",
      delta: -1,
    });
    lineas = reducirCarrito(lineas, {
      tipo: "cambiarCantidad",
      clave: "m1:",
      delta: -1,
    });
    expect(lineas).toEqual([]);
  });

  it("elimina y vacía", () => {
    const lineas = agregar(agregar([], gorra), { ...gorra, modelId: "m2" });
    expect(
      reducirCarrito(lineas, { tipo: "eliminar", clave: "m1:" }).map(
        (l) => l.modelId,
      ),
    ).toEqual(["m2"]);
    expect(reducirCarrito(lineas, { tipo: "vaciar" })).toEqual([]);
  });

  it("totalUnidades suma las cantidades", () => {
    const lineas = agregar(agregar(agregar([], gorra), gorra), {
      ...gorra,
      modelId: "m2",
    });
    expect(totalUnidades(lineas)).toBe(3);
  });
});

describe("leerCarritoGuardado (FR-021)", () => {
  it("recupera líneas válidas y descarta el resto", () => {
    const valida = { ...gorra, clave: "m1:", cantidad: 2 };
    expect(
      leerCarritoGuardado(
        JSON.stringify([valida, { clave: "x" }, { ...valida, cantidad: 0 }]),
      ),
    ).toEqual([valida]);
  });

  it("devuelve vacío con JSON inválido o sin datos", () => {
    expect(leerCarritoGuardado("{no es json")).toEqual([]);
    expect(leerCarritoGuardado(null)).toEqual([]);
    expect(leerCarritoGuardado('{"a":1}')).toEqual([]);
  });
});

describe("mensajeCarrito (FR-022)", () => {
  it("lista cada línea, con color solo si lo tiene", () => {
    const lineas = agregar(agregar(agregar([], gorra), gorra), {
      ...gorra,
      modelId: "m2",
      nombre: "La Raza",
      color: "Negro",
    });
    expect(
      mensajeCarrito(
        "Hola, quiero consultar este pedido de Brahman Friends:",
        lineas,
      ),
    ).toBe(
      "Hola, quiero consultar este pedido de Brahman Friends:\n• 2 × La Legado\n• 1 × La Raza — Negro",
    );
  });
});
