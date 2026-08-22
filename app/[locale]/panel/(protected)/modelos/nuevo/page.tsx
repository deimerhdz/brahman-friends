import { getT, type Locale } from "@/lib/i18n/t";
import { NuevoModeloForm } from "./_NuevoModeloForm";

export default async function NuevoModeloPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = getT(locale);

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">{t("panel.modelos.new")}</h1>
      <NuevoModeloForm
        locale={locale}
        labels={{
          code: t("panel.modelos.code"),
          nameEs: t("panel.colores.nameEs"),
          nameEn: t("panel.colores.nameEn"),
          descriptionEs: t("panel.modelos.descriptionEs"),
          descriptionEn: t("panel.modelos.descriptionEn"),
          error: t("errors.generic"),
          save: t("common.save"),
        }}
      />
    </div>
  );
}
