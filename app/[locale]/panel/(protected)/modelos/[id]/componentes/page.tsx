import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import {
  capModel,
  component,
  componentColor,
  componentImage,
  modelView,
} from "@/lib/db/schema";
import {
  componentConNombre,
  colorConNombre,
} from "@/lib/catalogo/consultas-traducidas";
import { getT, type Locale } from "@/lib/i18n/t";
import { ComponentesManager } from "./_ComponentesManager";
import { PanelHeader } from "../../../_PanelHeader";

type View = "front" | "side" | "back";

export default async function ComponentesPage({
  params,
}: {
  params: Promise<{ locale: Locale; id: string }>;
}) {
  const { locale, id } = await params;
  const t = getT(locale);

  const [model] = await db
    .select()
    .from(capModel)
    .where(eq(capModel.id, id))
    .limit(1);
  if (!model) notFound();

  const [components, colors, links, views, images] = await Promise.all([
    componentConNombre().where(eq(component.modelId, id)),
    colorConNombre(),
    db.select().from(componentColor),
    db.select().from(modelView).where(eq(modelView.modelId, id)),
    db.select().from(componentImage).where(eq(componentImage.modelId, id)),
  ]);

  const enabledByComponent: Record<
    string,
    { colorId: string; views: View[] }[]
  > = {};
  for (const link of links) {
    const perComponent = (enabledByComponent[link.componentId] ??= []);
    const entry = perComponent.find((e) => e.colorId === link.colorId);
    if (entry) entry.views.push(link.view);
    else perComponent.push({ colorId: link.colorId, views: [link.view] });
  }

  return (
    <div>
      <PanelHeader
        eyebrow={t("nav.models")}
        title={t("panel.modelos.components")}
        backHref={`/${locale}/panel/modelos/${id}`}
        backLabel={t("common.back")}
      />
      <ComponentesManager
        locale={locale}
        modelId={id}
        components={components}
        colors={colors}
        activeViews={views.map((v) => v.view)}
        enabledByComponent={enabledByComponent}
        cargadas={images.map((i) => ({
          componentId: i.componentId,
          colorId: i.colorId,
          view: i.view,
          imageUrl: i.imageUrl,
        }))}
        labels={{
          name: t("common.name"),
          switchEs: t("panel.switchIdioma.es"),
          switchEn: t("panel.switchIdioma.en"),
          material: t("panel.colores.material"),
          layerOrder: t("panel.modelos.layerOrder"),
          customizable: t("panel.modelos.customizable"),
          add: t("panel.modelos.addComponent"),
          error: t("errors.generic"),
          materialMismatch: t("panel.modelos.materialMismatch"),
          notCustomizable: t("panel.modelos.notCustomizable"),
          default: t("panel.modelos.defaultColor"),
          edit: t("common.edit"),
          delete: t("common.delete"),
          save: t("common.save"),
          cancel: t("common.cancel"),
          confirmDelete: t("panel.modelos.confirmDeleteComponent"),
          view_front: t("panel.modelos.view.front"),
          view_side: t("panel.modelos.view.side"),
          view_back: t("panel.modelos.view.back"),
          upload: t("common.upload"),
          uploading: t("common.uploading"),
          uploadSuccess: t("common.uploadSuccess"),
          retry: t("common.retry"),
          loaded: t("panel.modelos.loaded"),
          missing: t("panel.modelos.missing"),
          deleteVariant: t("panel.modelos.deleteVariant"),
          confirmDeleteVariant: t("panel.modelos.confirmDeleteVariant"),
          confirmDeleteImage: t("panel.modelos.confirmDeleteImage"),
          confirmRemoveView: t("panel.modelos.confirmRemoveView"),
        }}
      />
    </div>
  );
}
