"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SubidaArchivo } from "@/app/[locale]/panel/_components/SubidaArchivo";
import { leerDimensiones } from "@/lib/media/leer-dimensiones";

const VIEWS = ["front", "left", "right", "back"] as const;
type View = (typeof VIEWS)[number];

interface ViewRow {
  baseImageUrl: string | null;
  active: boolean;
}

/**
 * Paso 1 del wizard: vistas/fotos del modelo. La vista "front" se destaca
 * como "Foto de Portada" porque es la que se usa en el catálogo. Destildar
 * una vista NO borra su imagen: solo la oculta de la tienda (`active:false`
 * en el servidor, ver /api/panel/modelos/[id]/vistas), así que la imagen ya
 * cargada se sigue mostrando en miniatura para que quede claro que no se
 * perdió y se pueda reactivar sin volver a subirla.
 */
export function PasoVistas({
  modelId,
  initial,
  labels,
}: {
  modelId: string;
  initial: Record<View, ViewRow>;
  labels: Record<string, string>;
}) {
  const router = useRouter();
  const [rows, setRows] = useState(initial);
  const [busy, setBusy] = useState<View | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function toggle(view: View, active: boolean) {
    setError(null);
    const response = await fetch(`/api/panel/modelos/${modelId}/vistas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ view, active }),
    });
    if (response.status === 400) {
      setError(labels.frontRequired);
      return;
    }
    if (!response.ok) {
      setError(labels.error);
      return;
    }
    setRows((r) => ({ ...r, [view]: { ...r[view], active } }));
    router.refresh();
  }

  async function onUploaded(view: View, url: string, file: File) {
    setBusy(view);
    setError(null);
    try {
      const dims = await leerDimensiones(file);
      const response = await fetch(`/api/panel/modelos/${modelId}/vistas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          view,
          active: true,
          baseImageUrl: url,
          width: dims.width,
          height: dims.height,
        }),
      });
      if (!response.ok) {
        setError(labels.error);
        return;
      }
      setRows((r) => ({ ...r, [view]: { baseImageUrl: url, active: true } }));
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-headline-md text-[13px] font-bold uppercase tracking-wider text-on-surface">
            {labels.stepViews}
          </h2>
          <p className="mt-0.5 font-body-md text-[11px] text-on-surface-variant">
            {labels.stepViewsHint}
          </p>
        </div>
        <span className="material-symbols-outlined text-lg text-on-surface-variant">
          photo_library
        </span>
      </div>

      {VIEWS.map((view) => {
        const row = rows[view];
        const isFront = view === "front";
        return (
          <div
            key={view}
            className={
              isFront
                ? "space-y-1.5 rounded-lg border border-primary/40 bg-primary/5 p-3"
                : "rounded-lg border border-outline-variant/60 bg-surface-container-lowest p-3"
            }
          >
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 font-body-md text-xs text-on-surface">
                <input
                  type="checkbox"
                  checked={row.active}
                  disabled={isFront}
                  onChange={(e) => toggle(view, e.target.checked)}
                  className="accent-primary"
                />
                <span className="font-semibold">
                  {isFront ? labels.coverPhoto : labels[`view_${view}`]}
                </span>
              </label>
              {isFront && (
                <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-on-primary">
                  {labels[`view_${view}`]}
                </span>
              )}
            </div>
            {isFront && (
              <p className="text-[11px] leading-relaxed text-on-surface-variant">
                {labels.coverPhotoHint}
              </p>
            )}

            {!row.active && row.baseImageUrl && (
              <div className="mt-2 flex items-center gap-2 rounded border border-outline-variant/40 bg-surface-container-low/60 p-1.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={row.baseImageUrl}
                  alt=""
                  className="h-8 w-8 rounded border border-outline-variant/60 object-cover"
                />
                <span className="text-[11px] text-on-surface-variant">
                  {labels.hiddenFromCatalog}
                </span>
              </div>
            )}

            {row.active && (
              <div className="mt-2">
                <SubidaArchivo
                  presignEndpoint="/api/panel/subidas/presignar"
                  pathPrefix={`modelos/${modelId}/base-${view}`}
                  accept={["image/png", "image/jpeg", "image/webp"]}
                  currentUrl={row.baseImageUrl || undefined}
                  onUploaded={(url, file) => onUploaded(view, url, file)}
                  labels={{
                    select: labels[`view_${view}`],
                    upload: labels.upload,
                    uploading: labels.uploading,
                    success: labels.uploadSuccess,
                    error: labels.error,
                    retry: labels.retry,
                  }}
                />
                {busy === view && (
                  <span className="font-body-md text-body-md text-on-surface-variant">
                    {labels.uploading}
                  </span>
                )}
              </div>
            )}
          </div>
        );
      })}
      {error && <p className="font-body-md text-body-md text-error">{error}</p>}
    </div>
  );
}
