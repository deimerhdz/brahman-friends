"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SubidaArchivo } from "@/app/[locale]/panel/_components/SubidaArchivo";
import { leerDimensiones } from "@/lib/media/leer-dimensiones";

const VIEWS = ["front", "side", "back"] as const;
type View = (typeof VIEWS)[number];

export function VistasForm({
  modelId,
  initial,
  labels,
}: {
  modelId: string;
  initial: Partial<Record<View, string>>;
  labels: Record<string, string>;
}) {
  const router = useRouter();
  const [images, setImages] = useState(initial);
  const [busy, setBusy] = useState<View | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function toggle(view: View, active: boolean) {
    setError(null);
    if (!active) {
      const response = await fetch(`/api/panel/modelos/${modelId}/vistas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ view, active: false }),
      });
      if (response.status === 400) {
        setError(labels.frontRequired);
        return;
      }
      setImages((v) => ({ ...v, [view]: undefined }));
      router.refresh();
      return;
    }
    const response = await fetch(`/api/panel/modelos/${modelId}/vistas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ view, active: true }),
    });
    if (response.ok) router.refresh();
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
      setImages((v) => ({ ...v, [view]: url }));
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {VIEWS.map((view) => {
        const active = view in images && images[view] !== undefined;
        return (
          <div
            key={view}
            className="rounded-lg border border-outline-variant/60 bg-surface-container-lowest p-6 ambient-shadow"
          >
            <label className="flex items-center gap-2 font-body-md text-body-md text-on-surface">
              <input
                type="checkbox"
                checked={active}
                disabled={view === "front"}
                onChange={(e) => toggle(view, e.target.checked)}
                className="accent-primary"
              />
              <span className="font-semibold">{labels[`view_${view}`]}</span>
              {view === "front" && (
                <span className="font-label-caps text-label-caps text-on-surface-variant">
                  {labels.frontRequired}
                </span>
              )}
            </label>
            {active && (
              <div className="mt-3">
                <SubidaArchivo
                  presignEndpoint="/api/panel/subidas/presignar"
                  pathPrefix={`modelos/${modelId}/base-${view}`}
                  accept={["image/png", "image/jpeg", "image/webp"]}
                  currentUrl={images[view] || undefined}
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
