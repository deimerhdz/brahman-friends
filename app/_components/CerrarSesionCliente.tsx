"use client";

import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n/t";

export function CerrarSesionCliente({
  locale,
  label,
}: {
  locale: Locale;
  label: string;
}) {
  const router = useRouter();

  async function onClick() {
    await fetch("/api/cliente/logout", { method: "POST" });
    router.push(`/${locale}`);
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="text-sm text-brand hover:underline"
    >
      {label}
    </button>
  );
}
