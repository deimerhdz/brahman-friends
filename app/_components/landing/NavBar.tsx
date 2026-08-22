import Link from "next/link";
import { ControlCuenta } from "@/app/_components/ControlCuenta";
import { SelectorIdioma } from "@/app/_components/SelectorIdioma";
import { MobileNavPanel } from "@/app/_components/landing/MobileNavPanel";
import { getT, type Locale } from "@/lib/i18n/t";

export function NavBar({ locale }: { locale: Locale }) {
  const t = getT(locale);

  return (
    <nav className="fixed left-0 top-0 z-50 flex h-20 w-full items-center justify-between border-b border-outline-variant bg-surface/80 px-margin-mobile backdrop-blur-md md:px-margin-desktop">
      <Link
        href={`/${locale}`}
        className="text-headline-md font-headline-md font-bold tracking-tighter text-on-surface"
      >
        {t("common.siteName")}
      </Link>

      <div className="hidden items-center gap-6 md:flex">
        <ControlCuenta locale={locale} />
        <SelectorIdioma locale={locale} label={t("nav.languageSelector")} />
      </div>

      <MobileNavPanel
        locale={locale}
        homeLabel={t("nav.home")}
        openLabel={t("nav.openMenu")}
        closeLabel={t("nav.closeMenu")}
      >
        <ControlCuenta locale={locale} />
        <SelectorIdioma locale={locale} label={t("nav.languageSelector")} />
      </MobileNavPanel>
    </nav>
  );
}
