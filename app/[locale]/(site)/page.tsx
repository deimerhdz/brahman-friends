import type { Metadata } from "next";
import { desc, eq } from "drizzle-orm";
import { capModel } from "@/lib/db/schema";
import { capModelConNombreYPortada } from "@/lib/catalogo/consultas-traducidas";
import { getT, type Locale } from "@/lib/i18n/t";
import { obtenerAjustesSitio } from "@/lib/ajustes/consultas";
import { Hero } from "@/app/_components/landing/Hero";
import { Collection, type TarjetaModelo } from "@/app/_components/landing/Collection";
import { B2BSection } from "@/app/_components/landing/B2BSection";
import { ProcessSection } from "@/app/_components/landing/ProcessSection";
import { Footer } from "@/app/_components/landing/Footer";

// La portada depende de qué modelos están publicados en este momento
// (FR-014, RN1): nunca se genera estáticamente.
export const dynamic = "force-dynamic";

// SEO configurable desde /panel/ajustes (010-panel-ajustes-generales, FR-009
// a FR-011): si el título/descripción no están configurados, se usa el
// nombre del sitio y el subtítulo del hero como valor por defecto razonable
// (research.md #9), para que la página nunca quede sin título ni descripción.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = getT(locale);
  const ajustes = await obtenerAjustesSitio();
  const siteName = locale === "es" ? ajustes.siteNameEs : ajustes.siteNameEn;
  const seoTitle = (locale === "es" ? ajustes.seoTitleEs : ajustes.seoTitleEn) || siteName;
  const seoDescription =
    (locale === "es" ? ajustes.seoDescriptionEs : ajustes.seoDescriptionEn) ||
    t("landing.hero.subtitle");

  return {
    title: seoTitle,
    description: seoDescription,
    openGraph: {
      title: seoTitle,
      description: seoDescription,
      images: ajustes.seoImageUrl ? [ajustes.seoImageUrl] : undefined,
    },
  };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = getT(locale);
  const ajustes = await obtenerAjustesSitio();
  const siteName = locale === "es" ? ajustes.siteNameEs : ajustes.siteNameEn;

  const rows = await capModelConNombreYPortada()
    .where(eq(capModel.status, "published"))
    .orderBy(desc(capModel.publishedAt));

  const models: TarjetaModelo[] = rows.map((m) => ({
    id: m.id,
    name: locale === "es" ? m.nameEs : m.nameEn,
    description: locale === "es" ? m.descriptionEs : m.descriptionEn,
    frontImageUrl: m.frontImageUrl,
    type: m.type,
    price: m.type === "fixed_product" ? m.price : null,
    href:
      m.type === "fixed_product"
        ? `/${locale}/producto/${m.id}`
        : `/${locale}/configurador/${m.id}`,
  }));

  return (
    <div className="bg-surface text-on-surface">
      <Hero t={t} bannerUrl={ajustes.bannerUrl} />
      <Collection t={t} models={models} />
      <B2BSection t={t} />
      <ProcessSection t={t} />
      <Footer t={t} siteName={siteName} socialLinks={ajustes.socialLinks} />
    </div>
  );
}
