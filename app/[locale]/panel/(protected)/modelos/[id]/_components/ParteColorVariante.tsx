"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SubidaArchivo } from "@/app/[locale]/panel/_components/SubidaArchivo";
import { leerDimensiones } from "@/lib/media/leer-dimensiones";

type View = "front" | "side" | "back";

/**
 * Bloque de un componente (corona/visera/malla) dentro de la tarjeta de una
 * variante de color: qué vistas están habilitadas para ese componente+color
 * y sus imágenes. Misma lógica que la antigua _ColorVariante.tsx, ahora
 * anidada dentro del paso "Colores" en vez de vivir en una página de
 * "Componentes" separada.
 */
export function ParteColorVariante({
  modelId,
  componentId,
  componentName,
  color,
  activeViews,
  requiredViews,
  images,
  isDefault,
  onSetDefault,
  labels,
}: {
  modelId: string;
  componentId: string;
  componentName: string;
  color: { id: string; nameEs: string };
  activeViews: View[];
  requiredViews: View[];
  images: Partial<Record<View, string>>;
  isDefault: boolean;
  onSetDefault: () => void;
  labels: Record<string, string>;
}) {
  const router = useRouter();
  const [editingView, setEditingView] = useState<View | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function toggleView(view: View, checked: boolean) {
    setError(null);
    if (checked) {
      const response = await fetch(
        `/api/panel/componentes/${componentId}/colores`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ colorId: color.id, view }),
        },
      );
      if (!response.ok) {
        setError(labels.error);
        return;
      }
      router.refresh();
      return;
    }
    if (images[view] && !window.confirm(labels.confirmRemoveView)) return;
    const response = await fetch(
      `/api/panel/componentes/${componentId}/colores?colorId=${color.id}&view=${view}`,
      { method: "DELETE" },
    );
    if (!response.ok) {
      setError(labels.error);
      return;
    }
    router.refresh();
  }

  async function deleteVariant() {
    if (!window.confirm(labels.confirmDeleteVariant)) return;
    setError(null);
    const response = await fetch(
      `/api/panel/componentes/${componentId}/colores?colorId=${color.id}`,
      { method: "DELETE" },
    );
    if (!response.ok) {
      setError(labels.error);
      return;
    }
    router.refresh();
  }

  async function deleteImage(view: View) {
    if (!window.confirm(labels.confirmDeleteImage)) return;
    setError(null);
    const response = await fetch(
      `/api/panel/modelos/${modelId}/imagenes?componentId=${componentId}&colorId=${color.id}&view=${view}`,
      { method: "DELETE" },
    );
    if (!response.ok) {
      setError(labels.error);
      return;
    }
    router.refresh();
  }

  async function handleUploaded(view: View, url: string, file: File) {
    setError(null);
    const dims = await leerDimensiones(file);
    const response = await fetch(`/api/panel/modelos/${modelId}/imagenes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        images: [
          {
            componentId,
            colorId: color.id,
            view,
            url,
            width: dims.width,
            height: dims.height,
          },
        ],
      }),
    });
    if (!response.ok) {
      setError(labels.error);
      return;
    }
    setEditingView(null);
    router.refresh();
  }

  const loadedCount = activeViews.filter((v) => images[v]).length;
  const complete = loadedCount === activeViews.length && activeViews.length > 0;

  return (
    <div className="rounded-lg border border-outline-variant/40 bg-surface p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">
          {componentName}
        </span>
        <div className="flex items-center gap-2">
          <span
            className={`font-label-caps text-label-caps ${complete ? "text-[#2E7D32]" : "text-[#8D6E00]"}`}
          >
            {labels.viewsProgress} ({loadedCount}/{activeViews.length}) ·{" "}
            {complete ? labels.readyForStore : labels.pendingPhotos}
          </span>
          {requiredViews.length > 0 && (
            <button
              type="button"
              onClick={deleteVariant}
              className="font-label-caps text-label-caps text-error underline-offset-2 hover:underline"
            >
              {labels.deleteVariant}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {activeViews.map((v) => {
          const checked = requiredViews.includes(v);
          const imageUrl = images[v];
          return (
            <div key={v} className="flex flex-col gap-1">
              <label className="flex items-center gap-1.5 font-body-md text-[11px] text-on-surface">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => toggleView(v, e.target.checked)}
                  className="h-3.5 w-3.5 accent-primary"
                />
                <span>{labels[`view_${v}`]}</span>
              </label>

              {checked &&
                (imageUrl && editingView !== v ? (
                  <div className="group rounded-lg border border-outline-variant/60 bg-surface-container-low/50 p-1.5">
                    <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded border border-outline-variant/40 bg-surface-container-lowest">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imageUrl}
                        alt=""
                        className="h-full w-full object-contain"
                      />
                      <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-[#2E7D32]" />
                    </div>
                    <div className="mt-1 flex items-center justify-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setEditingView(v)}
                        className="text-[9px] font-medium text-primary hover:underline"
                      >
                        {labels.edit}
                      </button>
                      <span className="text-[9px] text-outline-variant">•</span>
                      <button
                        type="button"
                        onClick={() => deleteImage(v)}
                        className="text-[9px] font-medium text-error hover:underline"
                      >
                        {labels.delete}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-outline-variant bg-surface-container-low p-1.5">
                    <SubidaArchivo
                      key={`${componentId}-${color.id}-${v}`}
                      presignEndpoint="/api/panel/subidas/presignar"
                      pathPrefix={`modelos/${modelId}`}
                      accept={["image/png", "image/jpeg", "image/webp"]}
                      currentUrl={imageUrl}
                      onUploaded={(url, file) => handleUploaded(v, url, file)}
                      labels={{
                        select: labels[`view_${v}`],
                        upload: labels.upload,
                        uploading: labels.uploading,
                        success: labels.uploadSuccess,
                        error: labels.error,
                        retry: labels.retry,
                      }}
                    />
                  </div>
                ))}
            </div>
          );
        })}
      </div>

      {requiredViews.length > 0 && (
        <label className="mt-2 flex items-center gap-1.5 font-label-caps text-label-caps text-on-surface-variant">
          <input
            type="radio"
            checked={isDefault}
            onChange={onSetDefault}
            className="h-3.5 w-3.5 accent-primary"
          />
          {labels.defaultColor}
        </label>
      )}

      {error && (
        <p className="mt-2 font-body-md text-body-md text-error">{error}</p>
      )}
    </div>
  );
}
