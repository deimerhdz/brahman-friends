"use client";

import { useState } from "react";
import Link from "next/link";
import type { Locale } from "@/lib/i18n/t";

export function MobileNavPanel({
  locale,
  homeLabel,
  openLabel,
  closeLabel,
  children,
}: {
  locale: Locale;
  homeLabel: string;
  openLabel: string;
  closeLabel: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? closeLabel : openLabel}
        className="flex h-10 w-10 items-center justify-center text-on-surface"
      >
        <span className="material-symbols-outlined">
          {open ? "close" : "menu"}
        </span>
      </button>

      {open && (
        <div className="absolute left-0 top-20 flex w-full flex-col gap-4 border-b border-outline-variant bg-surface px-margin-mobile py-6 shadow-sm">
          <Link
            href={`/${locale}`}
            onClick={() => setOpen(false)}
            className="text-button font-button text-on-surface"
          >
            {homeLabel}
          </Link>
          {children}
        </div>
      )}
    </div>
  );
}
