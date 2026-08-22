"use client";

/**
 * Bloquea el doble envío y conserva el diseño para reintentar tras un fallo
 * de red (FR-054, FR-055): el estado que arma el envío no se toca aquí, así
 * que un reintento no exige volver a configurar nada.
 */
export function BotonEnviar({
  onSubmit,
  disabled,
  submitting,
  error,
  labels,
}: {
  onSubmit: () => void;
  disabled: boolean;
  submitting: boolean;
  error: string | null;
  labels: { submit: string; submitting: string; retry: string };
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="button"
        onClick={onSubmit}
        disabled={disabled || submitting}
        className="w-full rounded bg-brand px-4 py-3 text-white disabled:opacity-50"
      >
        {submitting ? labels.submitting : error ? labels.retry : labels.submit}
      </button>
    </div>
  );
}
