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
import { CargaMasiva } from "./_CargaMasiva";
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
      <CargaMasiva
        modelId={id}
        activeViews={views.map((v) => v.view)}
        componentes={componentes}
        cargadas={images.map((i) => ({
          componentId: i.componentId,
          colorId: i.colorId,
          view: i.view,
        }))}
        expected={
          model.imageWidth && model.imageHeight
            ? { width: model.imageWidth, height: model.imageHeight }
            : null
        }
        labels={{
          dropHere: t("panel.modelos.dropHere"),
          reading: t("panel.modelos.reading"),
          matchedCount: t("panel.modelos.matchedCount"),
          dimensionMismatch: t("panel.modelos.dimensionMismatchBatch"),
          unmatched: t("panel.modelos.unmatched"),
          upload: t("panel.modelos.uploadBatch"),
          uploading: t("common.loading"),
          done: t("panel.modelos.uploadDone"),
          matrixTitle: t("panel.modelos.matrixTitle"),
          component: t("panel.modelos.components"),
          color: t("nav.colors"),
          view: t("panel.modelos.viewColumn"),
          status: t("panel.modelos.status.label"),
          loaded: t("panel.modelos.loaded"),
          pending: t("panel.modelos.pending"),
          missing: t("panel.modelos.missing"),
          allLoaded: t("panel.modelos.allLoaded"),
        }}
      />
    </div>
  );
}
