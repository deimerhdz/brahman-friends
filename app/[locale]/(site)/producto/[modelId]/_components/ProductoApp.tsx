"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n/t";
import { formatUsd } from "@/lib/catalogo/precio";
import { type ContactValue } from "../../../solicitud/_components/FormularioContacto";
import { GaleriaProducto } from "./GaleriaProducto";
import { ModalPedido } from "./ModalPedido";

/**
 * Pantalla de un producto fijo (009-modelos-producto-fijo, US2): galería a
 * la izquierda con desplazamiento entre fotos, y a la derecha detalles,
 * precio y cantidad. "Comprar ahora" abre el modal con los datos de
 * contacto — sin configurador ni cotización, el precio ya es el que se ve.
 */
export function ProductoApp({
  locale,
  modelId,
  name,
  description,
  price,
  photos,
  labels,
}: {
  locale: Locale;
  modelId: string;
  name: string;
  description: string;
  price: string | null;
  photos: { view: string; url: string }[];
  labels: Record<string, string>;
}) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [contact, setContact] = useState<ContactValue>({
    name: "",
    phone: "",
    comments: "",
    privacyAccepted: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function submit() {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const response = await fetch("/api/solicitudes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionId: crypto.randomUUID(),
          design: { kind: "fixed_product", modelId },
          quantity,
          contact: { name: contact.name, phone: contact.phone },
          comments: contact.comments || undefined,
          privacyAccepted: contact.privacyAccepted,
          viewImages: [],
          locale,
        }),
      });

      const body = await response.json();
      if (!response.ok) {
        setSubmitError(labels[body.error] ?? labels.genericError);
        return;
      }

      router.push(`/${locale}/solicitud/${body.code}?pending=${body.notificationPending}`);
    } catch {
      setSubmitError(labels.networkError);
    } finally {
      setSubmitting(false);
    }
  }

  const quantityOk = Number.isInteger(quantity) && quantity >= 1;
  const contactOk = contact.name && contact.phone && contact.privacyAccepted;

  return (
    <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 px-4 py-8 md:grid-cols-2">
      <div>
        <GaleriaProducto photos={photos} alt={name} />
      </div>

      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-semibold">{name}</h1>

        {price && (
          <p className="text-2xl font-semibold">
            {labels.priceLabel}: {formatUsd(price)}
          </p>
        )}

        <label className="flex flex-col gap-1">
          <span>{labels.quantity}</span>
          <div className="flex w-fit items-center rounded border border-gray-300">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              aria-label="-"
              className="px-3 py-2 text-lg leading-none hover:bg-gray-50"
            >
              −
            </button>
            <input
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-16 border-x border-gray-300 px-2 py-2 text-center"
            />
            <button
              type="button"
              onClick={() => setQuantity((q) => q + 1)}
              aria-label="+"
              className="px-3 py-2 text-lg leading-none hover:bg-gray-50"
            >
              +
            </button>
          </div>
        </label>

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          disabled={!quantityOk}
          className="w-full rounded bg-brand px-4 py-3 font-semibold text-white disabled:opacity-50"
        >
          {labels.buyNow}
        </button>

        {description && (
          // Descripción con formato del editor de texto enriquecido del
          // panel (009-modelos-producto-fijo); ya se saneó al guardarla.
          <div
            className="text-gray-600 [&_h3]:mt-3 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-gray-900 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-2 [&_ul]:list-disc [&_ul]:pl-5"
            dangerouslySetInnerHTML={{ __html: description }}
          />
        )}
      </div>

      {modalOpen && (
        <ModalPedido
          locale={locale}
          quantity={quantity}
          contact={contact}
          onChangeContact={(p) => setContact((c) => ({ ...c, ...p }))}
          onClose={() => setModalOpen(false)}
          onSubmit={submit}
          submitting={submitting}
          submitError={submitError}
          disabled={!contactOk}
          labels={labels}
        />
      )}
    </div>
  );
}
