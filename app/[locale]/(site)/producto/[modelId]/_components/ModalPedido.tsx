"use client";

import type { Locale } from "@/lib/i18n/t";
import {
  FormularioContacto,
  type ContactValue,
} from "../../../solicitud/_components/FormularioContacto";
import { BotonEnviar } from "../../../solicitud/_components/BotonEnviar";

/**
 * Modal de datos personales que dispara "Comprar ahora": mismo formulario de
 * contacto que usa la cotización (009-modelos-producto-fijo, FR-050,
 * FR-051), pero solo aparece cuando el comprador ya decidió la cantidad.
 */
export function ModalPedido({
  locale,
  quantity,
  contact,
  onChangeContact,
  onClose,
  onSubmit,
  submitting,
  submitError,
  disabled,
  labels,
}: {
  locale: Locale;
  quantity: number;
  contact: ContactValue;
  onChangeContact: (patch: Partial<ContactValue>) => void;
  onClose: () => void;
  onSubmit: () => void;
  submitting: boolean;
  submitError: string | null;
  disabled: boolean;
  labels: Record<string, string>;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={labels.orderTitle}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[90vh] w-full max-w-md flex-col gap-4 overflow-y-auto rounded-lg bg-white p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-lg font-semibold">{labels.orderTitle}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={labels.close}
            className="text-gray-500 hover:text-gray-800"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <p className="text-sm text-gray-600">
          {labels.quantity}: {quantity}
        </p>

        <FormularioContacto
          locale={locale}
          value={contact}
          onChange={onChangeContact}
          labels={labels}
        />

        <BotonEnviar
          onSubmit={onSubmit}
          disabled={disabled}
          submitting={submitting}
          error={submitError}
          labels={{
            submit: labels.submit,
            submitting: labels.submitting,
            retry: labels.retry,
          }}
        />
      </div>
    </div>
  );
}
