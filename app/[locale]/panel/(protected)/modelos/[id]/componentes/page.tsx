import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { capModel, component, color, componentColor } from "@/lib/db/schema";
import { getT, type Locale } from "@/lib/i18n/t";
import { ComponentesManager } from "./_ComponentesManager";

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
    db.select().from(component).where(eq(component.modelId, id)),
    db.select().from(color),
    db.select().from(componentColor),
  ]);

  const enabledByComponent: Record<string, string[]> = {};
  for (const link of links) {
    (enabledByComponent[link.componentId] ??= []).push(link.colorId);
  }

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">{t("panel.modelos.components")}</h1>
      <ComponentesManager
        locale={locale}
        modelId={id}
        components={components}
        colors={colors}
        enabledByComponent={enabledByComponent}
        labels={{
          nameEs: t("panel.colores.nameEs"),
          nameEn: t("panel.colores.nameEn"),
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
