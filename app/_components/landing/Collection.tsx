import type { T, Locale } from "@/lib/i18n/t";
import { TarjetaModeloCard, type TarjetaModelo } from "@/app/_components/landing/TarjetaModeloCard";

export type { TarjetaModelo };

export function Collection({
  t,
  locale,
  models,
}: {
  t: T;
  locale: Locale;
  models: TarjetaModelo[];
}) {
  return (
    <section id="collection" className="w-full bg-surface py-section-gap">
      <div className="mx-auto w-full max-w-[1440px] px-margin-mobile md:px-margin-desktop">
        <div className="mb-16 flex items-end justify-between">
          <div>
            <span className="mb-4 block text-label-caps font-label-caps tracking-[0.2em] text-primary">
              {t("landing.collection.eyebrow")}
            </span>
            <h2 className="text-headline-md font-headline-md text-on-surface">
              {t("landing.collection.title")}
            </h2>
          </div>
          <a
            href={`/${locale}/catalogo`}
            className="hidden items-center gap-2 border-b border-on-surface pb-1 text-button font-button text-on-surface transition-colors hover:border-primary hover:text-primary md:inline-flex"
          >
            {t("landing.collection.exploreAll")}
          </a>
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
