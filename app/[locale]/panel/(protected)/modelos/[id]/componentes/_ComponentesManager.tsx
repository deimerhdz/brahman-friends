"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { MATERIALS, MATERIAL_LABELS, type Material } from "@/lib/catalogo/materiales";
import type { Locale } from "@/lib/i18n/t";
import {
  CampoTraducible,
  type ValorTraducido,
} from "@/app/[locale]/panel/_components/CampoTraducible";

interface ComponentRow {
  id: string;
  nameEs: string;
  nameEn: string;
  material: string;
  customizable: boolean;
  layerOrder: number;
  defaultColorId: string | null;
}

interface ColorRow {
  id: string;
  nameEs: string;
  nameEn: string;
  material: string;
  status: string;
}

export function ComponentesManager({
  locale,
  modelId,
  components,
  colors,
  enabledByComponent,
  labels,
}: {
  locale: Locale;
  modelId: string;
  components: ComponentRow[];
  colors: ColorRow[];
  enabledByComponent: Record<string, string[]>;
  labels: Record<string, string>;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState<ValorTraducido>({ es: "", en: "" });

  async function createComponent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = new FormData(event.currentTarget);
    const response = await fetch(`/api/panel/modelos/${modelId}/componentes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        material: form.get("material"),
        customizable: form.get("customizable") === "on",
        layerOrder: Number(form.get("layerOrder") ?? 0),
      }),
    });
    if (!response.ok) {
      setError(labels.error);
      return;
    }
    event.currentTarget.reset();
    setName({ es: "", en: "" });
    router.refresh();
  }

  async function toggleColor(componentId: string, colorId: string, enable: boolean) {
    setError(null);
    const url = `/api/panel/componentes/${componentId}/colores${
      enable ? "" : `?colorId=${colorId}`
    }`;
    const response = await fetch(url, {
      method: enable ? "POST" : "DELETE",
      headers: enable ? { "Content-Type": "application/json" } : undefined,
      body: enable ? JSON.stringify({ colorId }) : undefined,
    });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      setError(
        body.error === "material_no_coincide"
          ? labels.materialMismatch
          : labels.error,
      );
      return;
    }
    router.refresh();
  }

  async function setDefaultColor(componentId: string, colorId: string) {
    await fetch(`/api/panel/componentes/${componentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ defaultColorId: colorId }),
    });
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-8">
      <form onSubmit={createComponent} className="flex flex-wrap items-end gap-3 rounded border border-gray-200 p-4">
        <CampoTraducible
          label={labels.name}
          value={name}
          onChange={setName}
          required
          defaultLocale={locale}
          switchLabels={{ es: labels.switchEs, en: labels.switchEn }}
        />
        <label className="flex flex-col gap-1">
          <span>{labels.material}</span>
          <select name="material" required className="rounded border border-gray-300 px-2 py-1">
            {MATERIALS.map((m) => (
              <option key={m} value={m}>
                {MATERIAL_LABELS[m as Material][locale]}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span>{labels.layerOrder}</span>
          <input
            name="layerOrder"
            type="number"
            defaultValue={0}
            className="w-20 rounded border border-gray-300 px-2 py-1"
          />
        </label>
        <label className="flex items-center gap-2">
          <input name="customizable" type="checkbox" defaultChecked />
          <span>{labels.customizable}</span>
        </label>
        <button type="submit" className="rounded bg-brand px-3 py-2 text-sm text-white">
          {labels.add}
        </button>
      </form>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {components.map((comp) => {
        const enabled = enabledByComponent[comp.id] ?? [];
        return (
          <div key={comp.id} className="rounded border border-gray-200 p-4">
            <h2 className="font-medium">
              {locale === "es" ? comp.nameEs : comp.nameEn}{" "}
              <span className="text-sm text-gray-500">
                ({MATERIAL_LABELS[comp.material as Material]?.[locale] ?? comp.material})
              </span>
            </h2>
            {!comp.customizable && (
              <p className="text-sm text-gray-500">{labels.notCustomizable}</p>
            )}
            {comp.customizable && (
              <div className="mt-3 flex flex-col gap-2">
                {colors.map((c) => {
                  const isEnabled = enabled.includes(c.id);
                  return (
                    <div key={c.id} className="flex items-center gap-3">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isEnabled}
                          onChange={(e) => toggleColor(comp.id, c.id, e.target.checked)}
                        />
                        <span>{locale === "es" ? c.nameEs : c.nameEn}</span>
                      </label>
                      {isEnabled && (
                        <label className="flex items-center gap-1 text-sm text-gray-500">
                          <input
                            type="radio"
                            name={`default-${comp.id}`}
                            checked={comp.defaultColorId === c.id}
                            onChange={() => setDefaultColor(comp.id, c.id)}
                          />
                          {labels.default}
                        </label>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
