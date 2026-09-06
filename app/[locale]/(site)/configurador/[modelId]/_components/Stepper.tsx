"use client";

/**
 * Indicador de progreso por pasos y navegación Atrás/Siguiente
 * (006-configurador-stepper FR-013 a FR-017). Presentacional: el contenido
 * del paso activo llega como `children`, y quién decide si se puede avanzar
 * o qué hace el botón principal en el último paso es quien lo usa
 * (`ConfiguradorApp.tsx`), no este componente.
 */
export function Stepper({
  steps,
  current,
  maxReached,
  onJump,
  onBack,
  primaryLabel,
  primaryDisabled,
  onPrimary,
  backLabel,
  children,
}: {
  steps: { label: string }[];
  current: number;
  /** Paso más lejano ya visitado: hasta ahí se puede saltar (FR-015), aunque
   * el usuario haya retrocedido y `current` esté antes. */
  maxReached: number;
  onJump: (step: number) => void;
  onBack: () => void;
  primaryLabel: string;
  primaryDisabled: boolean;
  onPrimary: () => void;
  backLabel: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-6">
      <ol className="flex flex-col">
        {steps.map((step, idx) => {
          const stepNum = idx + 1;
          const status = stepNum < current ? "done" : stepNum === current ? "active" : "future";
          const isLastItem = idx === steps.length - 1;
          return (
            <li
              key={stepNum}
              className={`relative pl-8 ${isLastItem ? "" : "pb-8"} ${
                status === "future" ? "opacity-50" : ""
              }`}
            >
              {!isLastItem && (
                <span
                  aria-hidden
                  className="absolute left-[7px] top-6 bottom-0 w-px bg-outline-variant"
                />
              )}
              <span
                className={`absolute left-0 top-1 flex h-4 w-4 items-center justify-center rounded-full border-2 ${
                  status === "done"
                    ? "border-primary bg-primary"
                    : status === "active"
                      ? "border-primary bg-surface-container-lowest"
                      : "border-outline-variant bg-surface-container-lowest"
                }`}
              >
                {status === "done" && (
                  <span className="material-symbols-outlined text-[10px] font-bold text-on-primary">
                    check
                  </span>
                )}
              </span>
              <button
                type="button"
                onClick={() => stepNum <= maxReached && onJump(stepNum)}
                disabled={stepNum > maxReached}
                className="w-full text-left disabled:cursor-default"
              >
                <span className="mb-1 block font-label-caps text-label-caps text-on-surface-variant">
                  Step {stepNum}
                </span>
                <span
                  className={
                    status === "active"
                      ? "block font-body-lg text-body-lg font-semibold text-on-surface"
                      : "block font-body-md text-body-md text-on-surface"
                  }
                >
                  {step.label}
                </span>
              </button>
              {status === "active" && <div className="mt-4 space-y-6">{children}</div>}
            </li>
          );
        })}
      </ol>
      <div className="flex gap-4 border-t border-outline-variant pt-6">
        <button
          type="button"
          onClick={onBack}
          disabled={current === 1}
          className="flex flex-1 items-center justify-center gap-2 rounded border border-outline-variant bg-surface-container px-4 py-3 text-button font-button text-on-surface transition-colors hover:bg-surface-variant disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          {backLabel}
        </button>
        <button
          type="button"
          onClick={onPrimary}
          disabled={primaryDisabled}
          className="flex flex-1 items-center justify-center gap-2 rounded bg-primary px-4 py-3 text-button font-button text-on-primary transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {primaryLabel}
        </button>
      </div>
    </div>
  );
}
