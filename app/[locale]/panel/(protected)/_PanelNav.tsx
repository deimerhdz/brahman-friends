"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getT, type Locale } from "@/lib/i18n/t";
import { LogoutButton } from "./_LogoutButton";

export const PANEL_NAV_LINKS = (locale: Locale) => {
  const t = getT(locale);
  const base = `/${locale}/panel`;
  return [
    { href: `${base}/modelos`, label: t("nav.models"), icon: "category" },
    { href: `${base}/colores`, label: t("nav.colors"), icon: "palette" },
    { href: `${base}/tecnicas`, label: t("nav.techniques"), icon: "brush" },
    { href: `${base}/solicitudes`, label: t("nav.requests"), icon: "package_2" },
  ];
};

export function PanelNav({
  locale,
  userName,
}: {
  locale: Locale;
  userName: string;
}) {
  const t = getT(locale);
  const pathname = usePathname();
  const links = PANEL_NAV_LINKS(locale);

  return (
    <nav className="flex h-full w-64 flex-col border-r border-outline-variant bg-surface pb-8 pt-10">
      <div className="mb-10 px-6">
        <h2 className="text-label-caps font-label-caps text-on-surface">
          {t("common.siteName")}
        </h2>
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
                <span className="material-symbols-outlined text-[20px]">
                  {link.icon}
                </span>
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="flex items-center gap-3 border-t border-outline-variant px-6 pt-6">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-container text-on-surface-variant">
          <span className="material-symbols-outlined text-[20px]">person</span>
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
