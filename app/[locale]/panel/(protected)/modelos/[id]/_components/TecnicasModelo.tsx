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
    <div className="rounded-lg border border-outline-variant/60 bg-surface-container-lowest p-6 ambient-shadow">
      <h2 className="mb-3 font-body-md text-body-md font-semibold text-on-surface">{label}</h2>
      <div className="flex flex-col gap-2">
        {techniques.map((tech) => (
          <label
            key={tech.id}
            className="flex items-center gap-2 font-body-md text-body-md text-on-surface"
          >
            <input
              type="checkbox"
              checked={enabledIds.includes(tech.id)}
              onChange={(e) => toggle(tech.id, e.target.checked)}
              className="accent-primary"
            />
            <span>{locale === "es" ? tech.nameEs : tech.nameEn}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
