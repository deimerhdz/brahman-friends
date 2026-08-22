import { describe, it, expect } from "vitest";
import {
  totalOf,
  sizesMatchQuantity,
  sizesAreValidForModel,
} from "@/lib/solicitud/tallas";

describe("lib/solicitud/tallas — cuadre de tallas (FR-048, RN17)", () => {
  it("suma las cantidades por talla", () => {
    expect(totalOf([{ label: "M", quantity: 30 }, { label: "L", quantity: 30 }])).toBe(60);
  });

  it("acepta cuando la suma iguala el total", () => {
    const sizes = [{ label: "M", quantity: 30 }, { label: "L", quantity: 30 }];
    expect(sizesMatchQuantity(sizes, 60)).toBe(true);
  });

  it("rechaza cuando la suma es menor al total", () => {
    const sizes = [{ label: "M", quantity: 30 }, { label: "L", quantity: 25 }];
    expect(sizesMatchQuantity(sizes, 60)).toBe(false);
  });

  it("rechaza cuando la suma es mayor al total", () => {
    const sizes = [{ label: "M", quantity: 40 }, { label: "L", quantity: 30 }];
    expect(sizesMatchQuantity(sizes, 60)).toBe(false);
  });

  it("rechaza una lista vacía", () => {
    expect(sizesMatchQuantity([], 0)).toBe(false);
  });

  it("rechaza una cantidad negativa o cero en una talla", () => {
    const sizes = [{ label: "M", quantity: 60 }, { label: "L", quantity: 0 }];
    expect(sizesMatchQuantity(sizes, 60)).toBe(false);
  });

  it("valida que las tallas pertenezcan al modelo y no se repitan", () => {
    const modelSizes = ["S", "M", "L"];
    expect(
      sizesAreValidForModel([{ label: "M", quantity: 10 }], modelSizes),
    ).toBe(true);
    expect(
      sizesAreValidForModel([{ label: "XL", quantity: 10 }], modelSizes),
    ).toBe(false);
    expect(
      sizesAreValidForModel(
        [{ label: "M", quantity: 5 }, { label: "M", quantity: 5 }],
        modelSizes,
      ),
    ).toBe(false);
  });
});
