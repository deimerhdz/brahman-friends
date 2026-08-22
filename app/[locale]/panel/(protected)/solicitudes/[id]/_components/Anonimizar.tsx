"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Confirmación explícita de irreversibilidad antes de anonimizar (RN23,
 * SC-034).
 */
export function Anonimizar({
  requestId,
  labels,
}: {
  requestId: string;
  labels: Record<string, string>;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function confirm() {
    setBusy(true);
    setError(null);
    const response = await fetch(`/api/panel/solicitudes/${requestId}/anonimizar`, {
      method: "POST",
    });
    setBusy(false);
    if (!response.ok) {
      setError(labels.error);
      return;
    }
    setConfirming(false);
    router.refresh();
  }

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="w-fit font-body-md text-body-md text-error underline hover:no-underline"
      >
        {labels.anonymize}
      </button>
    );
  }

  return (
    <div className="rounded-lg border border-error/30 bg-error-container p-4 font-body-md text-body-md">
      <p className="mb-2 font-semibold text-on-error-container">{labels.confirmIrreversible}</p>
      {error && <p className="mb-2 text-error">{error}</p>}
      <div className="flex gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={confirm}
          className="rounded bg-error px-4 py-2 font-button text-button text-on-error disabled:opacity-50"
        >
          {labels.confirm}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="rounded border border-outline-variant px-4 py-2 font-button text-button text-on-surface-variant transition-colors hover:border-on-surface hover:text-on-surface"
        >
          {labels.cancel}
        </button>
      </div>
    </div>
  );
}
