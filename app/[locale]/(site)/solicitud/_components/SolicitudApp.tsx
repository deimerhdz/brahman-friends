"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import type { Locale } from "@/lib/i18n/t";
import type { ModelManifest } from "@/lib/catalogo/model-manifest";
import { loadDraft, clearDraft } from "@/lib/design/borrador";
import { enviarSolicitud } from "@/lib/solicitud/enviar";
import { Resumen } from "./Resumen";
import { FormularioContacto, type ContactValue } from "./FormularioContacto";
import { BotonEnviar } from "./BotonEnviar";

export function SolicitudApp({
  locale,
  labels,
}: {
  locale: Locale;
  labels: Record<string, string>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [manifest, setManifest] = useState<ModelManifest | null>(null);
  const [loadError, setLoadError] = useState(false);
  // Cantidad sugerida desde el paso de resumen del configurador
  // (006-configurador-stepper FR-021); si falta o no es válida, arranca en 0
  // como hoy.
  const [quantity, setQuantity] = useState(() => {
    const qty = Number.parseInt(searchParams.get("qty") ?? "", 10);
    return Number.isInteger(qty) && qty >= 1 ? qty : 0;
  });
  const [contact, setContact] = useState<ContactValue>({
    name: "",
    phone: "",
    comments: "",
    privacyAccepted: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const draftModelId = getDraftModelId();
  const draft = draftModelId ? loadDraft(draftModelId) : null;

  useEffect(() => {
    const modelId = getDraftModelId();
    if (!modelId) return;
    fetch(`/api/imagenes-modelo/${modelId}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setManifest)
      .catch(() => setLoadError(true));
  }, []);

  if (!draftModelId || !draft) {
    return (
      <div className="mx-auto max-w-md px-4 py-10 text-center">
        <p className="mb-4">{labels.noDesign}</p>
        <Link href={`/${locale}`} className="text-brand underline">
          {labels.backHome}
        </Link>
      </div>
    );
  }

  if (loadError) {
    return <p className="px-4 py-10 text-center text-red-600">{labels.loadError}</p>;
  }

  if (!manifest) {
    return <p className="px-4 py-10 text-center">{labels.loading}</p>;
  }

  async function submit() {
    if (!manifest || !draft) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const result = await enviarSolicitud({
        manifest,
        submissionId: draft.submissionId,
        colorId: draft.colorId,
        technique: draft.technique,
        decorations: draft.decorations,
        quantity,
        contact,
        locale,
      });
      if (!result.ok) {
        setSubmitError(labels[result.errorCode] ?? labels.genericError);
        return;
      }

      clearDraft();
      router.push(`/${locale}/solicitud/${result.code}?pending=${result.notificationPending}`);
    } catch (error) {
      console.error("enviarSolicitud falló:", error);
      setSubmitError(labels.networkError);
    } finally {
      setSubmitting(false);
    }
  }

  const quantityOk = Number.isInteger(quantity) && quantity >= 1;
  const contactOk = contact.name && contact.phone && contact.privacyAccepted;

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6 px-4 py-8">
      <h1 className="text-xl font-semibold">{labels.title}</h1>

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
        <Resumen
          locale={locale}
          manifest={manifest}
          colorId={draft.colorId}
          decorations={draft.decorations}
          technique={draft.technique}
          quantity={quantity}
          labels={labels}
        />
      )}

      {quantityOk && (
        <FormularioContacto locale={locale} value={contact} onChange={(p) => setContact((c) => ({ ...c, ...p }))} labels={labels} />
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

function getDraftModelId(): string | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem("bf.design.v1");
  if (!raw) return null;
  try {
    return JSON.parse(raw).modelId ?? null;
  } catch {
    return null;
  }
}
