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
        className="text-sm text-red-600 underline"
      >
        {labels.anonymize}
      </button>
    );
  }

  return (
    <div className="rounded border border-red-300 bg-red-50 p-3 text-sm">
      <p className="mb-2 font-medium text-red-700">{labels.confirmIrreversible}</p>
      {error && <p className="mb-2 text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={confirm}
          className="rounded bg-red-600 px-3 py-1 text-white disabled:opacity-50"
        >
          {labels.confirm}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="rounded bg-gray-200 px-3 py-1"
        >
          {labels.cancel}
        </button>
      </div>
    </div>
  );
}
