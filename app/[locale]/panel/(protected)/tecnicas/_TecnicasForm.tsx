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
    <div className="flex max-w-md flex-col gap-4">
      <form onSubmit={add} className="flex flex-col gap-2">
        <CampoTraducible
          label={labels.name}
          value={name}
          onChange={setName}
          required
          defaultLocale={locale}
          switchLabels={{ es: labels.switchEs, en: labels.switchEn }}
        />
        <button type="submit" className="w-fit rounded bg-brand px-3 py-1 text-white">
          {labels.add}
        </button>
        {error && <p className="text-sm text-red-600">{labels.error}</p>}
      </form>
      <ul className="divide-y divide-gray-200">
        {techniques.map((tech) => (
          <li key={tech.id} className="py-2">
            {locale === "es" ? tech.nameEs : tech.nameEn}
          </li>
        ))}
      </ul>
    </div>
  );
}
