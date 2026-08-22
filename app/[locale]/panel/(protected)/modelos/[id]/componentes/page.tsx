import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { capModel, component, componentColor } from "@/lib/db/schema";
import {
  componentConNombre,
  colorConNombre,
} from "@/lib/catalogo/consultas-traducidas";
import { getT, type Locale } from "@/lib/i18n/t";
import { ComponentesManager } from "./_ComponentesManager";
import { PanelHeader } from "../../../_PanelHeader";

export default async function ComponentesPage({
  params,
}: {
  params: Promise<{ locale: Locale; id: string }>;
}) {
  const { locale, id } = await params;
  const t = getT(locale);

  const [model] = await db.select().from(capModel).where(eq(capModel.id, id)).limit(1);
  if (!model) notFound();

  const [components, colors, links] = await Promise.all([
    componentConNombre().where(eq(component.modelId, id)),
    colorConNombre(),
    db.select().from(componentColor),
  ]);

  const enabledByComponent: Record<string, string[]> = {};
  for (const link of links) {
    (enabledByComponent[link.componentId] ??= []).push(link.colorId);
  }

  return (
    <div>
      <PanelHeader eyebrow={t("nav.models")} title={t("panel.modelos.components")} />
      <ComponentesManager
        locale={locale}
        modelId={id}
        components={components}
        colors={colors}
        enabledByComponent={enabledByComponent}
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
        }}
      />
    </div>
  );
}
