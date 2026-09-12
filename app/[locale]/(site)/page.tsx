import { desc, eq } from "drizzle-orm";
import { capModel } from "@/lib/db/schema";
import { capModelConNombreYPortada } from "@/lib/catalogo/consultas-traducidas";
import { getT, type Locale } from "@/lib/i18n/t";
import { Hero } from "@/app/_components/landing/Hero";
import { Collection, type TarjetaModelo } from "@/app/_components/landing/Collection";
import { B2BSection } from "@/app/_components/landing/B2BSection";
import { ProcessSection } from "@/app/_components/landing/ProcessSection";
import { Footer } from "@/app/_components/landing/Footer";

// La portada depende de qué modelos están publicados en este momento
// (FR-014, RN1): nunca se genera estáticamente.
export const dynamic = "force-dynamic";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = getT(locale);

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
      <Hero t={t} />
      <Collection t={t} models={models} />
      <B2BSection t={t} />
      <ProcessSection t={t} />
      <Footer t={t} />
    </div>
  );
}
