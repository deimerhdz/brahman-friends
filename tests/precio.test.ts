import { describe, it, expect } from "vitest";
import { formatUsd } from "@/lib/catalogo/precio";

describe("formatUsd (FR-018, Principio II)", () => {
  it("escribe la moneda como US$ con dos decimales", () => {
    expect(formatUsd("120")).toBe("US$ 120.00");
  });

  it("usa separador de miles", () => {
    expect(formatUsd("1500.5")).toBe("US$ 1,500.50");
  });
});
