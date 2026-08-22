"use client";

import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n/t";

export function TecnicasModelo({
  locale,
  modelId,
  techniques,
  enabledIds,
  label,
}: {
  locale: Locale;
  modelId: string;
  techniques: { id: string; nameEs: string; nameEn: string }[];
  enabledIds: string[];
  label: string;
}) {
  const router = useRouter();

  async function toggle(techniqueId: string, enable: boolean) {
    const url = `/api/panel/modelos/${modelId}/tecnicas${
      enable ? "" : `?techniqueId=${techniqueId}`
    }`;
    await fetch(url, {
      method: enable ? "POST" : "DELETE",
      headers: enable ? { "Content-Type": "application/json" } : undefined,
      body: enable ? JSON.stringify({ techniqueId }) : undefined,
    });
    router.refresh();
  }

  return (
    <div className="rounded border border-gray-200 p-4">
      <h2 className="mb-2 font-medium">{label}</h2>
      {techniques.map((tech) => (
        <label key={tech.id} className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={enabledIds.includes(tech.id)}
            onChange={(e) => toggle(tech.id, e.target.checked)}
          />
          <span>{locale === "es" ? tech.nameEs : tech.nameEn}</span>
        </label>
      ))}
    </div>
  );
}
