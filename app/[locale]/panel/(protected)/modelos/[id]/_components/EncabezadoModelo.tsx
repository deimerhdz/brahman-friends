"use client";

import { useState } from "react";
import type { Locale } from "@/lib/i18n/t";
import {
  CampoTraducible,
  type ValorTraducido,
} from "@/app/[locale]/panel/_components/CampoTraducible";
import { EstadoPublicacion } from "./EstadoPublicacion";

export interface EncabezadoValue {
  name: ValorTraducido;
  description: ValorTraducido;
  price: string;
}

/**
 * Encabezado editable del modelo (nombre, descripción, precio, código y
 * estado de publicación). Es un componente controlado: el guardado
 * explícito de nombre/descripción/precio lo dispara el botón "Guardar
 * Cambios" del panel (ver ModeloConfigurador), no autosave, igual que el
 * _ModeloForm.tsx original.
 *
 * También se usa en modo creación (008-formulario-creacion-modelo): sin
 * `modelId`/`status` no tiene sentido mostrar el estado de publicación (el
 * modelo todavía no existe), y con `onCodeChange` el código se puede
 * escribir en vez de mostrarse de solo lectura.
 */
export function EncabezadoModelo({
  locale,
  modelId,
  code,
  status,
  type,
  onCodeChange,
  value,
  onChange,
  labels,
}: {
  locale: Locale;
  modelId?: string;
  code: string;
  status?: "draft" | "published";
  type?: "configurable" | "fixed_product";
  onCodeChange?: (code: string) => void;
  value: EncabezadoValue;
  onChange: (value: EncabezadoValue) => void;
  labels: Record<string, string>;
}) {
  // Solo se puede colapsar en modo edición (hay modelId/status): en el
  // formulario de creación no tiene sentido, es lo único que hay en pantalla.
  const collapsible = Boolean(modelId && status);
  const [open, setOpen] = useState(true);

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        {collapsible ? (
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="flex flex-1 items-center gap-2 text-left"
            aria-expanded={open}
          >
            <span className="material-symbols-outlined shrink-0 text-on-surface-variant">
              {open ? "expand_less" : "expand_more"}
            </span>
            {open ? (
              <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">
                {labels.name}
              </span>
            ) : (
              <span className="truncate font-body-lg text-body-lg font-medium text-on-surface">
                {value.name[locale] || labels.name}
              </span>
            )}
          </button>
        ) : (
          <div className="flex-1">
            <CampoTraducible
              label={labels.name}
              value={value.name}
              onChange={(name) => onChange({ ...value, name })}
              required
              defaultLocale={locale}
              switchLabels={{ es: labels.switchEs, en: labels.switchEn }}
            />
          </div>
        )}
        {modelId && status && (
          <div className="flex shrink-0 flex-col items-end gap-1.5 pt-0.5">
            {type && (
              <span className="rounded-full border border-outline-variant/60 px-2.5 py-0.5 font-label-caps text-[10px] uppercase text-on-surface-variant">
                {type === "fixed_product" ? labels.typeFixedProduct : labels.typeConfigurable}
              </span>
            )}
            <EstadoPublicacion
              modelId={modelId}
              status={status}
              type={type ?? "configurable"}
              labels={{
                status_draft: labels.status_draft,
                status_published: labels.status_published,
                publish: labels.publish,
                unpublish: labels.unpublish,
                incomplete: labels.incomplete,
                missingBaseViews: labels.missingBaseViews,
                componentsWithoutColors: labels.componentsWithoutColors,
                missingPrice: labels.missingPrice,
                missingPhoto: labels.missingPhoto,
              }}
            />
          </div>
        )}
      </div>

      {(!collapsible || open) && (
        <>
          {collapsible && (
            <CampoTraducible
              label={labels.name}
              value={value.name}
              onChange={(name) => onChange({ ...value, name })}
              required
              defaultLocale={locale}
              switchLabels={{ es: labels.switchEs, en: labels.switchEn }}
            />
          )}

          <div className={`grid gap-3 ${type === "fixed_product" ? "grid-cols-2" : "grid-cols-1"}`}>
            {type === "fixed_product" && (
              <label className="flex flex-col gap-1">
                <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">
                  {labels.price}
                </span>
                <div className="relative flex items-center">
                  <span className="pointer-events-none absolute left-3 font-body-md text-body-md text-on-surface-variant">
                    $
                  </span>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={value.price}
                    onChange={(e) => onChange({ ...value, price: e.target.value })}
                    className="w-full rounded border border-outline-variant bg-surface py-2 pl-6 pr-3 font-body-md text-body-md text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </label>
            )}
            <label className="flex flex-col gap-1">
              <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">
                {labels.code}
              </span>
              {onCodeChange ? (
                <input
                  value={code}
                  onChange={(e) => onCodeChange(e.target.value)}
                  required
                  className="h-[38px] rounded border border-outline-variant bg-surface px-3 font-body-md text-body-md text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              ) : (
                <div className="flex h-[38px] items-center rounded border border-outline-variant bg-surface-container-low px-3">
                  <span className="font-body-md text-body-md text-on-surface-variant">
                    {code}
                  </span>
                </div>
              )}
            </label>
          </div>

          <CampoTraducible
            label={labels.description}
            value={value.description}
            onChange={(description) => onChange({ ...value, description })}
            multiline
            richText
            placeholder={labels.descriptionPlaceholder}
            defaultLocale={locale}
            switchLabels={{ es: labels.switchEs, en: labels.switchEn }}
          />
        </>
      )}
    </div>
  );
}
