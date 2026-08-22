import { techniqueConNombre } from "@/lib/catalogo/consultas-traducidas";
import { getT, type Locale } from "@/lib/i18n/t";
import { TecnicasForm } from "./_TecnicasForm";
import { PanelHeader } from "../_PanelHeader";

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
      <PanelHeader eyebrow={t("nav.panel")} title={t("nav.techniques")} />
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
