import type { T } from "@/lib/i18n/t";

export function ProcessSection({ t }: { t: T }) {
  return (
    <section className="w-full bg-surface py-section-gap">
      <div className="mx-auto w-full max-w-[1440px] px-margin-mobile md:px-margin-desktop">
        <div className="mb-24 text-center">
          <span className="mb-4 block text-label-caps font-label-caps tracking-[0.2em] text-primary">
            {t("landing.process.eyebrow")}
          </span>
          <h2 className="text-headline-md font-headline-md text-on-surface">
            {t("landing.process.title")}
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-body-lg font-body-lg text-on-surface-variant">
            {t("landing.process.description")}
          </p>
        </div>

        <div className="relative grid grid-cols-1 gap-12 md:grid-cols-3">
          <div className="absolute left-[16%] right-[16%] top-8 z-0 hidden h-[1px] bg-outline-variant md:block" />

          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-[0.75rem] border border-outline-variant bg-surface-container-lowest text-headline-md font-headline-md text-on-surface shadow-sm">
              1
            </div>
            <h3 className="mb-3 text-body-lg font-body-lg font-medium text-on-surface">
              {t("landing.process.step1Title")}
            </h3>
            <p className="text-body-md font-body-md text-on-surface-variant">
              {t("landing.process.step1Body")}
            </p>
          </div>

          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-[0.75rem] bg-primary text-headline-md font-headline-md text-on-primary shadow-sm ring-4 ring-primary-fixed">
              2
            </div>
            <h3 className="mb-3 text-body-lg font-body-lg font-medium text-on-surface">
              {t("landing.process.step2Title")}
            </h3>
            <p className="text-body-md font-body-md text-on-surface-variant">
              {t("landing.process.step2Body")}
            </p>
          </div>

          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-[0.75rem] border border-outline-variant bg-surface-container-lowest text-headline-md font-headline-md text-on-surface shadow-sm">
              3
            </div>
            <h3 className="mb-3 text-body-lg font-body-lg font-medium text-on-surface">
              {t("landing.process.step3Title")}
            </h3>
            <p className="text-body-md font-body-md text-on-surface-variant">
              {t("landing.process.step3Body")}
            </p>
          </div>
        </div>

        <div className="mt-20 flex justify-center">
          <button
            type="button"
            className="rounded-[0.125rem] border border-on-surface px-8 py-4 text-button font-button text-on-surface transition-colors hover:bg-on-surface hover:text-on-secondary"
          >
            {t("landing.process.cta")}
          </button>
        </div>
      </div>
    </section>
  );
}
