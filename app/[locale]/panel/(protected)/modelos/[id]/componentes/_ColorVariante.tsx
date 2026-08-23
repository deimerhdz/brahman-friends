"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SubidaArchivo } from "@/app/[locale]/panel/_components/SubidaArchivo";
import { leerDimensiones } from "@/lib/media/leer-dimensiones";
import { EstadoBadge } from "../../../_EstadoBadge";

type View = "front" | "side" | "back";

export function ColorVariante({
  modelId,
  componentId,
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

  return (
    <div className="rounded-lg border border-outline-variant/40 p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="font-body-md text-body-md font-semibold text-on-surface">
          {color.nameEs}
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

      <div className="mt-2 flex flex-col gap-2">
        {activeViews.map((v) => {
          const checked = requiredViews.includes(v);
          const imageUrl = images[v];
          return (
            <div key={v} className="flex flex-col gap-1">
              <label className="flex items-center gap-2 font-body-md text-body-md text-on-surface">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => toggleView(v, e.target.checked)}
                  className="accent-primary"
                />
                <span>{labels[`view_${v}`]}</span>
              </label>

              {checked && (
                <div className="ml-6 flex flex-col gap-2">
                  {imageUrl && editingView !== v ? (
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imageUrl}
                        alt=""
                        className="h-10 w-10 rounded border border-outline-variant/60 object-cover"
                      />
                      <EstadoBadge label={labels.loaded} tone="success" />
                      <button
                        type="button"
                        onClick={() => setEditingView(v)}
                        className="font-label-caps text-label-caps text-primary underline-offset-2 hover:underline"
                      >
                        {labels.edit}
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteImage(v)}
                        className="font-label-caps text-label-caps text-error underline-offset-2 hover:underline"
                      >
                        {labels.delete}
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {!imageUrl && (
                        <EstadoBadge label={labels.missing} tone="danger" />
                      )}
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
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {requiredViews.length > 0 && (
        <label className="mt-3 flex items-center gap-1 font-label-caps text-label-caps text-on-surface-variant">
          <input
            type="radio"
            checked={isDefault}
            onChange={onSetDefault}
            className="accent-primary"
          />
          {labels.default}
        </label>
      )}

      {error && (
        <p className="mt-2 font-body-md text-body-md text-error">{error}</p>
      )}
    </div>
  );
}
