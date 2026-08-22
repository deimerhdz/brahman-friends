"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n/t";

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
        nameEs: form.get("nameEs"),
        nameEn: form.get("nameEn"),
        descriptionEs: form.get("descriptionEs"),
        descriptionEn: form.get("descriptionEn"),
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
      <label className="flex flex-col gap-1">
        <span>{labels.nameEs}</span>
        <input name="nameEs" required className="rounded border border-gray-300 px-3 py-2" />
      </label>
      <label className="flex flex-col gap-1">
        <span>{labels.nameEn}</span>
        <input name="nameEn" required className="rounded border border-gray-300 px-3 py-2" />
      </label>
      <label className="flex flex-col gap-1">
        <span>{labels.descriptionEs}</span>
        <textarea name="descriptionEs" className="rounded border border-gray-300 px-3 py-2" />
      </label>
      <label className="flex flex-col gap-1">
        <span>{labels.descriptionEn}</span>
        <textarea name="descriptionEn" className="rounded border border-gray-300 px-3 py-2" />
      </label>
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
