"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n/t";
import { formatUsd } from "@/lib/catalogo/precio";
import {
  FormularioContacto,
  type ContactValue,
} from "../../../solicitud/_components/FormularioContacto";
import { BotonEnviar } from "../../../solicitud/_components/BotonEnviar";

/**
 * Pantalla de un producto fijo (009-modelos-producto-fijo, US2): fotos +
 * descripción + precio, y un pedido directo (cantidad + contacto), sin
 * configurador ni cotización — el precio ya es el que se ve acá.
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
  const [quantity, setQuantity] = useState(0);
  const [contact, setContact] = useState<ContactValue>({
    name: "",
    email: "",
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
          contact: { name: contact.name, email: contact.email, phone: contact.phone },
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
  const contactOk =
    contact.name && contact.email && contact.phone && contact.privacyAccepted;

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6 px-4 py-8">
      {photos.length > 0 && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {photos.map((p) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={p.view}
              src={p.url}
              alt={name}
              className="aspect-square rounded-lg border border-gray-200 object-cover"
            />
          ))}
        </div>
      )}

      <div>
        <h1 className="text-xl font-semibold">{name}</h1>
        {description && (
          // Descripción con formato del editor de texto enriquecido del
          // panel (009-modelos-producto-fijo); ya se saneó al guardarla.
          <div
            className="mt-1 text-gray-600 [&_h3]:mt-3 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-gray-900 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-2 [&_ul]:list-disc [&_ul]:pl-5"
            dangerouslySetInnerHTML={{ __html: description }}
          />
        )}
        {price && (
          <p className="mt-2 text-lg font-semibold">
            {labels.priceLabel}: {formatUsd(price)}
          </p>
        )}
      </div>

      <h2 className="text-lg font-semibold">{labels.orderTitle}</h2>

      <label className="flex flex-col gap-1">
        <span>{labels.quantity}</span>
        <input
          type="number"
          min={1}
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          className="rounded border border-gray-300 px-3 py-2"
        />
      </label>

      {quantityOk && (
        <FormularioContacto
          locale={locale}
          value={contact}
          onChange={(p) => setContact((c) => ({ ...c, ...p }))}
          labels={labels}
        />
      )}

      {quantityOk && (
        <BotonEnviar
          onSubmit={submit}
          disabled={!contactOk}
          submitting={submitting}
          error={submitError}
          labels={{
            submit: labels.submit,
            submitting: labels.submitting,
            retry: labels.retry,
          }}
        />
      )}
    </div>
  );
}
