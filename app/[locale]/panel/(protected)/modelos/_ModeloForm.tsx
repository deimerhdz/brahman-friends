"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n/t";
import {
  CampoTraducible,
  type ValorTraducido,
} from "@/app/[locale]/panel/_components/CampoTraducible";

export interface ModeloFormValue {
  id?: string;
  code: string;
  nameEs: string;
  nameEn: string;
  descriptionEs: string;
  descriptionEn: string;
}

export function ModeloForm({
  locale,
  initial,
  labels,
}: {
  locale: Locale;
  initial: ModeloFormValue;
  labels: Record<string, string>;
}) {
  const router = useRouter();
  const isNew = !initial.id;
  const [code, setCode] = useState(initial.code);
  const [name, setName] = useState<ValorTraducido>({
    es: initial.nameEs,
    en: initial.nameEn,
  });
  const [description, setDescription] = useState<ValorTraducido>({
    es: initial.descriptionEs,
    en: initial.descriptionEn,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(false);
    const response = await fetch(
      isNew ? "/api/panel/modelos" : `/api/panel/modelos/${initial.id}`,
      {
        method: isNew ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, name, description }),
      },
    );
    setSaving(false);
    if (!response.ok) {
      setError(true);
      return;
    }
    if (isNew) {
      const created = await response.json();
      router.push(`/${locale}/panel/modelos/${created.id}`);
    } else {
      router.push(`/${locale}/panel/modelos/${initial.id}`);
      router.refresh();
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex max-w-lg flex-col gap-4">
      <label className="flex flex-col gap-1">
        <span className="font-label-caps text-label-caps text-on-surface-variant">
          {labels.code}
        </span>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
          className="rounded border border-outline-variant bg-surface px-3 py-2 font-body-md text-body-md text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
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
      {error && <p className="font-body-md text-body-md text-error">{labels.error}</p>}
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
