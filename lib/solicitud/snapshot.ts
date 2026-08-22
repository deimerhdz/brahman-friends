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

  const components = manifest.components
    .filter((c) => c.customizable)
    .map((comp) => {
      const colorId = draft.colors[comp.id];
      const color = comp.colors.find((c) => c.id === colorId) ?? null;
      return {
        id: comp.id,
        nameEs: comp.nameEs,
        nameEn: comp.nameEn,
        material: comp.material,
        customizable: comp.customizable,
        color: color
          ? {
              id: color.id,
              nameEs: color.nameEs,
              nameEn: color.nameEn,
              supplierRef: color.supplierRef,
              material: comp.material,
              sampleImageUrl: color.sampleImageUrl,
            }
          : null,
      };
    });

  const allColors = manifest.components.flatMap((c) => c.colors);

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

    const color = allColors.find((c) => c.id === d.colorId);
    return {
      ...base,
      kind: "text" as const,
      content: d.content,
      font: d.font,
      colorNameEs: color?.nameEs ?? "",
      colorNameEn: color?.nameEn ?? "",
    };
  });

  return {
    version: 1 as const,
    model: {
      id: manifest.model.id,
      code: manifest.model.code,
      nameEs: manifest.model.nameEs,
      nameEn: manifest.model.nameEn,
    },
    technique: technique
      ? { id: technique.id, nameEs: technique.nameEs, nameEn: technique.nameEn }
      : null,
    components,
    decorations,
    views: manifest.views,
    frozenAt: new Date().toISOString(),
  };
}

export type DesignSnapshot = ReturnType<typeof buildDesignSnapshot>;
