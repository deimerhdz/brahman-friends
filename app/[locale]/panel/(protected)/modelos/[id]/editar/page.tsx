import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { capModel } from "@/lib/db/schema";
import { capModelConNombre } from "@/lib/catalogo/consultas-traducidas";
import { getT, type Locale } from "@/lib/i18n/t";
import { ModeloForm } from "../../_ModeloForm";
import { PanelHeader } from "../../../_PanelHeader";

export default async function EditarModeloPage({
  params,
}: {
  params: Promise<{ locale: Locale; id: string }>;
}) {
  const { locale, id } = await params;
  const t = getT(locale);

  const [existing] = await capModelConNombre().where(eq(capModel.id, id)).limit(1);
  if (!existing) notFound();

  return (
    <div>
      <PanelHeader
        eyebrow={t("nav.models")}
        title={t("panel.modelos.editTitle")}
        backHref={`/${locale}/panel/modelos/${id}`}
        backLabel={t("common.back")}
      />
      <ModeloForm
        locale={locale}
        initial={{
          id: existing.id,
          code: existing.code,
          nameEs: existing.nameEs,
          nameEn: existing.nameEn,
          descriptionEs: existing.descriptionEs,
          descriptionEn: existing.descriptionEn,
          moq: existing.moq,
        }}
        labels={{
          code: t("panel.modelos.code"),
          name: t("common.name"),
          description: t("common.description"),
          moq: t("panel.modelos.moq"),
          switchEs: t("panel.switchIdioma.es"),
          switchEn: t("panel.switchIdioma.en"),
          error: t("errors.generic"),
          save: t("common.save"),
        }}
      />
    </div>
  );
}
