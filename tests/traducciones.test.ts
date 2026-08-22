import { describe, it, expect } from "vitest";
import es from "@/messages/es.json";
import en from "@/messages/en.json";

function flattenKeys(obj: unknown, prefix = ""): string[] {
  if (typeof obj !== "object" || obj === null) return [prefix];
  return Object.entries(obj as Record<string, unknown>).flatMap(([k, v]) =>
    flattenKeys(v, prefix ? `${prefix}.${k}` : k),
  );
}

describe("paridad de traducciones (Principio II)", () => {
  it("es.json y en.json tienen exactamente las mismas claves", () => {
    const esKeys = flattenKeys(es).sort();
    const enKeys = flattenKeys(en).sort();

    const onlyInEs = esKeys.filter((k) => !enKeys.includes(k));
    const onlyInEn = enKeys.filter((k) => !esKeys.includes(k));

    expect(onlyInEs, "claves presentes solo en es.json").toEqual([]);
    expect(onlyInEn, "claves presentes solo en en.json").toEqual([]);
  });
});
