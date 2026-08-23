"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { SubidaArchivo } from "@/app/[locale]/panel/_components/SubidaArchivo";
import { leerDimensiones } from "./_lib/leer-dimensiones";
import { EstadoBadge } from "../../../_EstadoBadge";

type View = "front" | "side" | "back";

interface ComponenteConColores {
  id: string;
  nameEs: string;
  colores: { id: string; nameEs: string }[];
}

interface Cargada {
  componentId: string;
  colorId: string;
  view: View;
}

export function SubidaManual({
  modelId,
  activeViews,
  componentes,
  cargadas,
  labels,
}: {
  modelId: string;
  activeViews: View[];
  componentes: ComponenteConColores[];
  cargadas: Cargada[];
  labels: Record<string, string>;
}) {
  const router = useRouter();
  const [componentId, setComponentId] = useState("");
  const [colorId, setColorId] = useState("");
  const [view, setView] = useState<View | "">("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const selectedComponent = componentes.find((c) => c.id === componentId);

  const cargadasSet = useMemo(
    () =>
      new Set(cargadas.map((c) => `${c.componentId}:${c.colorId}:${c.view}`)),
    [cargadas],
  );

  const matriz = useMemo(
    () =>
      componentes.flatMap((comp) =>
        comp.colores.flatMap((col) =>
          activeViews.map((v) => ({
            key: `${comp.id}:${col.id}:${v}`,
            componentName: comp.nameEs,
            colorName: col.nameEs,
            view: v,
            cargada: cargadasSet.has(`${comp.id}:${col.id}:${v}`),
          })),
        ),
      ),
    [componentes, activeViews, cargadasSet],
  );

  async function handleUploaded(url: string, file: File) {
    setSaving(true);
    setError(null);
    setSuccess(false);
    const dims = await leerDimensiones(file);
    const response = await fetch(`/api/panel/modelos/${modelId}/imagenes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        images: [
          {
            componentId,
            colorId,
            view,
            url,
            width: dims.width,
            height: dims.height,
          },
        ],
      }),
    });
    setSaving(false);
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      setError(
        body.error === "dimensiones_no_coinciden"
          ? labels.dimensionMismatch
          : labels.error,
      );
      return;
    }
    setSuccess(true);
    setColorId("");
    setView("");
    router.refresh();
  }

  const faltantes = matriz.filter((m) => !m.cargada);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 rounded-lg border border-outline-variant/60 bg-surface-container-lowest p-6 ambient-shadow">
        <h2 className="font-body-md text-body-md font-semibold text-on-surface">
          {labels.title}
        </h2>
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1">
            <span className="font-label-caps text-label-caps text-on-surface-variant">
              {labels.component}
            </span>
            <select
              value={componentId}
              onChange={(e) => {
                setComponentId(e.target.value);
                setColorId("");
              }}
              className="rounded border border-outline-variant bg-surface px-3 py-2 font-body-md text-body-md text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">{labels.selectComponent}</option>
              {componentes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nameEs}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-label-caps text-label-caps text-on-surface-variant">
              {labels.color}
            </span>
            <select
              value={colorId}
              onChange={(e) => setColorId(e.target.value)}
              disabled={!selectedComponent}
              className="rounded border border-outline-variant bg-surface px-3 py-2 font-body-md text-body-md text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
            >
              <option value="">{labels.selectColor}</option>
              {selectedComponent?.colores.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nameEs}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-label-caps text-label-caps text-on-surface-variant">
              {labels.view}
            </span>
            <select
              value={view}
              onChange={(e) => setView(e.target.value as View)}
              className="rounded border border-outline-variant bg-surface px-3 py-2 font-body-md text-body-md text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">{labels.selectView}</option>
              {activeViews.map((v) => (
                <option key={v} value={v}>
                  {labels[`view_${v}`]}
                </option>
              ))}
            </select>
          </label>
        </div>

        {componentId && colorId && view && (
          <SubidaArchivo
            key={`${componentId}-${colorId}-${view}`}
            presignEndpoint="/api/panel/subidas/presignar"
            pathPrefix={`modelos/${modelId}`}
            accept={["image/png", "image/jpeg", "image/webp"]}
            onUploaded={handleUploaded}
            labels={{
              select: labels.selectComponent,
              upload: labels.upload,
              uploading: labels.uploading,
              success: labels.success,
              error: labels.error,
              retry: labels.retry,
            }}
          />
        )}

        {saving && (
          <p className="font-body-md text-body-md text-on-surface-variant">
            {labels.uploading}
          </p>
        )}
        {error && (
          <p className="font-body-md text-body-md text-error">{error}</p>
        )}
        {success && (
          <p className="font-body-md text-body-md text-[#2E7D32]">
            {labels.success}
          </p>
        )}
      </div>

      <div className="overflow-hidden rounded-lg border border-outline-variant/60 bg-surface-container-lowest ambient-shadow">
        <h2 className="border-b border-outline-variant/30 px-6 py-4 font-body-md text-body-md font-semibold text-on-surface">
          {labels.matrixTitle}
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead className="border-b border-outline-variant/30">
              <tr>
                <th className="px-6 py-3 text-label-caps font-label-caps text-on-surface-variant">
                  {labels.component}
                </th>
                <th className="px-6 py-3 text-label-caps font-label-caps text-on-surface-variant">
                  {labels.color}
                </th>
                <th className="px-6 py-3 text-label-caps font-label-caps text-on-surface-variant">
                  {labels.view}
                </th>
                <th className="px-6 py-3 text-label-caps font-label-caps text-on-surface-variant">
                  {labels.status}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {matriz.map((row) => (
                <tr key={row.key}>
                  <td className="px-6 py-2 font-body-md text-body-md text-on-surface">
                    {row.componentName}
                  </td>
                  <td className="px-6 py-2 font-body-md text-body-md text-on-surface">
                    {row.colorName}
                  </td>
                  <td className="px-6 py-2 font-body-md text-body-md text-on-surface">
                    {row.view}
                  </td>
                  <td className="px-6 py-2">
                    {row.cargada ? (
                      <EstadoBadge label={labels.loaded} tone="success" />
                    ) : (
                      <EstadoBadge label={labels.missing} tone="danger" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {faltantes.length === 0 && matriz.length > 0 && (
          <p className="border-t border-outline-variant/30 px-6 py-3 font-body-md text-body-md text-[#2E7D32]">
            {labels.allLoaded}
          </p>
        )}
      </div>
    </div>
  );
}
