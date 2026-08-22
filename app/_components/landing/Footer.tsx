import type { T } from "@/lib/i18n/t";

export function Footer({ t }: { t: T }) {
  const footerLinks = [
    t("landing.footer.support"),
    t("landing.footer.trackOrder"),
    t("landing.footer.b2bBulk"),
    t("landing.footer.sustainability"),
    t("landing.footer.terms"),
  ];

  return (
    <footer className="flex w-full flex-col items-center justify-between gap-8 border-t border-outline-variant bg-surface-container-lowest px-margin-mobile py-16 md:flex-row md:px-margin-desktop">
      <div className="text-headline-md font-headline-md text-on-surface">
        {t("common.siteName")}
      </div>
      <div className="flex flex-wrap justify-center gap-6 text-label-caps font-label-caps">
        {footerLinks.map((label) => (
          <span
            key={label}
            className="text-on-secondary-container underline opacity-80"
          >
            {label}
          </span>
        ))}
      </div>
      <div className="text-center text-label-caps font-label-caps text-xs text-on-surface md:text-right">
        {t("landing.footer.copyright", {
          year: new Date().getFullYear(),
          siteName: t("common.siteName"),
          tagline: t("landing.footer.tagline"),
        })}
      </div>
    </footer>
  );
}
