import type { ModelManifest } from "@/lib/catalogo/model-manifest";
import type { Draft } from "@/lib/design/borrador";

/**
 * Construye el diseño congelado copiando los valores del catálogo, nunca
 * solo identificadores (FR-053, FR-060, RN19, SC-021; contracts/design-payload.md,
 * forma 2). Es lo único que el equipo comercial y producción leen meses
 * después: si algo cambia en el catálogo, esta copia no se entera.
 */
export function buildDesignSnapshot(
  manifest: ModelManifest,
  draft: Draft,
  logoAssets: Record<string, { originalFilename: string; mime: string }>,
) {
  const technique = manifest.techniques.find((t) => t.id === draft.technique) ?? null;

  const selectedColor = manifest.colors.find((c) => c.id === draft.colorId) ?? null;
  const color = selectedColor
    ? { id: selectedColor.id, nameEs: selectedColor.nameEs, nameEn: selectedColor.nameEn }
    : null;

  const allColors = manifest.colors;

  const decorations = draft.decorations.map((d) => {
    const zone = manifest.zones.find((z) => z.position === d.zone);
    const base = {
      zone: d.zone,
      widthCm: d.widthCm,
      heightCm: d.heightCm,
      zoneMaxWidthCm: zone?.maxWidthCm ?? d.widthCm,
      zoneMaxHeightCm: zone?.maxHeightCm ?? d.heightCm,
      offsetXPct: d.offsetXPct,
      offsetYPct: d.offsetYPct,
    };

    if (d.kind === "logo") {
      const asset = logoAssets[d.logoAssetId];
      return {
        ...base,
        kind: "logo" as const,
        logoAssetId: d.logoAssetId,
        logoFilename: asset?.originalFilename ?? "",
        logoMime: asset?.mime ?? "",
      };
    }

    const textColor = allColors.find((c) => c.id === d.colorId);
    return {
      ...base,
      kind: "text" as const,
      content: d.content,
      font: d.font,
      colorNameEs: textColor?.nameEs ?? "",
      colorNameEn: textColor?.nameEn ?? "",
    };
  });

  return {
    kind: "configurable" as const,
    version: 2 as const,
    model: {
      id: manifest.model.id,
      code: manifest.model.code,
      nameEs: manifest.model.nameEs,
      nameEn: manifest.model.nameEn,
    },
    technique: technique
      ? { id: technique.id, nameEs: technique.nameEs, nameEn: technique.nameEn }
      : null,
    color,
    decorations,
    views: manifest.views,
    frozenAt: new Date().toISOString(),
  };
}

/**
 * Snapshot de un pedido de "Producto fijo" (009-modelos-producto-fijo,
 * FR-013, FR-014): copia nombre/descripción/precio/fotos del modelo tal como
 * están en el momento del pedido — no hay colores, decoraciones ni técnica
 * porque no aplican a un producto no personalizable.
 */
export function buildFixedProductSnapshot(
  model: {
    id: string;
    price: string | null;
  },
  translations: {
    nameEs: string;
    nameEn: string;
    descriptionEs: string;
    descriptionEn: string;
  },
  photos: { view: string; url: string }[],
) {
  return {
    kind: "fixed_product" as const,
    version: 1 as const,
    modelId: model.id,
    nameEs: translations.nameEs,
    nameEn: translations.nameEn,
    descriptionEs: translations.descriptionEs,
    descriptionEn: translations.descriptionEn,
    price: model.price,
    photos,
    frozenAt: new Date().toISOString(),
  };
}

export type DesignSnapshot =
  | ReturnType<typeof buildDesignSnapshot>
  | ReturnType<typeof buildFixedProductSnapshot>;
