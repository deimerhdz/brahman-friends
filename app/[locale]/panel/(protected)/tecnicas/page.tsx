import { db } from "@/lib/db";
import { technique } from "@/lib/db/schema";
import { getT, type Locale } from "@/lib/i18n/t";
import { TecnicasForm } from "./_TecnicasForm";

export default async function TecnicasPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = getT(locale);
  const techniques = await db.select().from(technique);

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">{t("nav.techniques")}</h1>
      <TecnicasForm
        locale={locale}
        techniques={techniques}
        labels={{
          nameEs: t("panel.colores.nameEs"),
          nameEn: t("panel.colores.nameEn"),
          add: t("common.save"),
          error: t("errors.generic"),
        }}
      />
    </div>
  );
}
