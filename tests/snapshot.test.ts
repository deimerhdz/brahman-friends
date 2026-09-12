import { describe, it, expect } from "vitest";
import {
  buildFixedProductSnapshot,
  type DesignSnapshot,
} from "@/lib/solicitud/snapshot";

describe("lib/solicitud/snapshot — buildFixedProductSnapshot (009-modelos-producto-fijo, FR-013, FR-014)", () => {
  it("congela nombre, descripción, precio y fotos del modelo en ese momento", () => {
    const snapshot = buildFixedProductSnapshot(
      { id: "modelo-1", price: "35.00" },
      {
        nameEs: "Gorra clásica",
        nameEn: "Classic cap",
        descriptionEs: "Gorra de algodón",
        descriptionEn: "Cotton cap",
      },
      [{ view: "front", url: "https://cdn.example.com/front.png" }],
    );

    expect(snapshot.kind).toBe("fixed_product");
    expect(snapshot.modelId).toBe("modelo-1");
    expect(snapshot.nameEs).toBe("Gorra clásica");
    expect(snapshot.nameEn).toBe("Classic cap");
    expect(snapshot.descriptionEs).toBe("Gorra de algodón");
    expect(snapshot.descriptionEn).toBe("Cotton cap");
    expect(snapshot.price).toBe("35.00");
    expect(snapshot.photos).toEqual([
      { view: "front", url: "https://cdn.example.com/front.png" },
    ]);
    expect(typeof snapshot.frozenAt).toBe("string");
  });

  it("permite discriminar por kind junto a un snapshot configurable (DesignSnapshot)", () => {
    const fixed: DesignSnapshot = buildFixedProductSnapshot(
      { id: "modelo-1", price: null },
      { nameEs: "", nameEn: "", descriptionEs: "", descriptionEn: "" },
      [],
    );

    if (fixed.kind === "fixed_product") {
      expect(fixed.photos).toEqual([]);
    } else {
      throw new Error("kind debería ser fixed_product");
    }
  });
});
