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
    <div className="flex flex-col items-end gap-1.5">
      <EstadoBadge
        label={labels[`status_${status}`]}
        tone={status === "published" ? "success" : "neutral"}
      />
      {status === "draft" ? (
        <button
          type="button"
          onClick={publicar}
          disabled={busy}
          className="whitespace-nowrap rounded bg-on-surface px-3 py-1.5 font-button text-[11px] text-on-primary transition-colors duration-200 hover:bg-primary disabled:opacity-50"
        >
          {labels.publish}
        </button>
      ) : (
        <button
          type="button"
          onClick={despublicar}
          disabled={busy}
          className="whitespace-nowrap rounded border border-outline-variant px-3 py-1.5 font-button text-[11px] text-on-surface-variant transition-colors hover:border-on-surface hover:text-on-surface disabled:opacity-50"
        >
          {labels.unpublish}
        </button>
      )}

      {result && (
        <div className="w-64 max-w-[80vw] rounded-lg border border-error/30 bg-error-container p-3 text-left font-body-md text-[11px] text-on-error-container">
          <p className="mb-1 font-semibold">{labels.incomplete}</p>
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
            <ul className="mt-1 list-inside list-disc">
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
