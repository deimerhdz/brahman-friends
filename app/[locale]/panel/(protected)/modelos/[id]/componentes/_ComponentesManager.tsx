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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState<ValorTraducido>({ es: "", en: "" });
  const [editMaterial, setEditMaterial] = useState("");
  const [editLayerOrder, setEditLayerOrder] = useState(0);
  const [editCustomizable, setEditCustomizable] = useState(true);
  const [saving, setSaving] = useState(false);

  async function createComponent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const formEl = event.currentTarget;
    const form = new FormData(formEl);
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
    formEl.reset();
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

  function startEdit(comp: ComponentRow) {
    setError(null);
    setEditingId(comp.id);
    setEditName({ es: comp.nameEs, en: comp.nameEn });
    setEditMaterial(comp.material);
    setEditLayerOrder(comp.layerOrder);
    setEditCustomizable(comp.customizable);
  }

  function cancelEdit() {
    setEditingId(null);
  }

  async function saveEdit(componentId: string) {
    setSaving(true);
    setError(null);
    const response = await fetch(`/api/panel/componentes/${componentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: editName,
        material: editMaterial,
        customizable: editCustomizable,
        layerOrder: editLayerOrder,
      }),
    });
    setSaving(false);
    if (!response.ok) {
      setError(labels.error);
      return;
    }
    setEditingId(null);
    router.refresh();
  }

  async function deleteComponent(componentId: string) {
    if (!window.confirm(labels.confirmDelete)) return;
    setError(null);
    const response = await fetch(`/api/panel/componentes/${componentId}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      setError(labels.error);
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <form
        onSubmit={createComponent}
        className="flex flex-wrap items-end gap-3 rounded-lg border border-outline-variant/60 bg-surface-container-lowest p-6 ambient-shadow"
      >
        <CampoTraducible
          label={labels.name}
          value={name}
          onChange={setName}
          required
          defaultLocale={locale}
          switchLabels={{ es: labels.switchEs, en: labels.switchEn }}
        />
        <label className="flex flex-col gap-1">
          <span className="font-label-caps text-label-caps text-on-surface-variant">
            {labels.material}
          </span>
          <select
            name="material"
            required
            className="rounded border border-outline-variant bg-surface px-3 py-2 font-body-md text-body-md text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            {MATERIALS.map((m) => (
              <option key={m} value={m}>
                {MATERIAL_LABELS[m as Material][locale]}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="font-label-caps text-label-caps text-on-surface-variant">
            {labels.layerOrder}
          </span>
          <input
            name="layerOrder"
            type="number"
            defaultValue={0}
            className="w-20 rounded border border-outline-variant bg-surface px-3 py-2 font-body-md text-body-md text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </label>
        <label className="flex items-center gap-2 font-body-md text-body-md text-on-surface">
          <input name="customizable" type="checkbox" defaultChecked className="accent-primary" />
          <span>{labels.customizable}</span>
        </label>
        <button
          type="submit"
          className="rounded bg-on-surface px-4 py-2 font-button text-button text-on-primary transition-colors duration-200 hover:bg-primary"
        >
          {labels.add}
        </button>
      </form>

      {error && <p className="font-body-md text-body-md text-error">{error}</p>}

      {components.map((comp) => {
        const enabled = enabledByComponent[comp.id] ?? [];
        const isEditing = editingId === comp.id;
        return (
          <div
            key={comp.id}
            className="rounded-lg border border-outline-variant/60 bg-surface-container-lowest p-6 ambient-shadow"
          >
            {isEditing ? (
              <div className="flex flex-wrap items-end gap-3">
                <CampoTraducible
                  label={labels.name}
                  value={editName}
                  onChange={setEditName}
                  required
                  defaultLocale={locale}
                  switchLabels={{ es: labels.switchEs, en: labels.switchEn }}
                />
                <label className="flex flex-col gap-1">
                  <span className="font-label-caps text-label-caps text-on-surface-variant">
                    {labels.material}
                  </span>
                  <select
                    value={editMaterial}
                    onChange={(e) => setEditMaterial(e.target.value)}
                    required
                    className="rounded border border-outline-variant bg-surface px-3 py-2 font-body-md text-body-md text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    {MATERIALS.map((m) => (
                      <option key={m} value={m}>
                        {MATERIAL_LABELS[m as Material][locale]}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col gap-1">
                  <span className="font-label-caps text-label-caps text-on-surface-variant">
                    {labels.layerOrder}
                  </span>
                  <input
                    type="number"
                    value={editLayerOrder}
                    onChange={(e) => setEditLayerOrder(Number(e.target.value))}
                    className="w-20 rounded border border-outline-variant bg-surface px-3 py-2 font-body-md text-body-md text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </label>
                <label className="flex items-center gap-2 font-body-md text-body-md text-on-surface">
                  <input
                    type="checkbox"
                    checked={editCustomizable}
                    onChange={(e) => setEditCustomizable(e.target.checked)}
                    className="accent-primary"
                  />
                  <span>{labels.customizable}</span>
                </label>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => saveEdit(comp.id)}
                  className="rounded bg-on-surface px-4 py-2 font-button text-button text-on-primary transition-colors duration-200 hover:bg-primary disabled:opacity-50"
                >
                  {labels.save}
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="rounded border border-outline-variant px-4 py-2 font-button text-button text-on-surface transition-colors duration-200 hover:border-primary hover:text-primary"
                >
                  {labels.cancel}
                </button>
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-body-md text-body-md font-semibold text-on-surface">
                  {locale === "es" ? comp.nameEs : comp.nameEn}{" "}
                  <span className="font-label-caps text-label-caps text-on-surface-variant">
                    ({MATERIAL_LABELS[comp.material as Material]?.[locale] ?? comp.material})
                  </span>
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => startEdit(comp)}
                    className="flex items-center gap-1 rounded border border-outline-variant px-3 py-1.5 font-label-caps text-label-caps text-on-surface transition-colors hover:border-primary hover:text-primary"
                  >
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                    {labels.edit}
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteComponent(comp.id)}
                    className="flex items-center gap-1 rounded border border-outline-variant px-3 py-1.5 font-label-caps text-label-caps text-error transition-colors hover:border-error"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                    {labels.delete}
                  </button>
                </div>
              </div>
            )}
            {!comp.customizable && (
              <p className="mt-1 font-body-md text-body-md text-on-surface-variant">
                {labels.notCustomizable}
              </p>
            )}
            {comp.customizable && (
              <div className="mt-3 flex flex-col gap-2">
                {colors.map((c) => {
                  const isEnabled = enabled.includes(c.id);
                  return (
                    <div key={c.id} className="flex items-center gap-3">
                      <label className="flex items-center gap-2 font-body-md text-body-md text-on-surface">
                        <input
                          type="checkbox"
                          checked={isEnabled}
                          onChange={(e) => toggleColor(comp.id, c.id, e.target.checked)}
                          className="accent-primary"
                        />
                        <span>{locale === "es" ? c.nameEs : c.nameEn}</span>
                      </label>
                      {isEnabled && (
                        <label className="flex items-center gap-1 font-label-caps text-label-caps text-on-surface-variant">
                          <input
                            type="radio"
                            name={`default-${comp.id}`}
                            checked={comp.defaultColorId === c.id}
                            onChange={() => setDefaultColor(comp.id, c.id)}
                            className="accent-primary"
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
