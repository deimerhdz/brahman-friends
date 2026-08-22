import { describe, it, expect } from "vitest";
import { canTransition, allowedTransitions, isFinal } from "@/lib/solicitud/estados";

describe("lib/solicitud/estados — transiciones de la solicitud (FR-063, RN21)", () => {
  it("permite el camino feliz completo", () => {
    expect(canTransition("new", "in_review")).toBe(true);
    expect(canTransition("in_review", "quoted")).toBe(true);
    expect(canTransition("quoted", "closed")).toBe(true);
  });

  it("permite rechazar desde cualquier estado abierto", () => {
    expect(canTransition("new", "rejected")).toBe(true);
    expect(canTransition("in_review", "rejected")).toBe(true);
    expect(canTransition("quoted", "rejected")).toBe(true);
  });

  it("no permite saltar pasos", () => {
    expect(canTransition("new", "closed")).toBe(false);
    expect(canTransition("new", "quoted")).toBe(false);
    expect(canTransition("in_review", "closed")).toBe(false);
  });

  it("los estados finales no admiten ninguna transición", () => {
    expect(allowedTransitions("closed")).toEqual([]);
    expect(allowedTransitions("rejected")).toEqual([]);
    expect(canTransition("closed", "new")).toBe(false);
    expect(canTransition("rejected", "new")).toBe(false);
  });

  it("no permite quedarse en el mismo estado como transición", () => {
    expect(canTransition("new", "new")).toBe(false);
  });

  it("identifica los estados finales", () => {
    expect(isFinal("closed")).toBe(true);
    expect(isFinal("rejected")).toBe(true);
    expect(isFinal("new")).toBe(false);
    expect(isFinal("in_review")).toBe(false);
    expect(isFinal("quoted")).toBe(false);
  });
});
