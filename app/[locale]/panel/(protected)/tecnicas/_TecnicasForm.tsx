"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n/t";

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

  async function add(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(false);
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/panel/tecnicas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nameEs: form.get("nameEs"),
        nameEn: form.get("nameEn"),
      }),
    });
    if (!response.ok) {
      setError(true);
      return;
    }
    event.currentTarget.reset();
    router.refresh();
  }

  return (
    <div className="flex max-w-md flex-col gap-4">
      <form onSubmit={add} className="flex flex-col gap-2">
        <input
          name="nameEs"
          required
          placeholder={labels.nameEs}
          className="rounded border border-gray-300 px-2 py-1"
        />
        <input
          name="nameEn"
          required
          placeholder={labels.nameEn}
          className="rounded border border-gray-300 px-2 py-1"
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
