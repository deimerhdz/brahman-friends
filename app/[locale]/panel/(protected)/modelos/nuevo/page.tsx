import { getT, type Locale } from "@/lib/i18n/t";
import { ModeloForm } from "../_ModeloForm";
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
      <ModeloForm
        locale={locale}
        initial={{
          code: "",
          nameEs: "",
          nameEn: "",
          descriptionEs: "",
          descriptionEn: "",
        }}
        labels={{
          code: t("panel.modelos.code"),
          name: t("common.name"),
          description: t("common.description"),
          descriptionPlaceholder: t("panel.modelos.descriptionPlaceholder"),
          price: t("panel.modelos.price"),
          switchEs: t("panel.switchIdioma.es"),
          switchEn: t("panel.switchIdioma.en"),
          error: t("errors.generic"),
          save: t("common.save"),
          typeLabel: t("panel.modelos.type.label"),
          typeHint: t("panel.modelos.type.hint"),
          typeConfigurable: t("panel.modelos.type.configurable"),
          typeFixedProduct: t("panel.modelos.type.fixed_product"),
          priceRequired: t("panel.modelos.priceRequired"),
        }}
      />
    </div>
  );
}
