"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { PublicacionResultado } from "@/lib/catalogo/publicacion";
import { EstadoBadge } from "../../../_EstadoBadge";

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
    <div className="mb-6 rounded-lg border border-outline-variant/60 bg-surface-container-lowest p-6 ambient-shadow">
      <div className="flex items-center justify-between">
        <EstadoBadge
          label={labels[`status_${status}`]}
          tone={status === "published" ? "success" : "neutral"}
        />
        {status === "draft" ? (
          <button
            type="button"
            onClick={publicar}
            disabled={busy}
            className="rounded bg-on-surface px-4 py-2 font-button text-button text-on-primary transition-colors duration-200 hover:bg-primary disabled:opacity-50"
          >
            {labels.publish}
          </button>
        ) : (
          <button
            type="button"
            onClick={despublicar}
            disabled={busy}
            className="rounded border border-outline-variant px-4 py-2 font-button text-button text-on-surface-variant transition-colors hover:border-on-surface hover:text-on-surface disabled:opacity-50"
          >
            {labels.unpublish}
          </button>
        )}
      </div>

      {result && (
        <div className="mt-4 rounded-lg border border-error/30 bg-error-container p-4 font-body-md text-body-md text-on-error-container">
          <p className="mb-2 font-semibold">{labels.incomplete}</p>
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
