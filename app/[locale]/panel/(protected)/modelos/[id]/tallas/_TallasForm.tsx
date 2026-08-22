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
    const form = new FormData(event.currentTarget);
    await fetch(`/api/panel/modelos/${modelId}/tallas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        label: form.get("label"),
        sortOrder: sizes.length,
      }),
    });
    event.currentTarget.reset();
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
    <div className="flex max-w-sm flex-col gap-4">
      <form onSubmit={add} className="flex gap-2">
        <input
          name="label"
          required
          placeholder={labels.placeholder}
          className="flex-1 rounded border border-gray-300 px-2 py-1"
        />
        <button type="submit" className="rounded bg-brand px-3 py-1 text-white">
          {labels.add}
        </button>
      </form>
      <ul className="flex flex-col gap-1">
        {sizes.map((s) => (
          <li key={s.label} className="flex items-center justify-between">
            <span>{s.label}</span>
            <button
              type="button"
              onClick={() => remove(s.label)}
              className="text-sm text-red-600"
            >
              {labels.remove}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
