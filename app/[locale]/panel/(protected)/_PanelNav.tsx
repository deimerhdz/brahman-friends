"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getT, type Locale } from "@/lib/i18n/t";
import { LogoutButton } from "./_LogoutButton";
import { FaBoxOpen, FaGear, FaPaintbrush, FaShapes, FaUser } from "react-icons/fa6";

export const PANEL_NAV_LINKS = (locale: Locale) => {
  const t = getT(locale);
  const base = `/${locale}/panel`;
  return [
    { href: `${base}/modelos`, label: t("nav.models"), icon: FaShapes },
    { href: `${base}/tecnicas`, label: t("nav.techniques"), icon: FaPaintbrush },
    { href: `${base}/solicitudes`, label: t("nav.requests"), icon: FaBoxOpen },
    { href: `${base}/ajustes`, label: t("nav.settings"), icon: FaGear },
  ];
};

export function PanelNav({
  locale,
  userName,
  siteName,
  logoUrl,
}: {
  locale: Locale;
  userName: string;
  siteName: string;
  logoUrl?: string | null;
}) {
  const t = getT(locale);
  const pathname = usePathname();
  const links = PANEL_NAV_LINKS(locale);

  return (
    <nav className="flex h-full w-64 flex-col border-r border-outline-variant bg-surface pb-8 pt-10">
      <div className="mb-10 px-6">
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoUrl} alt={siteName} className="h-8 w-auto object-contain" />
        ) : (
          <h2 className="text-label-caps font-label-caps text-on-surface">
            {siteName}
          </h2>
        )}
      </div>
      <ul className="flex flex-1 flex-col gap-1 px-4">
        {links.map((link) => {
          const active =
            pathname === link.href || pathname.startsWith(`${link.href}/`);
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                className={
                  active
                    ? "flex items-center gap-3 rounded border-l-4 border-primary bg-surface-container-high px-4 py-3 font-body-md text-body-md font-bold text-primary"
                    : "flex items-center gap-3 rounded px-4 py-3 font-body-md text-body-md text-on-surface-variant transition-colors hover:bg-surface-container-low"
                }
              >
                <link.icon className="shrink-0 text-[20px]" aria-hidden="true" />
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="flex items-center gap-3 border-t border-outline-variant px-6 pt-6">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-container text-on-surface-variant">
          <FaUser className="text-[20px] shrink-0" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-body-md text-body-md font-semibold text-on-surface">
            {userName}
          </p>
          <LogoutButton locale={locale} label={t("nav.logout")} />
        </div>
      </div>
    </nav>
  );
}
