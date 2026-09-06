import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  capModel,
  modelView,
  component,
  componentColor,
  componentImage,
  decorationZone,
  modelSize,
  modelTechnique,
} from "@/lib/db/schema";
import {
  capModelConNombre,
  colorConNombre,
  componentConNombre,
  techniqueConNombre,
} from "@/lib/catalogo/consultas-traducidas";

const VIEW_ORDER = ["front", "side", "back"] as const;

/**
 * Todo lo que el configurador necesita para un modelo publicado (FR-031a).
 * Usado tanto por la página del configurador (renderizado en el servidor,
 * FR-029) como por `GET /api/imagenes-modelo/:modelId` (contracts/api.md),
 * para no tener dos versiones de la misma consulta.
 */
export async function loadModelManifest(modelId: string) {
  const [model] = await capModelConNombre()
    .where(and(eq(capModel.id, modelId), eq(capModel.status, "published")))
    .limit(1);

  if (!model) return null;

  const [
    views,
    components,
    links,
    colors,
    images,
    zones,
    sizes,
    techniques,
    modelTechniques,
  ] = await Promise.all([
    db.select().from(modelView).where(eq(modelView.modelId, modelId)),
    componentConNombre().where(eq(component.modelId, modelId)),
    db.select().from(componentColor),
    colorConNombre(),
    db.select().from(componentImage).where(eq(componentImage.modelId, modelId)),
    db.select().from(decorationZone).where(eq(decorationZone.modelId, modelId)),
    db.select().from(modelSize).where(eq(modelSize.modelId, modelId)),
    techniqueConNombre(),
    db.select().from(modelTechnique).where(eq(modelTechnique.modelId, modelId)),
  ]);

  const colorsById = new Map(colors.map((c) => [c.id, c]));
  const sortedViews = [...views].sort(
    (a, b) => VIEW_ORDER.indexOf(a.view) - VIEW_ORDER.indexOf(b.view),
  );

  const componentsPayload = components
    .slice()
    .sort((a, b) => a.layerOrder - b.layerOrder)
    .map((comp) => {
      const enabledColorIds = [
        ...new Set(
          links.filter((l) => l.componentId === comp.id).map((l) => l.colorId),
        ),
      ];

      const compColors = enabledColorIds
        .map((id) => colorsById.get(id))
        .filter((c): c is NonNullable<typeof c> => !!c)
        .sort((a, b) =>
          a.id === comp.defaultColorId
            ? -1
            : b.id === comp.defaultColorId
              ? 1
              : 0,
        )
        .map((c) => ({
          id: c.id,
          nameEs: c.nameEs,
          nameEn: c.nameEn,
          supplierRef: c.supplierRef,
          sampleImageUrl: c.sampleImageUrl,
          status: c.status,
          images: Object.fromEntries(
            images
              .filter(
                (img) => img.componentId === comp.id && img.colorId === c.id,
              )
              .map((img) => [img.view, img.imageUrl]),
          ) as Partial<Record<"front" | "side" | "back", string>>,
        }));

      return {
        id: comp.id,
        nameEs: comp.nameEs,
        nameEn: comp.nameEn,
        material: comp.material,
        customizable: comp.customizable,
        layerOrder: comp.layerOrder,
        defaultColorId: comp.defaultColorId,
        colors: compColors,
      };
    });

  return {
    model: {
      id: model.id,
      code: model.code,
      nameEs: model.nameEs,
      nameEn: model.nameEn,
      imageWidth: model.imageWidth,
      imageHeight: model.imageHeight,
    },
    views: sortedViews.map((v) => v.view),
    baseImages: Object.fromEntries(
      sortedViews.map((v) => [v.view, v.baseImageUrl]),
    ) as Partial<Record<"front" | "side" | "back", string | null>>,
    components: componentsPayload,
    zones: zones.map((z) => ({
      id: z.id,
      position: z.position,
      maxWidthCm: Number(z.maxWidthCm),
      maxHeightCm: Number(z.maxHeightCm),
      box: { x: z.boxX, y: z.boxY, w: z.boxW, h: z.boxH },
      arc: Number(z.arc),
      tilt: Number(z.tilt),
      taper: Number(z.taper),
      maxTextChars: z.maxTextChars,
    })),
    sizes: sizes
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((s) => ({ label: s.label })),
    techniques: modelTechniques
      .map((mt) => techniques.find((t) => t.id === mt.techniqueId))
      .filter((t): t is NonNullable<typeof t> => !!t)
      .map((t) => ({ id: t.id, nameEs: t.nameEs, nameEn: t.nameEn })),
    // Cantidad mínima de pedido; NULL en la base se trata como 1 (FR-012).
    moq: model.moq ?? 1,
  };
}

export type ModelManifest = NonNullable<
  Awaited<ReturnType<typeof loadModelManifest>>
>;
