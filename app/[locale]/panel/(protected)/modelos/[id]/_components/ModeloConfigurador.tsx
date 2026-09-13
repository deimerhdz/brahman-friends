"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n/t";
import type { ValorTraducido } from "@/app/[locale]/panel/_components/CampoTraducible";
import { EncabezadoModelo, type EncabezadoValue } from "./EncabezadoModelo";
import { PasoVistas } from "./PasoVistas";
import { PasoColores } from "./PasoColores";
import {
  PasoPersonalizacion,
  type Position,
  type ZonaValue,
} from "./PasoPersonalizacion";
import { ZonaOverlay, type BoxPx } from "./ZonaOverlay";
import { ZonaWarpPreview } from "./ZonaWarpPreview";

// Las fotos del modelo (front/left/right/back) y las zonas decorables usan
// el mismo catálogo de 4 posiciones: cada lado tiene su propia foto real,
// así que `View` es literalmente `Position` (antes "side" era una única
// foto compartida por las zonas "left"/"right", antes de 010-lateral-real).
type View = Position;

interface ColorRow {
  id: string;
  nameEs: string;
  nameEn: string;
}

interface ViewRow {
  baseImageUrl: string | null;
  active: boolean;
}

function defaultZona(position: Position, defaultChars: number): ZonaValue {
  return {
    position,
    maxWidthCm: position === "front" ? 11 : 8,
    maxHeightCm: position === "front" ? 5.5 : 5,
    boxX: 50,
    boxY: 50,
    boxW: 150,
    boxH: 80,
    arc: 0,
    tilt: 0,
    taper: 0,
    maxTextChars: defaultChars,
  };
}

