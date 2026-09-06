import { eq, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import { capModel, color } from "@/lib/db/schema";
import { db } from "@/lib/db";
import { colorConNombre } from "@/lib/catalogo/consultas-traducidas";
import { getT, type Locale } from "@/lib/i18n/t";
import { ColorForm, type ColorFormValue } from "./_ColorForm";
import { PanelHeader } from "../../../../_PanelHeader";

export default async function ColorFormPage({
  params,
}: {
  params: Promise<{ locale: Locale; id: string; colorId: string }>;
}) {
  const { locale, id: modelId, colorId } = await params;
  const t = getT(locale);

  const [model] = await db
    .select()
    .from(capModel)
    .where(eq(capModel.id, modelId))
    .limit(1);
  if (!model) notFound();

  let initial: ColorFormValue = {
    nameEs: "",
    nameEn: "",
  };

  if (colorId !== "nuevo") {
    const [existing] = await colorConNombre()
      .where(and(eq(color.id, colorId), eq(color.modelId, modelId)))
      .limit(1);
    if (!existing) notFound();
    initial = existing;
  }

  return (
    <div>
      <PanelHeader
        eyebrow={t("panel.modelos.colors")}
        title={colorId === "nuevo" ? t("panel.colores.new") : t("panel.colores.editTitle")}
        backHref={`/${locale}/panel/modelos/${modelId}/colores`}
        backLabel={t("common.back")}
      />
      <ColorForm
        locale={locale}
        modelId={modelId}
        initial={initial}
        labels={{
          name: t("common.name"),
          switchEs: t("panel.switchIdioma.es"),
          switchEn: t("panel.switchIdioma.en"),
          saveError: t("errors.generic"),
          save: t("common.save"),
        }}
      />
    </div>
  );
}
