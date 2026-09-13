import type { T } from "@/lib/i18n/t";

export function Hero({ t, bannerUrl }: { t: T; bannerUrl?: string | null }) {
  return (
    <header className="relative flex w-full min-h-screen flex-col items-center justify-center overflow-hidden pb-16">
      <div className="mx-auto grid w-full max-w-[1440px] grid-cols-1 items-center gap-gutter px-margin-mobile md:grid-cols-12 md:px-margin-desktop">
        <div className="z-10 flex flex-col gap-8 md:col-span-5">
          <h1 className="text-display-lg-mobile font-display-lg-mobile text-on-surface md:text-display-lg md:font-display-lg">
            {t("landing.hero.title")}
          </h1>
          <p className="max-w-md text-body-lg font-body-lg text-on-surface-variant">
            {t("landing.hero.subtitle")}
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-4">
            <button
              type="button"
              className="rounded-[0.125rem] bg-on-surface px-8 py-4 text-button font-button text-on-secondary electric-hover"
            >
              {t("landing.hero.ctaPrimary")}
            </button>
            <a
              href="#collection"
              className="flex items-center gap-2 px-8 py-4 text-button font-button text-on-surface transition-colors hover:text-primary"
            >
              {t("landing.hero.ctaSecondary")}
              <span className="material-symbols-outlined text-[18px]">
                arrow_forward
              </span>
            </a>
          </div>
        </div>
        <div className="relative flex h-[50vh] items-center justify-center md:col-span-7 md:h-[70vh]">
          <div className="group relative h-full w-full">
            <div className="ambient-shadow ghost-border absolute inset-0 flex items-center justify-center overflow-hidden rounded-[0.5rem] bg-surface-container-lowest">
              <div
                role="img"
                aria-label={t("landing.hero.title")}
                className="h-full w-full bg-surface-container bg-cover bg-center"
                style={bannerUrl ? { backgroundImage: `url(${bannerUrl})` } : undefined}
              />
            </div>
            <div className="absolute bottom-8 right-8 flex items-center gap-2 rounded-[0.75rem] border border-outline-variant bg-surface/90 px-4 py-2 shadow-sm backdrop-blur-sm">
              <span className="material-symbols-outlined animate-spin-slow text-[16px] text-on-surface">
                360
              </span>
              <span className="text-label-caps font-label-caps text-on-surface">
                {t("landing.hero.dragToRotate")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
