"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n/t";
import { CampoTraducible } from "@/app/[locale]/panel/_components/CampoTraducible";

export interface ColorFormValue {
  id?: string;
  nameEs: string;
  nameEn: string;
}

export function ColorForm({
  locale,
  modelId,
  initial,
  labels,
}: {
  locale: Locale;
  modelId: string;
  initial: ColorFormValue;
  labels: Record<string, string>;
}) {
  const router = useRouter();
  const [value, setValue] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    const isNew = !value.id;
    const { nameEs, nameEn } = value;
    const response = await fetch(
      isNew
        ? `/api/panel/modelos/${modelId}/colores`
        : `/api/panel/colores/${value.id}`,
      {
        method: isNew ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: { es: nameEs, en: nameEn } }),
      },
    );
    setSaving(false);
    if (!response.ok) {
      setError(labels.saveError);
      return;
    }
    router.push(`/${locale}/panel/modelos/${modelId}/colores`);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="flex max-w-lg flex-col gap-4">
      <CampoTraducible
        label={labels.name}
        value={{ es: value.nameEs, en: value.nameEn }}
        onChange={(v) => setValue((prev) => ({ ...prev, nameEs: v.es, nameEn: v.en }))}
        required
        defaultLocale={locale}
        switchLabels={{ es: labels.switchEs, en: labels.switchEn }}
      />

      {error && <p className="font-body-md text-body-md text-error">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="w-fit rounded bg-on-surface px-6 py-2 font-button text-button text-on-primary transition-colors duration-200 hover:bg-primary disabled:opacity-50"
      >
        {labels.save}
      </button>
    </form>
  );
}
