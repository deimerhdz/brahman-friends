"use client";

import { useState } from "react";

/** Restablecer el diseño con confirmación previa (FR-030, SC-007). */
export function Restablecer({
  onConfirm,
  labels,
}: {
  onConfirm: () => void;
  labels: { reset: string; confirmMessage: string; confirm: string; cancel: string };
}) {
  const [confirming, setConfirming] = useState(false);

  if (confirming) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <span>{labels.confirmMessage}</span>
        <button
          type="button"
          onClick={() => {
            onConfirm();
            setConfirming(false);
          }}
          className="rounded bg-red-600 px-2 py-1 text-white"
        >
          {labels.confirm}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="rounded bg-gray-200 px-2 py-1"
        >
          {labels.cancel}
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className="text-sm text-gray-500 underline"
    >
      {labels.reset}
    </button>
  );
}
