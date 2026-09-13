"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { SubidaArchivo } from "@/app/[locale]/panel/_components/SubidaArchivo";
import { SeccionAjustes } from "./SeccionAjustes";

export interface AjustesFormValue {
  siteName: { es: string; en: string };
  contactEmail: string;
  contactPhone: string;
  logoUrl: string | null;
  bannerUrl: string | null;
  seoTitle: { es: string; en: string };
  seoDescription: { es: string; en: string };
  seoImageUrl: string | null;
}

const IMAGE_ACCEPT = ["image/png", "image/jpeg", "image/svg+xml", "image/webp"];
const TITLE_MAX = 60;
const DESCRIPTION_MAX = 160;

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">
        {label}
      </span>
      {children}
      {hint && (
        <span className="font-body-md text-[11px] text-on-surface-variant">{hint}</span>
      )}
    </label>
  );
}

function UploadBox({
  title,
  recommendation,
  emptyText,
  formatsText,
  currentUrl,
  pathPrefix,
  maxImageBytes,
  uploadLabels,
  removeLabel,
  onUploaded,
  onRemove,
}: {
  title: string;
  recommendation: string;
  emptyText: string;
  formatsText: string;
  currentUrl: string | null;
  pathPrefix: string;
  maxImageBytes: number;
  uploadLabels: {
    select: string;
    upload: string;
    uploading: string;
    success: string;
    error: string;
    retry: string;
  };
  removeLabel: string;
  onUploaded: (url: string) => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">
        {title}
      </span>
      <span className="font-body-md text-[11px] text-on-surface-variant">{recommendation}</span>
      <div className="flex flex-col items-center gap-3 rounded-lg border-2 border-dashed border-outline-variant bg-surface p-6 text-center">
        {!currentUrl && (
          <>
            <span className="material-symbols-outlined text-[32px] text-on-surface-variant">
              image
            </span>
            <p className="font-body-md text-body-md text-on-surface-variant">{emptyText}</p>
          </>
        )}
        <SubidaArchivo
          presignEndpoint="/api/panel/subidas/presignar"
          pathPrefix={pathPrefix}
          accept={IMAGE_ACCEPT}
          maxSizeBytes={maxImageBytes}
          currentUrl={currentUrl ?? undefined}
          onUploaded={(url) => onUploaded(url)}
          labels={uploadLabels}
        />
        <p className="font-body-md text-[11px] text-on-surface-variant">{formatsText}</p>
      </div>
      {currentUrl && (
        <button
          type="button"
          onClick={onRemove}
          className="w-fit font-label-caps text-label-caps text-on-surface-variant underline hover:text-error"
        >
          {removeLabel}
        </button>
      )}
    </div>
  );
}

/**
 * Formulario de Ajustes (010-panel-ajustes-generales): información básica,
 * logo/banner y SEO en un único envío (FR-002 a FR-011). Las redes sociales
 * (FR-012 a FR-014) se guardan aparte, fila por fila (`RedesSociales.tsx`),
 * por eso no viven en este formulario.
 */
