"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { upload } from "@vercel/blob/client";
import type { Locale } from "@/lib/i18n/t";
import { MATERIALS, MATERIAL_LABELS } from "@/lib/catalogo/materiales";

export interface ColorFormValue {
  id?: string;
  nameEs: string;
  nameEn: string;
  supplierRef: string;
  material: string;
  sampleImageUrl: string;
  status: "available" | "out_of_stock" | "discontinued";
}

export function ColorForm({
  locale,
  initial,
  labels,
}: {
  locale: Locale;
  initial: ColorFormValue;
  labels: Record<string, string>;
}) {
  const router = useRouter();
  const [value, setValue] = useState(initial);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onFileChange(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const blob = await upload(`colores/${Date.now()}-${file.name}`, file, {
        access: "public",
        handleUploadUrl: "/api/panel/subidas/autorizar",
      });
      setValue((v) => ({ ...v, sampleImageUrl: blob.url }));
    } catch {
      setError(labels.uploadError);
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    const isNew = !value.id;
    const response = await fetch(
      isNew ? "/api/panel/colores" : `/api/panel/colores/${value.id}`,
      {
        method: isNew ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(value),
      },
    );
    setSaving(false);
    if (!response.ok) {
      setError(labels.saveError);
      return;
    }
    router.push(`/${locale}/panel/colores`);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="flex max-w-lg flex-col gap-4">
      <label className="flex flex-col gap-1">
        <span>{labels.nameEs}</span>
        <input
          required
          value={value.nameEs}
          onChange={(e) => setValue((v) => ({ ...v, nameEs: e.target.value }))}
          className="rounded border border-gray-300 px-3 py-2"
        />
      </label>
      <label className="flex flex-col gap-1">
        <span>{labels.nameEn}</span>
        <input
          required
          value={value.nameEn}
          onChange={(e) => setValue((v) => ({ ...v, nameEn: e.target.value }))}
          className="rounded border border-gray-300 px-3 py-2"
        />
      </label>
      <label className="flex flex-col gap-1">
        <span>{labels.supplierRef}</span>
        <input
          required
          value={value.supplierRef}
          onChange={(e) =>
            setValue((v) => ({ ...v, supplierRef: e.target.value }))
          }
          className="rounded border border-gray-300 px-3 py-2"
        />
      </label>
      <label className="flex flex-col gap-1">
        <span>{labels.material}</span>
        <select
          required
          value={value.material}
          onChange={(e) =>
            setValue((v) => ({ ...v, material: e.target.value }))
          }
          className="rounded border border-gray-300 px-3 py-2"
        >
          <option value="" disabled>
            {labels.selectMaterial}
          </option>
          {MATERIALS.map((m) => (
            <option key={m} value={m}>
              {MATERIAL_LABELS[m][locale]}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1">
        <span>{labels.status}</span>
        <select
          value={value.status}
          onChange={(e) =>
            setValue((v) => ({
              ...v,
              status: e.target.value as ColorFormValue["status"],
            }))
          }
          className="rounded border border-gray-300 px-3 py-2"
        >
          <option value="available">{labels.statusAvailable}</option>
          <option value="out_of_stock">{labels.statusOutOfStock}</option>
          <option value="discontinued">{labels.statusDiscontinued}</option>
        </select>
      </label>
      <label className="flex flex-col gap-1">
        <span>{labels.sampleImage}</span>
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={(e) => onFileChange(e.target.files?.[0])}
        />
        {uploading && <p className="text-sm text-gray-500">{labels.uploading}</p>}
        {value.sampleImageUrl && (
          <img
            src={value.sampleImageUrl}
            alt=""
            className="h-16 w-16 rounded object-cover"
          />
        )}
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={saving || uploading || !value.sampleImageUrl}
        className="rounded bg-brand px-4 py-2 text-white disabled:opacity-50"
      >
        {labels.save}
      </button>
    </form>
  );
}
