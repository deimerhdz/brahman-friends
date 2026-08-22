"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { getT, type Locale } from "@/lib/i18n/t";
import { PANEL_NAV_LINKS } from "./_PanelNav";
import { LogoutButton } from "./_LogoutButton";

export function MobilePanelNav({
  locale,
  userName,
}: {
  locale: Locale;
  userName: string;
}) {
  const t = getT(locale);
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const links = PANEL_NAV_LINKS(locale);

  return (
    <div className="sticky top-0 z-40 border-b border-outline-variant bg-surface lg:hidden">
      <div className="flex items-center justify-between px-margin-mobile py-4">
        <span className="text-label-caps font-label-caps text-on-surface">
          {t("common.siteName")}
        </span>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? t("nav.closeMenu") : t("nav.openMenu")}
          className="flex h-10 w-10 items-center justify-center text-on-surface"
        >
          <span className="material-symbols-outlined">
            {open ? "close" : "menu"}
          </span>
        </button>
      </div>

      {open && (
        <div className="flex flex-col gap-1 border-t border-outline-variant bg-surface px-4 py-4">
          {links.map((link) => {
            const active =
              pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={
                  active
                    ? "flex items-center gap-3 rounded border-l-4 border-primary bg-surface-container-high px-4 py-3 font-body-md text-body-md font-bold text-primary"
                    : "flex items-center gap-3 rounded px-4 py-3 font-body-md text-body-md text-on-surface-variant hover:bg-surface-container-low"
                }
              >
                <span className="material-symbols-outlined text-[20px]">
                  {link.icon}
                </span>
                {link.label}
              </Link>
            );
          })}
          <div className="mt-2 flex items-center gap-3 border-t border-outline-variant px-4 pt-4">
            <span className="font-body-md text-body-md font-semibold text-on-surface">
              {userName}
            </span>
            <LogoutButton locale={locale} label={t("nav.logout")} />
          </div>
        </div>
      )}
    </div>
  );
}
