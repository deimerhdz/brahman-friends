"use client";

import { usePathname, useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n/t";
import { locales } from "@/lib/i18n/t";

const LABELS: Record<Locale, string> = { es: "ES", en: "EN" };

export function SelectorIdioma({
  locale,
  label,
}: {
  locale: Locale;
  label: string;
}) {
  const pathname = usePathname();
  const router = useRouter();

  function switchTo(next: Locale) {
    document.cookie = `locale=${next}; path=/; max-age=31536000; SameSite=Lax`;
    const rest = pathname.split("/").slice(2).join("/");
    router.push(`/${next}${rest ? `/${rest}` : ""}`);
  }

  return (
    <div role="group" aria-label={label} className="flex gap-1 text-sm">
      {locales.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => switchTo(l)}
          aria-pressed={l === locale}
          className={`rounded px-2 py-1 ${
            l === locale
              ? "bg-brand text-white"
              : "bg-transparent text-brand hover:bg-gray-100"
          }`}
        >
          {LABELS[l]}
        </button>
      ))}
    </div>
  );
}