export function ModeloConfigurador({
  locale,
  modelId,
  code,
  status,
  type,
  nameEs,
  nameEn,
  descriptionEs,
  descriptionEn,
  price,
  imageWidth,
  imageHeight,
  views,
  viewRows,
  colors,
  defaultColorId,
  activeViews,
  colorImages,
  zonesByPosition,
  defaultZoneChars,
  techniques,
  enabledTechniqueIds,
  labels,
}: {
  locale: Locale;
  modelId: string;
  code: string;
  status: "draft" | "published";
  type: "configurable" | "fixed_product";
  nameEs: string;
  nameEn: string;
  descriptionEs: string;
  descriptionEn: string;
  price: string | null;
  imageWidth: number | null;
  imageHeight: number | null;
  views: Partial<Record<View, string>>;
  viewRows: Record<View, ViewRow>;
  colors: ColorRow[];
  defaultColorId: string | null;
  activeViews: View[];
  colorImages: Record<string, Partial<Record<View, string>>>;
  zonesByPosition: Partial<Record<Position, ZonaValue>>;
  defaultZoneChars: number;
  techniques: { id: string; nameEs: string; nameEn: string }[];
  enabledTechniqueIds: string[];
  labels: Record<string, string>;
}) {
  const router = useRouter();
  // Un "Producto fijo" (009-modelos-producto-fijo) no tiene pasos de
  // colores ni personalización: arranca (y se queda) en el paso de vistas.
  const [step, setStep] = useState<1 | 2 | 3>(type === "fixed_product" ? 1 : 2);
  // Posición activa: front/left/right/back. Es a la vez la foto que se
  // muestra en el canvas y la zona decorable que se edita en el paso 3 — ya
  // no hace falta distinguir "vista de la foto" de "posición de la zona"
  // porque cada lado tiene su propia foto real.
  const [position, setPosition] = useState<Position>("front");
  const [zones, setZones] = useState(zonesByPosition);
  const [savingZone, setSavingZone] = useState(false);
  const [previewColor, setPreviewColor] = useState<"#ffffff" | "#111827">(
    "#111827",
  );
  const [previewColorId, setPreviewColorId] = useState<string | null>(
    defaultColorId,
  );
  const [enabledTechniques, setEnabledTechniques] =
    useState(enabledTechniqueIds);

  const [header, setHeader] = useState<EncabezadoValue>({
    name: { es: nameEs, en: nameEn } as ValorTraducido,
    description: { es: descriptionEs, en: descriptionEn } as ValorTraducido,
    price: price ?? "",
  });
  const [savingHeader, setSavingHeader] = useState(false);
  const [toast, setToast] = useState(false);

  const zoneValue = zones[position] ?? defaultZona(position, defaultZoneChars);
  const effectiveImageWidth = imageWidth ?? 1000;
  const effectiveImageHeight = imageHeight ?? 1000;
  // El canvas muestra la foto real del color seleccionado en el paso 2
  // (frontal/izquierdo/derecho/trasera); si ese color aún no tiene foto para
  // esa posición, se cae a la imagen base genérica del modelo.
  const previewImage =
    (previewColorId && colorImages[previewColorId]?.[position]) ||
    views[position];

  const zoneLabel = labels[`zone_${position}`];

  function updateZone(patch: Partial<ZonaValue>) {
    setZones((z) => {
      const current = z[position] ?? defaultZona(position, defaultZoneChars);
      const next: ZonaValue = { ...current, ...patch };

      // Los sliders de ancho/alto máximo (cm) no tienen una escala px↔cm
      // calibrada, pero el admin necesita ver algún efecto al moverlos: se
      // redimensiona la caja de la zona en la misma proporción, manteniendo
      // su centro fijo, para dar retroalimentación visual inmediata.
      if (patch.maxWidthCm !== undefined && current.maxWidthCm > 0) {
        const scale = patch.maxWidthCm / current.maxWidthCm;
        const boxW = Math.min(
          effectiveImageWidth,
          Math.max(20, Math.round(current.boxW * scale)),
        );
        const centerX = current.boxX + current.boxW / 2;
        next.boxW = boxW;
        next.boxX = Math.min(
          Math.max(0, Math.round(centerX - boxW / 2)),
          effectiveImageWidth - boxW,
        );
      }
      if (patch.maxHeightCm !== undefined && current.maxHeightCm > 0) {
        const scale = patch.maxHeightCm / current.maxHeightCm;
        const boxH = Math.min(
          effectiveImageHeight,
          Math.max(20, Math.round(current.boxH * scale)),
        );
        const centerY = current.boxY + current.boxH / 2;
        next.boxH = boxH;
        next.boxY = Math.min(
          Math.max(0, Math.round(centerY - boxH / 2)),
          effectiveImageHeight - boxH,
        );
      }

      return { ...z, [position]: next };
    });
  }

  function updateBox(box: BoxPx) {
    updateZone({ boxX: box.x, boxY: box.y, boxW: box.w, boxH: box.h });
  }

  async function commitZone(next?: ZonaValue) {
    const toSave = next ?? zoneValue;
    setSavingZone(true);
    await fetch(`/api/panel/modelos/${modelId}/zonas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(toSave),
    });
    setSavingZone(false);
    router.refresh();
  }

  async function toggleTechnique(techniqueId: string, enable: boolean) {
    setEnabledTechniques((ids) =>
      enable ? [...ids, techniqueId] : ids.filter((id) => id !== techniqueId),
    );
    const url = `/api/panel/modelos/${modelId}/tecnicas${enable ? "" : `?techniqueId=${techniqueId}`}`;
    await fetch(url, {
      method: enable ? "POST" : "DELETE",
      headers: enable ? { "Content-Type": "application/json" } : undefined,
      body: enable ? JSON.stringify({ techniqueId }) : undefined,
    });
    router.refresh();
  }

  async function saveHeader() {
    setSavingHeader(true);
    const response = await fetch(`/api/panel/modelos/${modelId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: header.name,
        description: header.description,
        price: header.price.trim() === "" ? null : Number(header.price),
      }),
    });
    setSavingHeader(false);
    if (response.ok) {
      setToast(true);
      setTimeout(() => setToast(false), 2500);
      router.refresh();
    }
  }

  function openPreview() {
    window.open(`/${locale}/configurador/${modelId}`, "_blank");
  }

  const stepTabs: { step: 1 | 2 | 3; label: string }[] =
    type === "fixed_product"
      ? [{ step: 1, label: labels.tabViews }]
      : [
          { step: 1, label: labels.tabViews },
          { step: 2, label: labels.tabColors },
          { step: 3, label: labels.tabPersonalization },
        ];

  return (
    <div className="flex flex-col rounded-xl border border-outline-variant/60 bg-surface-container-lowest ambient-shadow lg:flex-row lg:items-start">
      {/* Canvas / preview — se queda fijo (sticky) mientras el wizard de la derecha
          scrollea, así no depende de un cálculo de alto de viewport ni se estira
          para igualar la altura del wizard cuando este tiene mucho contenido. */}
      <section className="relative flex h-[360px] flex-col overflow-hidden rounded-t-xl border-b border-outline-variant/60 bg-surface-container-low sm:h-[440px] lg:sticky lg:top-4 lg:h-[min(calc(100vh-2rem),640px)] lg:w-[40%] lg:rounded-l-xl lg:rounded-tr-none lg:border-b-0 lg:border-r">
        {type === "configurable" && (
          <div className="flex h-12 shrink-0 items-center justify-end gap-3 border-b border-outline-variant/40 bg-surface-container-lowest/60 px-4">
            <div className="flex items-center gap-1.5 rounded-lg border border-outline-variant/60 bg-surface-container-lowest px-2 py-1 shadow-xs">
              <span className="text-[10px] text-on-surface-variant">
                {labels.previewColorLabel}
              </span>
              <button
                type="button"
                onClick={() => setPreviewColor("#111827")}
                title={labels.previewColorBlack}
                aria-label={labels.previewColorBlack}
                aria-pressed={previewColor === "#111827"}
                className={`h-4 w-4 rounded-full border border-outline-variant/60 bg-[#111827] transition-shadow ${
                  previewColor === "#111827"
                    ? "ring-2 ring-primary ring-offset-1 ring-offset-surface-container-lowest"
                    : ""
                }`}
              />
              <button
                type="button"
                onClick={() => setPreviewColor("#ffffff")}
                title={labels.previewColorWhite}
                aria-label={labels.previewColorWhite}
                aria-pressed={previewColor === "#ffffff"}
                className={`h-4 w-4 rounded-full border border-outline-variant/60 bg-white transition-shadow ${
                  previewColor === "#ffffff"
                    ? "ring-2 ring-primary ring-offset-1 ring-offset-surface-container-lowest"
                    : ""
                }`}
              />
            </div>
            <div className="flex items-center gap-1 rounded-lg border border-outline-variant/60 bg-surface-container-lowest px-2.5 py-1 text-xs text-on-surface-variant shadow-xs">
              <span className="material-symbols-outlined text-base text-primary">
                drag_pan
              </span>
            </div>
          </div>
        )}

        <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden p-6 [background-image:radial-gradient(var(--color-outline-variant)_1px,transparent_1px)] [background-size:20px_20px] sm:p-8">
          {/* La proporción tiene que coincidir con la de la imagen real
              (`effectiveImageWidth/effectiveImageHeight`), no ser siempre
              cuadrada: si la foto no es cuadrada, un contenedor 1:1 la deja
              con barras y las cajas de zona (calculadas como % de
              imageWidth/imageHeight) quedan desalineadas frente a como se
              ven en el configurador de cliente (`ConfiguradorApp.tsx`), que
              sí usa esta misma proporción. */}
          <div
            className="relative flex h-full max-h-full max-w-full items-center justify-center"
            style={{ aspectRatio: effectiveImageWidth / effectiveImageHeight }}
          >
            {previewImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewImage}
                alt=""
                className="pointer-events-none h-full w-full object-contain drop-shadow-md"
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-outline-variant text-on-surface-variant">
                <span className="material-symbols-outlined text-3xl">
                  image
                </span>
                <span className="font-label-caps text-label-caps">
                  {labels.noImage}
                </span>
              </div>
            )}

            {type === "configurable" && (
              <>
                <ZonaWarpPreview
                  box={{
                    x: zoneValue.boxX,
                    y: zoneValue.boxY,
                    w: zoneValue.boxW,
                    h: zoneValue.boxH,
                  }}
                  imageWidth={effectiveImageWidth}
                  imageHeight={effectiveImageHeight}
                  params={{
                    arc: zoneValue.arc,
                    tilt: zoneValue.tilt,
                    taper: zoneValue.taper,
                  }}
                  placeholderText={labels.previewLogo}
                  color={previewColor}
                />

                <ZonaOverlay
                  box={{
                    x: zoneValue.boxX,
                    y: zoneValue.boxY,
                    w: zoneValue.boxW,
                    h: zoneValue.boxH,
                  }}
                  imageWidth={effectiveImageWidth}
                  imageHeight={effectiveImageHeight}
                  editable={step === 3}
                  label={zoneLabel}
                  onChange={updateBox}
                  onCommit={() => commitZone()}
                />
              </>
            )}
          </div>
        </div>

        <div className="flex h-16 shrink-0 items-center justify-center pb-3">
          <div className="flex items-center gap-1.5 rounded-full border border-outline-variant/60 bg-surface-container-lowest p-1.5 shadow-md">
            {(
              [
                { position: "front", icon: "view_in_ar", label: labels.zone_front },
                {
                  position: "left",
                  icon: "rotate_90_degrees_ccw",
                  label: labels.zone_left,
                },
                {
                  position: "right",
                  icon: "rotate_90_degrees_cw",
                  label: labels.zone_right,
                },
                {
                  position: "back",
                  icon: "flip_camera_android",
                  label: labels.zone_back,
                },
              ] as const
            ).map((p) => (
              <button
                key={p.position}
                type="button"
                onClick={() => setPosition(p.position)}
                className={
                  position === p.position
                    ? "flex items-center gap-2 rounded-full bg-on-surface px-5 py-2 text-xs font-semibold text-on-primary shadow-sm"
                    : "flex items-center gap-2 rounded-full px-5 py-2 text-xs font-semibold text-on-surface-variant transition-all hover:bg-surface-container-low hover:text-on-surface"
                }
              >
                <span className="material-symbols-outlined text-sm">
                  {p.icon}
                </span>
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Wizard — en desktop queda fijo (sticky) igual que el canvas y con el
          mismo alto máximo, así ninguno se estira de más: el contenido del
          paso activo scrollea adentro y la pantalla en sí no necesita
          scroll. En mobile fluye normal (sin sticky ni recorte de alto). */}
      <aside className="flex flex-col overflow-hidden rounded-b-xl lg:sticky lg:top-4  lg:w-[60%] lg:rounded-bl-none lg:rounded-r-xl">
        <div className="shrink-0 border-b border-outline-variant/60 p-5">
          <EncabezadoModelo
            locale={locale}
            modelId={modelId}
            code={code}
            status={status}
            type={type}
            value={header}
            onChange={setHeader}
            labels={labels}
          />

          <div
            className="mt-4 grid gap-1 rounded-xl bg-surface-container-low p-1"
            style={{
              gridTemplateColumns: `repeat(${stepTabs.length}, minmax(0, 1fr))`,
            }}
          >
            {stepTabs.map((tab) => (
              <button
                key={tab.step}
                type="button"
                onClick={() => setStep(tab.step)}
                className={
                  step === tab.step
                    ? "rounded-lg bg-surface-container-lowest px-1 py-2 text-center text-xs font-semibold text-on-surface shadow-sm"
                    : "rounded-lg px-1 py-2 text-center text-xs font-semibold text-on-surface-variant transition-all hover:text-on-surface"
                }
              >
                <span className="flex items-center justify-center gap-1.5">
                  <span
                    className={
                      step === tab.step
                        ? "flex h-4 w-4 items-center justify-center rounded-full bg-on-surface text-[10px] font-bold text-on-primary"
                        : "flex h-4 w-4 items-center justify-center rounded-full bg-surface-container-high text-[10px] font-bold text-on-surface-variant"
                    }
                  >
                    {tab.step}
                  </span>
                  {tab.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-5 lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
          {step === 1 && (
            <PasoVistas modelId={modelId} initial={viewRows} labels={labels} />
          )}
          {step === 2 && (
            <PasoColores
              locale={locale}
              modelId={modelId}
              colors={colors}
              defaultColorId={defaultColorId}
              activeViews={activeViews}
              colorImages={colorImages}
              labels={labels}
              previewColorId={previewColorId}
              onPreviewColor={setPreviewColorId}
            />
          )}
          {step === 3 && (
            <PasoPersonalizacion
              locale={locale}
              position={position}
              value={zoneValue}
              onChange={updateZone}
              onCommit={() => commitZone()}
              saving={savingZone}
              techniques={techniques}
              enabledTechniqueIds={enabledTechniques}
              onToggleTechnique={toggleTechnique}
              labels={labels}
            />
          )}
        </div>

        <div className="shrink-0 space-y-2.5 border-t border-outline-variant/60 p-4">
          <div className="flex items-center gap-2">
            {type === "configurable" && (
              <button
                type="button"
                onClick={openPreview}
                className="flex w-1/2 items-center justify-center gap-1.5 rounded-lg border border-outline-variant px-3 py-2.5 text-xs font-semibold text-on-surface transition-colors hover:bg-surface-container-low"
              >
                <span className="material-symbols-outlined text-base">
                  visibility
                </span>
                {labels.preview}
              </button>
            )}
            <button
              type="button"
              onClick={saveHeader}
              disabled={savingHeader}
              className={`flex items-center justify-center gap-1.5 rounded-lg bg-on-surface px-3 py-2.5 text-xs font-semibold text-on-primary shadow-md transition-colors duration-200 hover:bg-primary disabled:opacity-50 ${
                type === "configurable" ? "w-1/2" : "w-full"
              }`}
            >
              <span className="material-symbols-outlined text-base">check</span>
              {labels.saveChanges}
            </button>
          </div>
          <p className="text-center text-[10px] text-on-surface-variant">
            {labels.autosaveActive}
          </p>
        </div>
      </aside>

      <div
        className={`fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2.5 rounded-xl bg-on-surface px-4 py-2.5 text-xs font-medium text-on-primary shadow-xl transition-opacity duration-300 ${
          toast ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <span className="material-symbols-outlined text-base text-[#7CE0A0]">
          check_circle
        </span>
        {labels.changesSaved}
      </div>
    </div>
  );
}
