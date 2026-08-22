"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { upload } from "@vercel/blob/client";

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

  async function onFile(view: View, file: File | undefined) {
    if (!file) return;
    setBusy(view);
    setError(null);
    try {
      const dims = await readDimensions(file);
      const blob = await upload(
        `modelos/${modelId}/base-${view}-${Date.now()}-${file.name}`,
        file,
        { access: "public", handleUploadUrl: "/api/panel/subidas/autorizar" },
      );
      const response = await fetch(`/api/panel/modelos/${modelId}/vistas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          view,
          active: true,
          baseImageUrl: blob.url,
          width: dims.width,
          height: dims.height,
        }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        setError(
          body.error === "dimensiones_no_coinciden"
            ? labels.dimensionMismatch
            : labels.error,
        );
        return;
      }
      setImages((v) => ({ ...v, [view]: blob.url }));
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
          <div key={view} className="rounded border border-gray-200 p-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={active}
                disabled={view === "front"}
                onChange={(e) => toggle(view, e.target.checked)}
              />
              <span className="font-medium">{labels[`view_${view}`]}</span>
              {view === "front" && (
                <span className="text-xs text-gray-500">
                  {labels.frontRequired}
                </span>
              )}
            </label>
            {active && (
              <div className="mt-2 flex items-center gap-3">
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(e) => onFile(view, e.target.files?.[0])}
                />
                {busy === view && <span>{labels.uploading}</span>}
                {images[view] && (
                  <img
                    src={images[view]}
                    alt=""
                    className="h-14 w-14 rounded object-cover"
                  />
                )}
              </div>
            )}
          </div>
        );
      })}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

function readDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("no se pudo leer la imagen"));
    };
    img.src = url;
  });
}
