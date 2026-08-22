"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n/t";
import {
  CampoTraducible,
  type ValorTraducido,
} from "@/app/[locale]/panel/_components/CampoTraducible";

export function TecnicasForm({
  locale,
  techniques,
  labels,
}: {
  locale: Locale;
  techniques: { id: string; nameEs: string; nameEn: string }[];
  labels: Record<string, string>;
}) {
  const router = useRouter();
  const [error, setError] = useState(false);
  const [name, setName] = useState<ValorTraducido>({ es: "", en: "" });

  async function add(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(false);
    const response = await fetch("/api/panel/tecnicas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (!response.ok) {
      setError(true);
      return;
    }
    setName({ es: "", en: "" });
    router.refresh();
  }

  return (
    <div className="flex max-w-md flex-col gap-6">
      <form
        onSubmit={add}
        className="flex flex-col gap-3 rounded-lg border border-outline-variant/60 bg-surface-container-lowest p-6 ambient-shadow"
      >
        <CampoTraducible
          label={labels.name}
          value={name}
          onChange={setName}
          required
          defaultLocale={locale}
          switchLabels={{ es: labels.switchEs, en: labels.switchEn }}
        />
        <button
          type="submit"
          className="w-fit rounded bg-on-surface px-6 py-2 font-button text-button text-on-primary transition-colors duration-200 hover:bg-primary"
        >
          {labels.add}
        </button>
        {error && <p className="font-body-md text-body-md text-error">{labels.error}</p>}
      </form>
      <ul className="divide-y divide-outline-variant/20 overflow-hidden rounded-lg border border-outline-variant/60 bg-surface-container-lowest ambient-shadow">
        {techniques.map((tech) => (
          <li
            key={tech.id}
            className="px-6 py-3 font-body-md text-body-md text-on-surface"
          >
            {locale === "es" ? tech.nameEs : tech.nameEn}
          </li>
        ))}
      </ul>
    </div>
  );
}
