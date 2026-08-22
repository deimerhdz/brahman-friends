import { getT, type Locale } from "@/lib/i18n/t";
import { NuevoModeloForm } from "./_NuevoModeloForm";
import { PanelHeader } from "../../_PanelHeader";

export default async function NuevoModeloPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = getT(locale);

  return (
    <div>
      <PanelHeader eyebrow={t("nav.models")} title={t("panel.modelos.new")} />
      <NuevoModeloForm
        locale={locale}
        labels={{
          code: t("panel.modelos.code"),
          name: t("common.name"),
          description: t("common.description"),
          switchEs: t("panel.switchIdioma.es"),
          switchEn: t("panel.switchIdioma.en"),
          error: t("errors.generic"),
          save: t("common.save"),
        }}
      />
    </div>
  );
}
