"use client";

import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n/t";

export function LogoutButton({
  locale,
  label,
}: {
  locale: Locale;
  label: string;
}) {
  const router = useRouter();

  async function onClick() {
    await fetch("/api/panel/logout", { method: "POST" });
    router.push(`/${locale}/panel/login`);
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="text-left font-label-caps text-label-caps text-on-surface-variant transition-colors hover:text-primary"
    >
      {label}
    </button>
  );
}
