"use client";

import type { Locale } from "@/lib/i18n/t";
import type { ModelManifest } from "@/lib/catalogo/model-manifest";
import type { Decoration } from "@/lib/design/borrador";
import { Resumen } from "../../../solicitud/_components/Resumen";
import {
  FormularioContacto,
  type ContactValue,
} from "../../../solicitud/_components/FormularioContacto";
import { BotonEnviar } from "../../../solicitud/_components/BotonEnviar";

/**
 * "Solicitar cotización" abre esto en vez de navegar a `/solicitud`
 * (010-lateral-real): mismo resumen + formulario de contacto que esa página,
 * pero sin salir del configurador — el diseño ya está en memoria acá, no
 * hace falta releerlo de localStorage ni volver a pedir el manifiesto.
 */
export function SolicitudModal({
  locale,
  manifest,
  colorId,
  decorations,
  technique,
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
  manifest: ModelManifest;
  colorId: string | null;
  decorations: Decoration[];
  technique: string | null;
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
  // `Resumen` espera `logo`/`decorations`/`text`/`technique`; el paso 3 del
  // configurador ya usa `logo`/`decoration` para lo mismo pero con otro
  // texto ("Logo" corto vs. "Logotipo"), así que se remapean acá en vez de
  // pisar esas claves en el objeto de labels de toda la página.
  const resumenLabels = {
    ...labels,
    decorations: labels.requestDecorations,
    logo: labels.requestLogo,
    text: labels.requestText,
    technique: labels.requestTechnique,
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={labels.requestQuote}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[90vh] w-full max-w-md flex-col gap-4 overflow-y-auto rounded-lg bg-white p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-lg font-semibold">{labels.requestQuote}</h2>
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

        <Resumen
          locale={locale}
          manifest={manifest}
          colorId={colorId}
          decorations={decorations}
          technique={technique}
          quantity={quantity}
          labels={resumenLabels}
        />

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
            submit: labels.submitRequest,
            submitting: labels.submittingRequest,
            retry: labels.retry,
          }}
        />
      </div>
    </div>
  );
}