export function AjustesForm({
  initial,
  maxImageBytes,
  labels,
}: {
  initial: AjustesFormValue;
  maxImageBytes: number;
  labels: Record<string, string>;
}) {
  const [siteNameEs, setSiteNameEs] = useState(initial.siteName.es);
  const [siteNameEn, setSiteNameEn] = useState(initial.siteName.en);
  const [contactEmail, setContactEmail] = useState(initial.contactEmail);
  const [contactPhone, setContactPhone] = useState(initial.contactPhone);
  const [logoUrl, setLogoUrl] = useState<string | null>(initial.logoUrl);
  const [bannerUrl, setBannerUrl] = useState<string | null>(initial.bannerUrl);
  const [seoTitleEs, setSeoTitleEs] = useState(initial.seoTitle.es);
  const [seoTitleEn, setSeoTitleEn] = useState(initial.seoTitle.en);
  const [seoDescriptionEs, setSeoDescriptionEs] = useState(initial.seoDescription.es);
  const [seoDescriptionEn, setSeoDescriptionEn] = useState(initial.seoDescription.en);
  const [seoImageUrl, setSeoImageUrl] = useState<string | null>(initial.seoImageUrl);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const nameMissing = siteNameEs.trim() === "" || siteNameEn.trim() === "";

  function onDiscard() {
    setSiteNameEs(initial.siteName.es);
    setSiteNameEn(initial.siteName.en);
    setContactEmail(initial.contactEmail);
    setContactPhone(initial.contactPhone);
    setLogoUrl(initial.logoUrl);
    setBannerUrl(initial.bannerUrl);
    setSeoTitleEs(initial.seoTitle.es);
    setSeoTitleEn(initial.seoTitle.en);
    setSeoDescriptionEs(initial.seoDescription.es);
    setSeoDescriptionEn(initial.seoDescription.en);
    setSeoImageUrl(initial.seoImageUrl);
    setStatus("idle");
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (nameMissing) {
      setStatus("error");
      return;
    }
    setSaving(true);
    setStatus("idle");
    const response = await fetch("/api/panel/ajustes", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        siteName: { es: siteNameEs, en: siteNameEn },
        contactEmail: contactEmail.trim() === "" ? null : contactEmail,
        contactPhone: contactPhone.trim() === "" ? null : contactPhone,
        logoUrl,
        bannerUrl,
        seo: {
          title: {
            es: seoTitleEs.trim() === "" ? null : seoTitleEs,
            en: seoTitleEn.trim() === "" ? null : seoTitleEn,
          },
          description: {
            es: seoDescriptionEs.trim() === "" ? null : seoDescriptionEs,
            en: seoDescriptionEn.trim() === "" ? null : seoDescriptionEn,
          },
          imageUrl: seoImageUrl,
        },
      }),
    });
    setSaving(false);
    setStatus(response.ok ? "success" : "error");
  }

  const uploadLabels = {
    select: labels.uploadSelect,
    upload: labels.uploadButton,
    uploading: labels.uploading,
    success: labels.uploadSuccess,
    error: labels.uploadError,
    retry: labels.retry,
  };

  const inputClass =
    "rounded border border-outline-variant px-3 py-2 font-body-md text-body-md text-on-surface";

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <p className="font-label-caps text-label-caps uppercase tracking-wide text-on-surface-variant">
          {labels.topBarEyebrow}
        </p>
        <button
          type="submit"
          form="ajustes-form"
          disabled={saving}
          className="rounded bg-on-surface px-6 py-2 font-button text-button text-on-primary transition-colors duration-200 hover:bg-primary disabled:opacity-50"
        >
          {labels.save}
        </button>
      </div>

      <form id="ajustes-form" onSubmit={onSubmit} className="flex flex-col gap-6">
        <SeccionAjustes title={labels.sectionTitle} subtitle={labels.sectionSubtitle}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label={labels.siteNameEs} hint={labels.siteNameEsHint}>
              <input
                value={siteNameEs}
                onChange={(e) => setSiteNameEs(e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label={labels.siteNameEn} hint={labels.siteNameEnHint}>
              <input
                value={siteNameEn}
                onChange={(e) => setSiteNameEn(e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label={labels.contactEmail} hint={labels.contactEmailHint}>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label={labels.contactPhone} hint={labels.contactPhoneHint}>
              <input
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className={inputClass}
              />
            </Field>
          </div>

          <div className="rounded-lg border border-outline-variant/60 bg-surface p-4">
            <p className="font-body-md text-body-md font-bold text-on-surface">
              {labels.multilingualTitle}
            </p>
            <p className="mt-1 font-body-md text-body-md text-on-surface-variant">
              {labels.multilingualHint}
            </p>
          </div>
        </SeccionAjustes>

        <SeccionAjustes title={labels.mediaSectionTitle} subtitle={labels.mediaSectionSubtitle}>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <UploadBox
              title={labels.logoSectionTitle}
              recommendation={labels.logoRecommendation}
              emptyText={labels.logoEmpty}
              formatsText={labels.logoFormats}
              currentUrl={logoUrl}
              pathPrefix="ajustes/logo"
              maxImageBytes={maxImageBytes}
              uploadLabels={uploadLabels}
              removeLabel={labels.logoRemove}
              onUploaded={setLogoUrl}
              onRemove={() => setLogoUrl(null)}
            />
            <UploadBox
              title={labels.bannerSectionTitle}
              recommendation={labels.bannerRecommendation}
              emptyText={labels.bannerEmpty}
              formatsText={labels.bannerFormats}
              currentUrl={bannerUrl}
              pathPrefix="ajustes/banner"
              maxImageBytes={maxImageBytes}
              uploadLabels={uploadLabels}
              removeLabel={labels.bannerRemove}
              onUploaded={setBannerUrl}
              onRemove={() => setBannerUrl(null)}
            />
          </div>
        </SeccionAjustes>

        <SeccionAjustes title={labels.seoSectionTitle} subtitle={labels.seoSectionSubtitle}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field
              label={labels.seoTitleEs}
              hint={labels.titleCounter.replace("{{count}}", String(seoTitleEs.length))}
            >
              <input
                value={seoTitleEs}
                maxLength={TITLE_MAX}
                onChange={(e) => setSeoTitleEs(e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field
              label={labels.seoTitleEn}
              hint={labels.titleCounter.replace("{{count}}", String(seoTitleEn.length))}
            >
              <input
                value={seoTitleEn}
                maxLength={TITLE_MAX}
                onChange={(e) => setSeoTitleEn(e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field
              label={labels.seoDescriptionEs}
              hint={labels.descriptionCounter.replace(
                "{{count}}",
                String(seoDescriptionEs.length),
              )}
            >
              <textarea
                value={seoDescriptionEs}
                maxLength={DESCRIPTION_MAX}
                onChange={(e) => setSeoDescriptionEs(e.target.value)}
                rows={3}
                className={inputClass}
              />
            </Field>
            <Field
              label={labels.seoDescriptionEn}
              hint={labels.descriptionCounter.replace(
                "{{count}}",
                String(seoDescriptionEn.length),
              )}
            >
              <textarea
                value={seoDescriptionEn}
                maxLength={DESCRIPTION_MAX}
                onChange={(e) => setSeoDescriptionEn(e.target.value)}
                rows={3}
                className={inputClass}
              />
            </Field>
          </div>

          <div className="flex flex-col gap-3">
            <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">
              {labels.seoImageSectionTitle}
            </span>
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="flex w-full max-w-xs items-center gap-3 overflow-hidden rounded-lg border border-outline-variant bg-surface p-3 md:max-w-sm">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded bg-surface-container">
                  {seoImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={seoImageUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="material-symbols-outlined text-on-surface-variant">
                      image
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-body-md text-body-md font-bold text-on-surface">
                    {seoTitleEs || siteNameEs}
                  </p>
                  <p className="line-clamp-2 font-body-md text-[11px] text-on-surface-variant">
                    {seoDescriptionEs || labels.seoPreviewPlaceholder}
                  </p>
                  <p className="mt-0.5 font-body-md text-[10px] uppercase text-on-surface-variant">
                    {labels.seoPreviewDomain}
                  </p>
                </div>
              </div>
              <div className="flex flex-1 flex-col gap-2">
                <SubidaArchivo
                  presignEndpoint="/api/panel/subidas/presignar"
                  pathPrefix="ajustes/seo"
                  accept={IMAGE_ACCEPT}
                  maxSizeBytes={maxImageBytes}
                  currentUrl={seoImageUrl ?? undefined}
                  onUploaded={(url) => setSeoImageUrl(url)}
                  labels={uploadLabels}
                />
                <p className="font-body-md text-[11px] text-on-surface-variant">
                  {labels.seoImageRecommendation}
                </p>
                {seoImageUrl && (
                  <button
                    type="button"
                    onClick={() => setSeoImageUrl(null)}
                    className="w-fit font-label-caps text-label-caps text-on-surface-variant underline hover:text-error"
                  >
                    {labels.seoImageRemove}
                  </button>
                )}
              </div>
            </div>
          </div>
        </SeccionAjustes>

        {status === "error" && (
          <p className="font-body-md text-body-md text-error">
            {nameMissing ? labels.nameRequired : labels.error}
          </p>
        )}
        {status === "success" && (
          <p role="status" className="font-body-md text-body-md text-primary">
            {labels.success}
          </p>
        )}
      </form>

      <div className="sticky bottom-4 mt-6 flex flex-col items-start justify-between gap-3 rounded-xl bg-on-surface p-4 text-on-primary ambient-shadow md:flex-row md:items-center">
        <div>
          <p className="font-body-md text-body-md font-bold">{labels.stickyTitle}</p>
          <p className="font-body-md text-[12px] opacity-80">{labels.stickySubtitle}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onDiscard}
            className="rounded border border-on-primary/40 px-5 py-2 font-button text-button text-on-primary transition-colors hover:bg-on-primary/10"
          >
            {labels.discard}
          </button>
          <button
            type="submit"
            form="ajustes-form"
            disabled={saving}
            className="rounded bg-primary px-5 py-2 font-button text-button text-on-primary transition-colors hover:opacity-90 disabled:opacity-50"
          >
            {labels.save}
          </button>
        </div>
      </div>
    </>
  );
}
