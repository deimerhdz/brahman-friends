import { techniqueConNombre } from "@/lib/catalogo/consultas-traducidas";
import { getT, type Locale } from "@/lib/i18n/t";
import { TecnicasForm } from "./_TecnicasForm";

export default async function TecnicasPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = getT(locale);
  const techniques = await techniqueConNombre();

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">{t("nav.techniques")}</h1>
      <TecnicasForm
        locale={locale}
        techniques={techniques}
        labels={{
          name: t("common.name"),
          switchEs: t("panel.switchIdioma.es"),
          switchEn: t("panel.switchIdioma.en"),
          add: t("common.save"),
          error: t("errors.generic"),
        }}
      />
    </div>
  );
}
