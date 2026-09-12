"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  MATERIALS,
  MATERIAL_LABELS,
  type Material,
} from "@/lib/catalogo/materiales";
import type { Locale } from "@/lib/i18n/t";
import {
  CampoTraducible,
  type ValorTraducido,
} from "@/app/[locale]/panel/_components/CampoTraducible";
import { ParteColorVariante } from "./ParteColorVariante";

type View = "front" | "side" | "back";

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
}

interface Cargada {
  componentId: string;
  colorId: string;
  view: View;
  imageUrl: string;
}

/**
 * Paso 2 del wizard: colores y variantes. Fusiona lo que antes eran las
 * páginas separadas "Colores" y "Componentes": cada tarjeta es un color del
 * modelo (variante), y dentro de cada una se listan los componentes
 * personalizables con sus imágenes por vista. La gestión de partes
 * (crear/editar/eliminar componentes) queda en una sección plegable al
 * final, ya que el mockup no la contempla pero sigue siendo necesaria.
 */
export function PasoColores({
  locale,
  modelId,
  colors,
  defaultColorId,
  components,
  activeViews,
  enabledByComponent,
  cargadas,
  labels,
}: {
  locale: Locale;
  modelId: string;
  colors: ColorRow[];
  defaultColorId: string | null;
  components: ComponentRow[];
  activeViews: View[];
  enabledByComponent: Record<string, { colorId: string; views: View[] }[]>;
  cargadas: Cargada[];
  labels: Record<string, string>;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [newColorName, setNewColorName] = useState<ValorTraducido>({
    es: "",
    en: "",
  });
  const [savingColor, setSavingColor] = useState(false);

  const imagesByComponentColor = useMemo(() => {
    const map = new Map<string, Partial<Record<View, string>>>();
    for (const c of cargadas) {
      const key = `${c.componentId}:${c.colorId}`;
      const entry = map.get(key) ?? {};
      entry[c.view] = c.imageUrl;
      map.set(key, entry);
    }
    return map;
  }, [cargadas]);

  const customizableComponents = components.filter((c) => c.customizable);

  async function setDefaultVariant(colorId: string) {
    setError(null);
    const response = await fetch(`/api/panel/modelos/${modelId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ defaultColorId: colorId }),
    });
    if (!response.ok) {
      setError(labels.error);
      return;
    }
    router.refresh();
  }

  async function setComponentDefaultColor(componentId: string, colorId: string) {
    await fetch(`/api/panel/componentes/${componentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ defaultColorId: colorId }),
    });
    router.refresh();
  }

  async function createColor(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingColor(true);
    setError(null);
    const response = await fetch(`/api/panel/modelos/${modelId}/colores`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newColorName }),
    });
    setSavingColor(false);
    if (!response.ok) {
      setError(labels.error);
      return;
    }
    setNewColorName({ es: "", en: "" });
    router.refresh();
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-headline-md text-[13px] font-bold uppercase tracking-wider text-on-surface">
            {labels.step2}
          </h2>
          <p className="mt-0.5 font-body-md text-[11px] text-on-surface-variant">
            {labels.step2Hint}
          </p>
        </div>
        <span className="material-symbols-outlined text-lg text-on-surface-variant">
          palette
        </span>
      </div>

      <div className="flex items-start gap-2.5 rounded-xl border border-[#F5E39A] bg-[#FFF8E1] p-3">
        <span className="material-symbols-outlined mt-0.5 shrink-0 text-base text-[#8D6E00]">
          star
        </span>
        <div className="text-xs leading-relaxed text-on-surface">
          <p className="flex items-center gap-1 font-bold text-[#8D6E00]">
            {labels.defaultVariant}
          </p>
          <p className="mt-0.5 text-[11px] text-on-surface-variant">
            {labels.defaultVariantHint}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <span className="font-body-md text-body-md font-semibold text-on-surface">
          {labels.configuredColors} ({colors.length})
        </span>

        {colors.map((c) => {
          const name = locale === "es" ? c.nameEs : c.nameEn;
          const isDefault = defaultColorId === c.id;
          return (
            <div
              key={c.id}
              className={
                isDefault
                  ? "space-y-3 rounded-xl border-2 border-on-surface bg-surface-container-lowest p-3.5 ambient-shadow"
                  : "space-y-3 rounded-xl border border-outline-variant/60 bg-surface-container-lowest p-3.5 transition-colors hover:border-outline-variant"
              }
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="defaultVariantRadio"
                    checked={isDefault}
                    onChange={() => setDefaultVariant(c.id)}
                    className="h-4 w-4 accent-primary"
                  />
                  <label className="font-body-md text-body-md font-bold text-on-surface">
                    {name}
                  </label>
                </div>
                {isDefault && (
                  <span className="flex items-center gap-0.5 rounded-full border border-[#F5E39A] bg-[#FFF8E1] px-2 py-0.5 text-[10px] font-bold text-[#8D6E00]">
                    <span className="material-symbols-outlined text-[11px]">
                      grade
                    </span>
                    {labels.markDefault}
                  </span>
                )}
              </div>

              {customizableComponents.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pl-6">
                  <span className="font-label-caps text-[10px] uppercase text-on-surface-variant">
                    {labels.parts}:
                  </span>
                  {customizableComponents.map((comp) => {
                    const thumb = imagesByComponentColor.get(
                      `${comp.id}:${c.id}`,
                    )?.front;
                    const compName = locale === "es" ? comp.nameEs : comp.nameEn;
                    return (
                      <span
                        key={comp.id}
                        className="flex items-center gap-1 rounded-full border border-outline-variant/60 bg-surface py-0.5 pl-0.5 pr-2"
                        title={compName}
                      >
                        {thumb ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={thumb}
                            alt=""
                            className="h-4 w-4 rounded-full border border-outline-variant/60 object-cover"
                          />
                        ) : (
                          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-surface-container-high text-[8px] font-bold text-on-surface-variant">
                            {compName.charAt(0).toUpperCase()}
                          </span>
                        )}
                        <span className="text-[10px] font-medium text-on-surface-variant">
                          {compName}
                        </span>
                      </span>
                    );
                  })}
                </div>
              )}

              <div className="space-y-2 pl-6">
                {customizableComponents.map((comp) => {
                  const enabled = enabledByComponent[comp.id] ?? [];
                  const requiredViews =
                    enabled.find((e) => e.colorId === c.id)?.views ?? [];
                  return (
                    <ParteColorVariante
                      key={comp.id}
                      modelId={modelId}
                      componentId={comp.id}
                      componentName={locale === "es" ? comp.nameEs : comp.nameEn}
                      color={{ id: c.id, nameEs: name }}
                      activeViews={activeViews}
                      requiredViews={requiredViews}
                      images={imagesByComponentColor.get(`${comp.id}:${c.id}`) ?? {}}
                      isDefault={comp.defaultColorId === c.id}
                      onSetDefault={() => setComponentDefaultColor(comp.id, c.id)}
                      labels={labels}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}

        <form
          onSubmit={createColor}
          className="flex flex-wrap items-end gap-3 rounded-xl border border-dashed border-outline-variant bg-surface-container-low p-3.5"
        >
          <div className="flex-1">
            <CampoTraducible
              label={labels.addColor}
              value={newColorName}
              onChange={setNewColorName}
              required
              defaultLocale={locale}
              switchLabels={{ es: labels.switchEs, en: labels.switchEn }}
            />
          </div>
          <button
            type="submit"
            disabled={savingColor}
            className="flex items-center gap-1 rounded bg-on-surface px-4 py-2 font-button text-button text-on-primary transition-colors duration-200 hover:bg-primary disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            {labels.addColor}
          </button>
        </form>
      </div>

      {error && <p className="font-body-md text-body-md text-error">{error}</p>}

      <GestionPartes
        locale={locale}
        modelId={modelId}
        components={components}
        labels={labels}
      />
    </div>
  );
}

function GestionPartes({
  locale,
  modelId,
  components,
  labels,
}: {
  locale: Locale;
  modelId: string;
  components: ComponentRow[];
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

  function startEdit(comp: ComponentRow) {
    setError(null);
    setEditingId(comp.id);
    setEditName({ es: comp.nameEs, en: comp.nameEn });
    setEditMaterial(comp.material);
    setEditLayerOrder(comp.layerOrder);
    setEditCustomizable(comp.customizable);
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
    <details className="rounded-xl border border-outline-variant/60 bg-surface-container-low p-3.5">
      <summary className="cursor-pointer select-none font-label-caps text-label-caps uppercase text-on-surface-variant">
        {labels.manageParts}
      </summary>

      <div className="mt-3 flex flex-col gap-4">
        <form
          onSubmit={createComponent}
          className="flex flex-wrap items-end gap-3 rounded-lg border border-outline-variant/60 bg-surface-container-lowest p-4"
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
            <input
              name="customizable"
              type="checkbox"
              defaultChecked
              className="accent-primary"
            />
            <span>{labels.customizable}</span>
          </label>
          <button
            type="submit"
            className="rounded bg-on-surface px-4 py-2 font-button text-button text-on-primary transition-colors duration-200 hover:bg-primary"
          >
            {labels.add}
          </button>
        </form>

        {components.map((comp) => {
          const isEditing = editingId === comp.id;
          return (
            <div
              key={comp.id}
              className="rounded-lg border border-outline-variant/60 bg-surface-container-lowest p-4"
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
                    onClick={() => setEditingId(null)}
                    className="rounded border border-outline-variant px-4 py-2 font-button text-button text-on-surface transition-colors duration-200 hover:border-primary hover:text-primary"
                  >
                    {labels.cancel}
                  </button>
                </div>
              ) : (
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="font-body-md text-body-md font-semibold text-on-surface">
                    {locale === "es" ? comp.nameEs : comp.nameEn}{" "}
                    <span className="font-label-caps text-label-caps text-on-surface-variant">
                      ({MATERIAL_LABELS[comp.material as Material]?.[locale] ?? comp.material})
                    </span>
                  </h3>
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
            </div>
          );
        })}

        {error && <p className="font-body-md text-body-md text-error">{error}</p>}
      </div>
    </details>
  );
}
