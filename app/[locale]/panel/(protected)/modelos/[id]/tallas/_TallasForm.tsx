"use client";

import type { FormEvent } from "react";
import { useRouter } from "next/navigation";

export function TallasForm({
  modelId,
  sizes,
  labels,
}: {
  modelId: string;
  sizes: { label: string; sortOrder: number }[];
  labels: Record<string, string>;
}) {
  const router = useRouter();

  async function add(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formEl = event.currentTarget;
    const form = new FormData(formEl);
    await fetch(`/api/panel/modelos/${modelId}/tallas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        label: form.get("label"),
        sortOrder: sizes.length,
      }),
    });
    formEl.reset();
    router.refresh();
  }

  async function remove(label: string) {
    await fetch(
      `/api/panel/modelos/${modelId}/tallas?label=${encodeURIComponent(label)}`,
      { method: "DELETE" },
    );
    router.refresh();
  }

  return (
    <div className="flex max-w-sm flex-col gap-6">
      <form onSubmit={add} className="flex gap-2">
        <input
          name="label"
          required
          placeholder={labels.placeholder}
          className="flex-1 rounded border border-outline-variant bg-surface px-3 py-2 font-body-md text-body-md text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <button
          type="submit"
          className="rounded bg-on-surface px-4 py-2 font-button text-button text-on-primary transition-colors duration-200 hover:bg-primary"
        >
          {labels.add}
        </button>
      </form>
      <ul className="divide-y divide-outline-variant/20 overflow-hidden rounded-lg border border-outline-variant/60 bg-surface-container-lowest ambient-shadow">
        {sizes.map((s) => (
          <li
            key={s.label}
            className="flex items-center justify-between px-6 py-3 font-body-md text-body-md text-on-surface"
          >
            <span>{s.label}</span>
            <button
              type="button"
              onClick={() => remove(s.label)}
              className="font-label-caps text-label-caps text-error hover:underline"
            >
              {labels.remove}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
