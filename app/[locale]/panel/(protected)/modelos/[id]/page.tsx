import { eq, desc, inArray } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import {
  capModel,
  color,
  component,
  componentColor,
  componentImage,
  modelView,
  decorationZone,
  modelTechnique,
} from "@/lib/db/schema";
import {
  capModelConNombre,
  colorConNombre,
  componentConNombre,
  techniqueConNombre,
} from "@/lib/catalogo/consultas-traducidas";
import { getT, type Locale } from "@/lib/i18n/t";
import { env } from "@/lib/config/env";
import { ModeloConfigurador } from "./_components/ModeloConfigurador";
import type { ZonaValue, Position } from "./_components/PasoPersonalizacion";

type View = "front" | "side" | "back";

export default async function ModeloConfigPage({
  params,
}: {
  params: Promise<{ locale: Locale; id: string }>;
}) {
  const { locale, id } = await params;
  const t = getT(locale);

  const [model] = await capModelConNombre().where(eq(capModel.id, id)).limit(1);
  if (!model) notFound();

  const existingViews = await db
    .select()
    .from(modelView)
    .where(eq(modelView.modelId, id));
  if (existingViews.length === 0) {
    // La vista frontal siempre debe existir para poder trabajar el modelo (FR-006).
    await db.insert(modelView).values({ modelId: id, view: "front" });
    existingViews.push({ modelId: id, view: "front", baseImageUrl: null, active: true });
  }

  const [colors, components, zones, techniques, techniqueLinks, images] =
    await Promise.all([
      colorConNombre().where(eq(color.modelId, id)).orderBy(desc(color.createdAt)),
      componentConNombre().where(eq(component.modelId, id)),
      db.select().from(decorationZone).where(eq(decorationZone.modelId, id)),
      techniqueConNombre(),
      db.select().from(modelTechnique).where(eq(modelTechnique.modelId, id)),
      db.select().from(componentImage).where(eq(componentImage.modelId, id)),
    ]);

  const componentIds = components.map((c) => c.id);
  const links = componentIds.length
    ? await db
        .select()
        .from(componentColor)
        .where(inArray(componentColor.componentId, componentIds))
    : [];

  const enabledByComponent: Record<string, { colorId: string; views: View[] }[]> = {};
  for (const link of links) {
    const perComponent = (enabledByComponent[link.componentId] ??= []);
    const entry = perComponent.find((e) => e.colorId === link.colorId);
    if (entry) entry.views.push(link.view);
    else perComponent.push({ colorId: link.colorId, views: [link.view] });
  }

  const views: Partial<Record<View, string>> = {};
  const viewRows: Record<View, { baseImageUrl: string | null; active: boolean }> = {
    front: { baseImageUrl: null, active: true },
    side: { baseImageUrl: null, active: false },
    back: { baseImageUrl: null, active: false },
  };
  for (const v of existingViews) {
    if (v.baseImageUrl) views[v.view] = v.baseImageUrl;
    viewRows[v.view] = { baseImageUrl: v.baseImageUrl, active: v.active };
  }
  // Determina qué vistas están habilitadas para la tienda (front siempre lo
  // está); las ocultas conservan su imagen pero no cuentan para los pasos
  // de Colores/Personalización.
  const activeViews = (Object.keys(viewRows) as View[]).filter(
    (v) => viewRows[v].active,
  );

  const zonesByPosition: Partial<Record<Position, ZonaValue>> = {};
  for (const z of zones) {
    zonesByPosition[z.position] = {
      position: z.position,
      maxWidthCm: Number(z.maxWidthCm),
      maxHeightCm: Number(z.maxHeightCm),
      boxX: z.boxX,
      boxY: z.boxY,
      boxW: z.boxW,
      boxH: z.boxH,
      arc: Number(z.arc),
      tilt: Number(z.tilt),
      taper: Number(z.taper),
      maxTextChars: z.maxTextChars,
    };
  }

  const labels: Record<string, string> = {
    // Encabezado
    name: t("common.name"),
    description: t("common.description"),
    price: t("panel.modelos.price"),
    code: t("panel.modelos.code"),
    switchEs: t("panel.switchIdioma.es"),
    switchEn: t("panel.switchIdioma.en"),
    status_draft: t("panel.modelos.status.draft"),
    status_published: t("panel.modelos.status.published"),
    publish: t("panel.modelos.publish"),
    unpublish: t("panel.modelos.unpublish"),
    incomplete: t("errors.publicacion_incompleta"),
    missingBaseViews: t("panel.modelos.missingBaseViews"),
    componentsWithoutColors: t("panel.modelos.componentsWithoutColors"),
    // Tabs
    tabViews: t("panel.modelos.tabViews"),
    tabColors: t("panel.modelos.tabColors"),
    tabPersonalization: t("panel.modelos.tabPersonalization"),
    // Paso 1 — Vistas
    step1: t("panel.modelos.step1"),
    step1Hint: t("panel.modelos.step1Hint"),
    coverPhoto: t("panel.modelos.coverPhoto"),
    coverPhotoHint: t("panel.modelos.coverPhotoHint"),
    view_front: t("panel.modelos.view.front"),
    view_side: t("panel.modelos.view.side"),
    view_back: t("panel.modelos.view.back"),
    frontRequired: t("panel.modelos.frontRequired"),
    hiddenFromCatalog: t("panel.modelos.hiddenFromCatalog"),
    upload: t("common.upload"),
    uploading: t("common.uploading"),
    uploadSuccess: t("common.uploadSuccess"),
    retry: t("common.retry"),
    error: t("errors.generic"),
    // Paso 2 — Colores
    step2: t("panel.modelos.step2"),
    step2Hint: t("panel.modelos.step2Hint"),
    defaultVariant: t("panel.modelos.defaultVariant"),
    defaultVariantHint: t("panel.modelos.defaultVariantHint"),
    configuredColors: t("panel.modelos.configuredColors"),
    parts: t("panel.modelos.parts"),
    markDefault: t("panel.modelos.markDefault"),
    addColor: t("panel.modelos.addColor"),
    viewsProgress: t("panel.modelos.viewsProgress"),
    readyForStore: t("panel.modelos.readyForStore"),
    pendingPhotos: t("panel.modelos.pendingPhotos"),
    edit: t("common.edit"),
    delete: t("common.delete"),
    save: t("common.save"),
    cancel: t("common.cancel"),
    add: t("panel.modelos.addComponent"),
    defaultColor: t("panel.modelos.defaultColor"),
    notCustomizable: t("panel.modelos.notCustomizable"),
    confirmRemoveView: t("panel.modelos.confirmRemoveView"),
    confirmDeleteImage: t("panel.modelos.confirmDeleteImage"),
    confirmDeleteVariant: t("panel.modelos.confirmDeleteVariant"),
    deleteVariant: t("panel.modelos.deleteVariant"),
    manageParts: t("panel.modelos.manageParts"),
    material: t("panel.colores.material"),
    layerOrder: t("panel.modelos.layerOrder"),
    customizable: t("panel.modelos.customizable"),
    confirmDelete: t("panel.modelos.confirmDeleteComponent"),
    // Paso 3 — Personalización
    step3: t("panel.modelos.step3"),
    step3Hint: t("panel.modelos.step3Hint"),
    maxWidthCm: t("panel.modelos.maxWidthCm"),
    maxHeightCm: t("panel.modelos.maxHeightCm"),
    arc: t("panel.modelos.arc"),
    tilt: t("panel.modelos.tilt"),
    taper: t("panel.modelos.taper"),
    previewLogo: t("panel.modelos.previewLogo"),
    previewColorLabel: t("panel.modelos.previewColorLabel"),
    previewColorBlack: t("panel.modelos.previewColorBlack"),
    previewColorWhite: t("panel.modelos.previewColorWhite"),
    maxTextChars: t("panel.modelos.maxTextChars"),
    techniques: t("panel.modelos.techniques"),
    advanced: t("panel.modelos.advanced"),
    zone_front: t("panel.modelos.zone.front"),
    zone_left: t("panel.modelos.zone.left"),
    zone_right: t("panel.modelos.zone.right"),
    zone_back: t("panel.modelos.zone.back"),
    // Canvas / barra inferior
    noImage: t("panel.modelos.noImage"),
    preview: t("panel.modelos.preview"),
    saveChanges: t("panel.modelos.saveChanges"),
    autosaveActive: t("panel.modelos.autosaveActive"),
    changesSaved: t("panel.modelos.changesSaved"),
  };

  return (
    <ModeloConfigurador
      locale={locale}
      modelId={id}
      code={model.code}
      status={model.status}
      nameEs={model.nameEs}
      nameEn={model.nameEn}
      descriptionEs={model.descriptionEs}
      descriptionEn={model.descriptionEn}
      price={model.price}
      imageWidth={model.imageWidth}
      imageHeight={model.imageHeight}
      views={views}
      viewRows={viewRows}
      colors={colors}
      defaultColorId={model.defaultColorId}
      components={components}
      activeViews={activeViews}
      enabledByComponent={enabledByComponent}
      cargadas={images.map((i) => ({
        componentId: i.componentId,
        colorId: i.colorId,
        view: i.view,
        imageUrl: i.imageUrl,
      }))}
      zonesByPosition={zonesByPosition}
      defaultZoneChars={env.defaultZoneTextChars}
      techniques={techniques}
      enabledTechniqueIds={techniqueLinks.map((l) => l.techniqueId)}
      labels={labels}
    />
  );
}
