import type { T } from "@/lib/i18n/t";
import { SOCIAL_PLATFORM_ICONS, type SocialPlatform } from "@/lib/ajustes/iconos-redes";

export function Footer({
  t,
  siteName,
  socialLinks = [],
}: {
  t: T;
  siteName: string;
  socialLinks?: { id: string; platform: SocialPlatform; url: string }[];
}) {
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
        {siteName}
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
      {socialLinks.length > 0 && (
        <div className="flex items-center gap-4">
          {socialLinks.map((link) => {
            const Icon = SOCIAL_PLATFORM_ICONS[link.platform];
            return (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-on-surface-variant transition-colors hover:text-primary"
              >
                <Icon className="h-5 w-5" />
              </a>
            );
          })}
        </div>
      )}
      <div className="text-center text-label-caps font-label-caps text-xs text-on-surface md:text-right">
        {t("landing.footer.copyright", {
          year: new Date().getFullYear(),
          siteName,
          tagline: t("landing.footer.tagline"),
        })}
      </div>
    </footer>
  );
}
