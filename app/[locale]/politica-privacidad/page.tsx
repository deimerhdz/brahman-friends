import { getT, type Locale } from "@/lib/i18n/t";

// Qué datos se piden, para qué se usan, cuánto se conservan y cómo pedir la
// anonimización (FR-066, FR-067, RN22, RN23).
export default async function PoliticaPrivacidadPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = getT(locale);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 text-sm leading-relaxed">
      <h1 className="mb-4 text-xl font-semibold">{t("privacidad.title")}</h1>
      <p className="mb-4">{t("privacidad.intro")}</p>

      <h2 className="mb-2 mt-6 font-medium">{t("privacidad.whatTitle")}</h2>
      <p className="mb-4">{t("privacidad.whatBody")}</p>

      <h2 className="mb-2 mt-6 font-medium">{t("privacidad.whyTitle")}</h2>
      <p className="mb-4">{t("privacidad.whyBody")}</p>

      <h2 className="mb-2 mt-6 font-medium">{t("privacidad.retentionTitle")}</h2>
      <p className="mb-4">{t("privacidad.retentionBody")}</p>

      <h2 className="mb-2 mt-6 font-medium">{t("privacidad.anonymizationTitle")}</h2>
      <p className="mb-4">{t("privacidad.anonymizationBody")}</p>
    </div>
  );
}
