"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { allowedTransitions, type RequestStatus } from "@/lib/solicitud/estados";

export interface HistoryEntry {
  fromStatus: string | null;
  toStatus: string;
  adminName: string;
  createdAt: string;
}

/** Cambio de estado con su historial, fecha y responsable (FR-062, SC-027). */
export function Historial({
  requestId,
  currentStatus,
  history,
  labels,
}: {
  requestId: string;
  currentStatus: RequestStatus;
  history: HistoryEntry[];
  labels: Record<string, string>;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const options = allowedTransitions(currentStatus);

  async function changeTo(to: RequestStatus) {
    setBusy(true);
    setError(null);
    const response = await fetch(`/api/panel/solicitudes/${requestId}/estado`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to }),
    });
    setBusy(false);
    if (!response.ok) {
      setError(labels.error);
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {options.map((status) => (
          <button
            key={status}
            type="button"
            disabled={busy}
            onClick={() => changeTo(status)}
            className="rounded bg-brand px-3 py-1 text-sm text-white disabled:opacity-50"
          >
            {labels[`status_${status}`]}
          </button>
        ))}
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <ul className="flex flex-col gap-1 text-sm text-gray-600">
        {history.map((h, i) => (
          <li key={i}>
            {h.fromStatus ? `${labels[`status_${h.fromStatus}`]} → ` : ""}
            {labels[`status_${h.toStatus}`]} — {h.adminName} —{" "}
            {new Date(h.createdAt).toLocaleString()}
          </li>
        ))}
      </ul>
    </div>
  );
}
