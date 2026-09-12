"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n/t";
import type { ValorTraducido } from "@/app/[locale]/panel/_components/CampoTraducible";
import {
  EncabezadoModelo,
  type EncabezadoValue,
} from "./[id]/_components/EncabezadoModelo";

export interface ModeloFormValue {
  code: string;
  nameEs: string;
  nameEn: string;
  descriptionEs: string;
  descriptionEn: string;
}

type ModeloType = "configurable" | "fixed_product";

/**
 * Formulario de creación de un modelo nuevo (008-formulario-creacion-modelo).
 * Reutiliza EncabezadoModelo —el mismo encabezado que se ve al editar un
 * modelo— en modo creación: código editable (todavía no existe) y sin
 * estado de publicación (no aplica a un modelo sin vistas ni colores). El
 * resto de la configuración (vistas, colores, personalización) se hace
 * después de crear, en el configurador de siempre.
 */
export function ModeloForm({
  locale,
  initial,
  labels,
}: {
  locale: Locale;
  initial: ModeloFormValue;
  labels: Record<string, string>;
}) {
  const router = useRouter();
  const [code, setCode] = useState(initial.code);
  const [type, setType] = useState<ModeloType>("configurable");
  const [header, setHeader] = useState<EncabezadoValue>({
    name: { es: initial.nameEs, en: initial.nameEn } as ValorTraducido,
    description: { es: initial.descriptionEs, en: initial.descriptionEn } as ValorTraducido,
    price: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);

  // Producto fijo (009-modelos-producto-fijo, FR-002): el precio es
  // obligatorio para ese tipo, a diferencia de un modelo configurable donde
  // sigue siendo opcional (se cotiza).
  const priceMissing = type === "fixed_product" && header.price.trim() === "";

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (priceMissing) {
      setError(true);
      return;
    }
    setSaving(true);
    setError(false);
    const body: Record<string, unknown> = {
      code,
      name: header.name,
      description: header.description,
      type,
      price: header.price.trim() === "" ? undefined : Number(header.price),
    };
    const response = await fetch("/api/panel/modelos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setSaving(false);
    if (!response.ok) {
      setError(true);
      return;
    }
    const created = await response.json();
    router.push(`/${locale}/panel/modelos/${created.id}`);
  }

  return (
    <form onSubmit={onSubmit} className="flex max-w-lg flex-col gap-4">
      <label className="flex flex-col gap-1">
        <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">
          {labels.typeLabel}
        </span>
        <div className="flex gap-1.5">
          {(["configurable", "fixed_product"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                setType(option);
                // Configurable no fija precio (se cotiza): si venía de
                // "Producto fijo" con algo escrito, se limpia.
                if (option === "configurable") {
                  setHeader((h) => ({ ...h, price: "" }));
                }
              }}
              className={
                type === option
                  ? "rounded-full bg-on-surface px-3 py-1.5 font-label-caps text-label-caps text-on-primary"
                  : "rounded-full border border-outline-variant px-3 py-1.5 font-label-caps text-label-caps text-on-surface-variant hover:bg-surface-container-low"
              }
            >
              {option === "configurable" ? labels.typeConfigurable : labels.typeFixedProduct}
            </button>
          ))}
        </div>
        <span className="font-body-md text-[11px] text-on-surface-variant">{labels.typeHint}</span>
      </label>

      <EncabezadoModelo
        locale={locale}
        code={code}
        type={type}
        onCodeChange={setCode}
        value={header}
        onChange={setHeader}
        labels={labels}
      />
      {priceMissing && error && (
        <p className="font-body-md text-body-md text-error">{labels.priceRequired}</p>
      )}
      {error && !priceMissing && <p className="font-body-md text-body-md text-error">{labels.error}</p>}
      <button
        type="submit"
        disabled={saving}
        className="w-fit rounded bg-on-surface px-6 py-2 font-button text-button text-on-primary transition-colors duration-200 hover:bg-primary disabled:opacity-50"
      >
        {labels.save}
      </button>
    </form>
  );
}
