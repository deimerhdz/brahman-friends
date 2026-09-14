"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n/t";
import {
  CampoTraducible,
  type ValorTraducido,
} from "@/app/[locale]/panel/_components/CampoTraducible";

type RenderStyle = "flat" | "embroidery";

export function TecnicasForm({
  locale,
  techniques,
  labels,
}: {
  locale: Locale;
  techniques: { id: string; nameEs: string; nameEn: string; renderStyle: RenderStyle }[];
  labels: Record<string, string>;
}) {
  const router = useRouter();
  const [error, setError] = useState(false);
  const [name, setName] = useState<ValorTraducido>({ es: "", en: "" });
  const [renderStyle, setRenderStyle] = useState<RenderStyle>("flat");
  const [savingId, setSavingId] = useState<string | null>(null);

  async function add(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(false);
    const response = await fetch("/api/panel/tecnicas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, renderStyle }),
    });
    if (!response.ok) {
      setError(true);
      return;
    }
    setName({ es: "", en: "" });
    setRenderStyle("flat");
    router.refresh();
  }

  async function updateRenderStyle(id: string, value: RenderStyle) {
    setError(false);
    setSavingId(id);
    const response = await fetch(`/api/panel/tecnicas/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ renderStyle: value }),
    });
    setSavingId(null);
    if (!response.ok) {
      setError(true);
      return;
    }
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
        <div className="flex flex-col gap-1">
          <label htmlFor="tecnica-render-style" className="font-body-md text-body-md text-on-surface">
            {labels.renderStyle}
          </label>
          <select
            id="tecnica-render-style"
            value={renderStyle}
            onChange={(e) => setRenderStyle(e.target.value as RenderStyle)}
            className="w-fit rounded border border-outline-variant bg-surface-container-lowest px-3 py-1.5 font-body-md text-body-md text-on-surface"
          >
            <option value="flat">{labels.flat}</option>
            <option value="embroidery">{labels.embroidery}</option>
          </select>
          <p className="font-body-md text-[11px] text-on-surface-variant">
            {labels.renderStyleHint}
          </p>
        </div>
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
            className="flex items-center justify-between gap-3 px-6 py-3 font-body-md text-body-md text-on-surface"
          >
            <span>{locale === "es" ? tech.nameEs : tech.nameEn}</span>
            <select
              value={tech.renderStyle}
              disabled={savingId === tech.id}
              onChange={(e) => updateRenderStyle(tech.id, e.target.value as RenderStyle)}
              className="rounded border border-outline-variant bg-surface-container-lowest px-2 py-1 font-body-md text-[13px] text-on-surface disabled:opacity-50"
            >
              <option value="flat">{labels.flat}</option>
              <option value="embroidery">{labels.embroidery}</option>
            </select>
          </li>
        ))}
      </ul>
    </div>
  );
}
