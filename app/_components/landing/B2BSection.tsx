import type { T } from "@/lib/i18n/t";

export function B2BSection({ t }: { t: T }) {
  return (
    <section className="w-full border-y border-outline-variant bg-surface-container-low py-section-gap">
      <div className="mx-auto grid w-full max-w-[1440px] grid-cols-1 items-center gap-16 px-margin-mobile md:grid-cols-2 md:px-margin-desktop">
        <div className="ambient-shadow ghost-border relative order-2 h-[600px] overflow-hidden bg-surface-container-lowest p-8 md:order-1">
          <div
            role="img"
            aria-label={t("landing.b2b.embroideryLabel")}
            className="absolute inset-0 bg-surface-container"
          />
          <div className="relative z-10 flex h-full w-full flex-col justify-end">
            <div className="inline-block max-w-sm border border-outline-variant bg-surface/90 p-6 backdrop-blur-md">
              <span className="mb-2 block text-label-caps font-label-caps text-on-surface">
                {t("landing.b2b.embroideryLabel")}
              </span>
              <div className="mb-4 h-[1px] w-12 bg-primary" />
              <p className="text-body-md font-body-md text-on-surface-variant">
                {t("landing.b2b.embroideryBody")}
              </p>
            </div>
          </div>
        </div>
        <div className="order-1 flex flex-col gap-8 md:order-2">
          <span className="text-label-caps font-label-caps tracking-[0.2em] text-primary">
            {t("landing.b2b.eyebrow")}
          </span>
          <h2 className="text-display-lg-mobile font-display-lg-mobile font-semibold text-on-surface md:text-headline-md md:font-headline-md">
            {t("landing.b2b.title")}
          </h2>
          <p className="text-body-lg font-body-lg text-on-surface-variant">
            {t("landing.b2b.description")}
          </p>
          <ul className="mt-4 flex flex-col gap-4">
            <li className="flex items-start gap-4">
              <span className="material-symbols-outlined mt-1 text-primary">
                check_circle
              </span>
              <div>
                <h4 className="text-body-md font-body-md font-semibold text-on-surface">
                  {t("landing.b2b.feature1Title")}
                </h4>
                <p className="mt-1 text-sm text-body-md font-body-md text-on-surface-variant">
                  {t("landing.b2b.feature1Body")}
                </p>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <span className="material-symbols-outlined mt-1 text-primary">
                check_circle
              </span>
              <div>
                <h4 className="text-body-md font-body-md font-semibold text-on-surface">
                  {t("landing.b2b.feature2Title")}
                </h4>
                <p className="mt-1 text-sm text-body-md font-body-md text-on-surface-variant">
                  {t("landing.b2b.feature2Body")}
                </p>
              </div>
            </li>
          </ul>
          <div className="mt-8">
            <button
              type="button"
              className="w-full rounded-[0.125rem] bg-on-surface px-8 py-4 text-button font-button text-on-secondary electric-hover md:w-auto"
            >
              {t("landing.b2b.cta")}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
