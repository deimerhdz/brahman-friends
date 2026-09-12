"use client";

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
  onCodeChange,
  value,
  onChange,
  labels,
}: {
  locale: Locale;
  modelId?: string;
  code: string;
  status?: "draft" | "published";
  onCodeChange?: (code: string) => void;
  value: EncabezadoValue;
  onChange: (value: EncabezadoValue) => void;
  labels: Record<string, string>;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-3">
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
        {modelId && status && (
          <div className="shrink-0 pt-0.5">
            <EstadoPublicacion
              modelId={modelId}
              status={status}
              labels={{
                status_draft: labels.status_draft,
                status_published: labels.status_published,
                publish: labels.publish,
                unpublish: labels.unpublish,
                incomplete: labels.incomplete,
                missingBaseViews: labels.missingBaseViews,
                componentsWithoutColors: labels.componentsWithoutColors,
              }}
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
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
        defaultLocale={locale}
        switchLabels={{ es: labels.switchEs, en: labels.switchEn }}
      />
    </div>
  );
}
