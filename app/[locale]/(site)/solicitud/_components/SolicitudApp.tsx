"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import type { Locale } from "@/lib/i18n/t";
import type { ModelManifest } from "@/lib/catalogo/model-manifest";
import { loadDraft, clearDraft } from "@/lib/design/borrador";
import type { SizeQuantity } from "@/lib/solicitud/tallas";
import { sizesMatchQuantity } from "@/lib/solicitud/tallas";
import { subirVistas } from "../_lib/subir-vistas";
import { CantidadTallas } from "./CantidadTallas";
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
  const [sizes, setSizes] = useState<SizeQuantity[]>([]);
  const [contact, setContact] = useState<ContactValue>({
    name: "",
    email: "",
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

  const modelSizeLabels = manifest.sizes.map((s) => s.label);

  function onSizeChange(label: string, qty: number) {
    setSizes((prev) => {
      const next = prev.filter((s) => s.label !== label);
      if (qty > 0) next.push({ label, quantity: qty });
      return next;
    });
  }

  async function submit() {
    if (!manifest || !draft) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const viewImages = await subirVistas(manifest, draft.colors, draft.decorations);
      const response = await fetch("/api/solicitudes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionId: draft.submissionId,
          design: {
            modelId: manifest.model.id,
            colors: draft.colors,
            technique: draft.technique,
            decorations: draft.decorations,
          },
          quantity,
          sizes,
          contact: { name: contact.name, email: contact.email, phone: contact.phone },
          comments: contact.comments || undefined,
          privacyAccepted: contact.privacyAccepted,
          viewImages,
          locale,
        }),
      });

      const body = await response.json();
      if (!response.ok) {
        setSubmitError(labels[body.error] ?? labels.genericError);
        return;
      }

      clearDraft();
      router.push(`/${locale}/solicitud/${body.code}?pending=${body.notificationPending}`);
    } catch {
      setSubmitError(labels.networkError);
    } finally {
      setSubmitting(false);
    }
  }

  const sizesOk = sizesMatchQuantity(sizes, quantity);
  const contactOk =
    contact.name && contact.email && contact.phone && contact.privacyAccepted;

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6 px-4 py-8">
      <h1 className="text-xl font-semibold">{labels.title}</h1>

      <CantidadTallas
        modelSizes={modelSizeLabels}
        quantity={quantity}
        sizes={sizes}
        onQuantityChange={setQuantity}
        onSizeChange={onSizeChange}
        labels={labels}
      />

      {sizesOk && (
        <Resumen
          locale={locale}
          manifest={manifest}
          colors={draft.colors}
          decorations={draft.decorations}
          technique={draft.technique}
          quantity={quantity}
          sizes={sizes}
          labels={labels}
        />
      )}

      {sizesOk && (
        <FormularioContacto locale={locale} value={contact} onChange={(p) => setContact((c) => ({ ...c, ...p }))} labels={labels} />
      )}

      {sizesOk && (
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
