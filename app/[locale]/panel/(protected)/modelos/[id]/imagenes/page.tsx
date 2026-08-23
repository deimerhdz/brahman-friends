import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import {
  capModel,
  modelView,
  component,
  componentColor,
  componentImage,
} from "@/lib/db/schema";
import {
  componentConNombre,
  colorConNombre,
} from "@/lib/catalogo/consultas-traducidas";
import { getT, type Locale } from "@/lib/i18n/t";
import { SubidaManual } from "./_SubidaManual";
import { PanelHeader } from "../../../_PanelHeader";

export default async function ImagenesPage({
  params,
}: {
  params: Promise<{ locale: Locale; id: string }>;
}) {
  const { locale, id } = await params;
  const t = getT(locale);

  const [model] = await db.select().from(capModel).where(eq(capModel.id, id)).limit(1);
  if (!model) notFound();

  const [views, components, links, colors, images] = await Promise.all([
    db.select().from(modelView).where(eq(modelView.modelId, id)),
    componentConNombre().where(eq(component.modelId, id)),
    db.select().from(componentColor),
    colorConNombre(),
    db.select().from(componentImage).where(eq(componentImage.modelId, id)),
  ]);

  const colorsById = new Map(colors.map((c) => [c.id, c]));
  const componentes = components
    .filter((c) => c.customizable)
    .map((c) => ({
      id: c.id,
      nameEs: c.nameEs,
      colores: links
        .filter((l) => l.componentId === c.id)
        .map((l) => colorsById.get(l.colorId))
        .filter((c): c is NonNullable<typeof c> => !!c)
        .map((c) => ({ id: c.id, nameEs: c.nameEs })),
    }));

  return (
    <div>
      <PanelHeader
        eyebrow={t("nav.models")}
        title={t("panel.modelos.images")}
        backHref={`/${locale}/panel/modelos/${id}`}
        backLabel={t("common.back")}
      />
      <SubidaManual
        modelId={id}
        activeViews={views.map((v) => v.view)}
        componentes={componentes}
        cargadas={images.map((i) => ({
          componentId: i.componentId,
          colorId: i.colorId,
          view: i.view,
        }))}
        labels={{
          title: t("panel.modelos.manualUpload"),
          component: t("panel.modelos.components"),
          selectComponent: t("panel.modelos.selectComponent"),
          color: t("nav.colors"),
          selectColor: t("panel.modelos.selectColor"),
          view: t("panel.modelos.viewColumn"),
          selectView: t("panel.modelos.selectView"),
          view_front: t("panel.modelos.view.front"),
          view_side: t("panel.modelos.view.side"),
          view_back: t("panel.modelos.view.back"),
          upload: t("common.upload"),
          uploading: t("common.uploading"),
          success: t("common.uploadSuccess"),
          retry: t("common.retry"),
          error: t("errors.generic"),
          dimensionMismatch: t("panel.modelos.dimensionMismatch"),
          matrixTitle: t("panel.modelos.matrixTitle"),
          status: t("panel.modelos.status.label"),
          loaded: t("panel.modelos.loaded"),
          missing: t("panel.modelos.missing"),
          allLoaded: t("panel.modelos.allLoaded"),
        }}
      />
    </div>
  );
}
