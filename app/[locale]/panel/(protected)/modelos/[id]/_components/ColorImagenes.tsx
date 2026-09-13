"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SubidaArchivo } from "@/app/[locale]/panel/_components/SubidaArchivo";
import { leerDimensiones } from "@/lib/media/leer-dimensiones";

type View = "front" | "side" | "back";

/**
 * Fotos de la gorra completa en un color, una por vista activa del modelo.
 * Reemplaza al viejo esquema por "partes": el negocio no personaliza por
 * pieza, solo por color de la gorra entera.
 */
export function ColorImagenes({
  modelId,
  colorId,
  activeViews,
  images,
  labels,
}: {
  modelId: string;
  colorId: string;
  activeViews: View[];
  images: Partial<Record<View, string>>;
  labels: Record<string, string>;
}) {
  const router = useRouter();
  const [editingView, setEditingView] = useState<View | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function deleteImage(view: View) {
    if (images[view] && !window.confirm(labels.confirmDeleteImage)) return;
    setError(null);
    const response = await fetch(
      `/api/panel/colores/${colorId}/imagenes?view=${view}`,
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
    const response = await fetch(`/api/panel/colores/${colorId}/imagenes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ view, url, width: dims.width, height: dims.height }),
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
      <div className="mb-2 flex items-center justify-end gap-2">
        <span
          className={`font-label-caps text-label-caps ${complete ? "text-[#2E7D32]" : "text-[#8D6E00]"}`}
        >
          {labels.viewsProgress} ({loadedCount}/{activeViews.length}) ·{" "}
          {complete ? labels.readyForStore : labels.pendingPhotos}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {activeViews.map((v) => {
          const imageUrl = images[v];
          return (
            <div key={v} className="flex flex-col gap-1">
              <span className="font-body-md text-[11px] text-on-surface">
                {labels[`view_${v}`]}
              </span>

              {imageUrl && editingView !== v ? (
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
                    key={`${colorId}-${v}`}
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
          );
        })}
      </div>

      {error && (
        <p className="mt-2 font-body-md text-body-md text-error">{error}</p>
      )}
    </div>
  );
}
