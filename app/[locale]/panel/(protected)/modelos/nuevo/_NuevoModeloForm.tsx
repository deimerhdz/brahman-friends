"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n/t";
import {
  CampoTraducible,
  type ValorTraducido,
} from "@/app/[locale]/panel/_components/CampoTraducible";

export function NuevoModeloForm({
  locale,
  labels,
}: {
  locale: Locale;
  labels: Record<string, string>;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);
  const [name, setName] = useState<ValorTraducido>({ es: "", en: "" });
  const [description, setDescription] = useState<ValorTraducido>({
    es: "",
    en: "",
  });

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(false);
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/panel/modelos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: form.get("code"),
        name,
        description,
      }),
    });
    setSaving(false);
    if (!response.ok) {
      setError(true);
      return;
    }
    const created = await response.json();
    router.push(`/${locale}/panel/modelos/${created.id}`);
  }

  return (
    <form onSubmit={onSubmit} className="flex max-w-lg flex-col gap-4">
      <label className="flex flex-col gap-1">
        <span>{labels.code}</span>
        <input name="code" required className="rounded border border-gray-300 px-3 py-2" />
      </label>
      <CampoTraducible
        label={labels.name}
        value={name}
        onChange={setName}
        required
        defaultLocale={locale}
        switchLabels={{ es: labels.switchEs, en: labels.switchEn }}
      />
      <CampoTraducible
        label={labels.description}
        value={description}
        onChange={setDescription}
        multiline
        defaultLocale={locale}
        switchLabels={{ es: labels.switchEs, en: labels.switchEn }}
      />
      {error && <p className="text-sm text-red-600">{labels.error}</p>}
      <button
        type="submit"
        disabled={saving}
        className="rounded bg-brand px-4 py-2 text-white disabled:opacity-50"
      >
        {labels.save}
      </button>
    </form>
  );
}
