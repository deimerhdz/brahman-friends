"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n/t";
import { MATERIALS, MATERIAL_LABELS } from "@/lib/catalogo/materiales";
import { CampoTraducible } from "@/app/[locale]/panel/_components/CampoTraducible";
import {
  SubidaArchivo,
  type EstadoSubida,
} from "@/app/[locale]/panel/_components/SubidaArchivo";

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
  const [uploadStatus, setUploadStatus] = useState<EstadoSubida>("idle");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    const isNew = !value.id;
    const { nameEs, nameEn, ...rest } = value;
    const response = await fetch(
      isNew ? "/api/panel/colores" : `/api/panel/colores/${value.id}`,
      {
        method: isNew ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...rest, name: { es: nameEs, en: nameEn } }),
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
      <CampoTraducible
        label={labels.name}
        value={{ es: value.nameEs, en: value.nameEn }}
        onChange={(v) => setValue((prev) => ({ ...prev, nameEs: v.es, nameEn: v.en }))}
        required
        defaultLocale={locale}
        switchLabels={{ es: labels.switchEs, en: labels.switchEn }}
      />
      <label className="flex flex-col gap-1">
        <span className="font-label-caps text-label-caps text-on-surface-variant">{labels.supplierRef}</span>
        <input
          required
          value={value.supplierRef}
          onChange={(e) =>
            setValue((v) => ({ ...v, supplierRef: e.target.value }))
          }
          className="rounded border border-outline-variant bg-surface px-3 py-2 font-body-md text-body-md text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="font-label-caps text-label-caps text-on-surface-variant">{labels.material}</span>
        <select
          required
          value={value.material}
          onChange={(e) =>
            setValue((v) => ({ ...v, material: e.target.value }))
          }
          className="rounded border border-outline-variant bg-surface px-3 py-2 font-body-md text-body-md text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
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
        <span className="font-label-caps text-label-caps text-on-surface-variant">{labels.status}</span>
        <select
          value={value.status}
          onChange={(e) =>
            setValue((v) => ({
              ...v,
              status: e.target.value as ColorFormValue["status"],
            }))
          }
          className="rounded border border-outline-variant bg-surface px-3 py-2 font-body-md text-body-md text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="available">{labels.statusAvailable}</option>
          <option value="out_of_stock">{labels.statusOutOfStock}</option>
          <option value="discontinued">{labels.statusDiscontinued}</option>
        </select>
      </label>
      <label className="flex flex-col gap-1">
        <span className="font-label-caps text-label-caps text-on-surface-variant">{labels.sampleImage}</span>
        <SubidaArchivo
          presignEndpoint="/api/panel/subidas/presignar"
          pathPrefix="colores"
          accept={["image/png", "image/jpeg", "image/webp"]}
          currentUrl={value.sampleImageUrl || undefined}
          onStatusChange={setUploadStatus}
          onUploaded={(url) => setValue((v) => ({ ...v, sampleImageUrl: url }))}
          labels={{
            select: labels.sampleImage,
            upload: labels.upload,
            uploading: labels.uploading,
            success: labels.uploadSuccess,
            error: labels.uploadError,
            retry: labels.retry,
          }}
        />
      </label>

      {error && <p className="font-body-md text-body-md text-error">{error}</p>}

      <button
        type="submit"
        disabled={
          saving ||
          uploadStatus === "subiendo" ||
          uploadStatus === "error" ||
          !value.sampleImageUrl
        }
        className="w-fit rounded bg-on-surface px-6 py-2 font-button text-button text-on-primary transition-colors duration-200 hover:bg-primary disabled:opacity-50"
      >
        {labels.save}
      </button>
    </form>
  );
}
