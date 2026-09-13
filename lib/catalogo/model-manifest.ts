import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  capModel,
  color,
  modelView,
  colorImage,
  decorationZone,
  modelTechnique,
} from "@/lib/db/schema";
import {
  capModelConNombre,
  colorConNombre,
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

  const [views, colors, images, zones, techniques, modelTechniques] =
    await Promise.all([
      db
        .select()
        .from(modelView)
        .where(and(eq(modelView.modelId, modelId), eq(modelView.active, true))),
      colorConNombre().where(eq(color.modelId, modelId)),
      db.select().from(colorImage).where(eq(colorImage.modelId, modelId)),
      db.select().from(decorationZone).where(eq(decorationZone.modelId, modelId)),
      techniqueConNombre(),
      db.select().from(modelTechnique).where(eq(modelTechnique.modelId, modelId)),
    ]);

  const sortedViews = [...views].sort(
    (a, b) => VIEW_ORDER.indexOf(a.view) - VIEW_ORDER.indexOf(b.view),
  );

  const colorsPayload = colors
    .sort((a, b) =>
      a.id === model.defaultColorId ? -1 : b.id === model.defaultColorId ? 1 : 0,
    )
    .map((c) => ({
      id: c.id,
      nameEs: c.nameEs,
      nameEn: c.nameEn,
      images: Object.fromEntries(
        images.filter((img) => img.colorId === c.id).map((img) => [img.view, img.imageUrl]),
      ) as Partial<Record<"front" | "side" | "back", string>>,
    }));

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
    colors: colorsPayload,
    defaultColorId: model.defaultColorId,
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
