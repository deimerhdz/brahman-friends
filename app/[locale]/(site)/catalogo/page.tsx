import type { Metadata } from "next";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { capModel } from "@/lib/db/schema";
import { capModelConNombreYPortada } from "@/lib/catalogo/consultas-traducidas";
import { getT, type Locale } from "@/lib/i18n/t";
import { TarjetaModeloCard, type TarjetaModelo } from "@/app/_components/landing/TarjetaModeloCard";

// El catálogo depende de qué modelos están publicados en este momento, igual
// que la portada (FR-014, RN1): nunca se genera estáticamente.
export const dynamic = "force-dynamic";

const SORTS = ["recientes", "alfabetico", "precio-desc"] as const;
type Sort = (typeof SORTS)[number];

function parseSort(value: string | undefined): Sort {
  return (SORTS as readonly string[]).includes(value ?? "") ? (value as Sort) : "recientes";
}

function ordenarModelos<T extends { name: string; price: string | null; publishedAt: Date | null }>(
  rows: T[],
  sort: Sort,
): T[] {
  const copia = [...rows];
  if (sort === "alfabetico") {
    copia.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sort === "precio-desc") {
    copia.sort((a, b) => {
      const precioA = a.price ? Number(a.price) : -Infinity;
      const precioB = b.price ? Number(b.price) : -Infinity;
      return precioB - precioA;
    });
  } else {
    copia.sort((a, b) => (b.publishedAt?.getTime() ?? 0) - (a.publishedAt?.getTime() ?? 0));
  }
  return copia;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = getT(locale);
  return { title: t("catalogo.title") };
}

export default async function CatalogoPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ orden?: string }>;
}) {
  const { locale } = await params;
  const { orden } = await searchParams;
  const sort = parseSort(orden);
  const t = getT(locale);

  const rows = await capModelConNombreYPortada().where(eq(capModel.status, "published"));

  const conNombre = rows.map((m) => ({
    ...m,
    name: locale === "es" ? m.nameEs : m.nameEn,
    price: m.type === "fixed_product" ? m.price : null,
  }));

  const models: TarjetaModelo[] = ordenarModelos(conNombre, sort).map((m) => ({
    id: m.id,
    name: m.name,
    frontImageUrl: m.frontImageUrl,
    type: m.type,
    price: m.price,
    href:
      m.type === "fixed_product"
        ? `/${locale}/producto/${m.id}`
        : `/${locale}/configurador/${m.id}`,
  }));

  const sortOptions: { value: Sort; label: string }[] = [
    { value: "recientes", label: t("catalogo.sortRecent") },
    { value: "alfabetico", label: t("catalogo.sortAlpha") },
    { value: "precio-desc", label: t("catalogo.sortPriceDesc") },
  ];

  return (
    <section className="w-full bg-surface py-section-gap">
      <div className="mx-auto w-full max-w-[1440px] px-margin-mobile md:px-margin-desktop">
        <div className="mb-10 flex flex-col gap-6 sm:mb-16 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="mb-4 block text-label-caps font-label-caps tracking-[0.2em] text-primary">
              {t("landing.collection.eyebrow")}
            </span>
            <h1 className="text-headline-md font-headline-md text-on-surface">
              {t("catalogo.title")}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 rounded-full border border-outline-variant/60 bg-surface-container-lowest p-1.5">
            {sortOptions.map((option) => (
              <Link
                key={option.value}
                href={
                  option.value === "recientes"
                    ? `/${locale}/catalogo`
                    : `/${locale}/catalogo?orden=${option.value}`
                }
                className={
                  sort === option.value
                    ? "rounded-full bg-on-surface px-4 py-2 text-button font-button text-on-primary"
                    : "rounded-full px-4 py-2 text-button font-button text-on-surface-variant transition-colors hover:text-on-surface"
                }
              >
                {option.label}
              </Link>
            ))}
          </div>
        </div>

        {models.length === 0 ? (
          <p className="text-body-md font-body-md text-on-surface-variant">
            {t("home.empty")}
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-gutter md:grid-cols-3">
            {models.map((model) => (
              <TarjetaModeloCard
                key={model.id}
                model={model}
                viewDetailsLabel={t("landing.collection.viewDetails")}
                customizeLabel={t("landing.collection.customize")}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
