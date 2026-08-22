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
