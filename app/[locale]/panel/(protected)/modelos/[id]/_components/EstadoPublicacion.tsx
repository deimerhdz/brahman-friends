"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { PublicacionResultado } from "@/lib/catalogo/publicacion";

// Lista exacta de combinaciones faltantes al intentar publicar (FR-012, SC-023).
export function EstadoPublicacion({
  modelId,
  status,
  labels,
}: {
  modelId: string;
  status: "draft" | "published";
  labels: Record<string, string>;
}) {
  const router = useRouter();
  const [result, setResult] = useState<PublicacionResultado | null>(null);
  const [busy, setBusy] = useState(false);

  async function publicar() {
    setBusy(true);
    setResult(null);
    const response = await fetch(`/api/panel/modelos/${modelId}/publicar`, {
      method: "POST",
    });
    setBusy(false);
    if (response.status === 422) {
      const body = await response.json();
      setResult(body.detail);
      return;
    }
    router.refresh();
  }

  async function despublicar() {
    setBusy(true);
    await fetch(`/api/panel/modelos/${modelId}/publicar`, { method: "DELETE" });
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="mb-6 rounded border border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <span
          className={`rounded px-2 py-1 text-sm ${
            status === "published"
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          {labels[`status_${status}`]}
        </span>
        {status === "draft" ? (
          <button
            type="button"
            onClick={publicar}
            disabled={busy}
            className="rounded bg-brand px-4 py-2 text-sm text-white disabled:opacity-50"
          >
            {labels.publish}
          </button>
        ) : (
          <button
            type="button"
            onClick={despublicar}
            disabled={busy}
            className="rounded bg-gray-200 px-4 py-2 text-sm disabled:opacity-50"
          >
            {labels.unpublish}
          </button>
        )}
      </div>

      {result && (
        <div className="mt-4 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          <p className="mb-2 font-medium">{labels.incomplete}</p>
          {result.missingBaseViews.length > 0 && (
            <p>
              {labels.missingBaseViews}: {result.missingBaseViews.join(", ")}
            </p>
          )}
          {result.componentsWithoutColors.length > 0 && (
            <p>
              {labels.componentsWithoutColors}:{" "}
              {result.componentsWithoutColors.join(", ")}
            </p>
          )}
          {result.missing.length > 0 && (
            <ul className="mt-2 list-inside list-disc">
              {result.missing.map((m, i) => (
                <li key={i}>
                  {m.component} · {m.color} · {m.view}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
