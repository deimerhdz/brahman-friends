"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n/t";
import type { ModelManifest } from "@/lib/catalogo/model-manifest";
import {
  createEmptyDraft,
  loadDraft,
  saveDraft,
  type Decoration,
  type Draft,
} from "@/lib/design/borrador";
import { canPlaceDecoration, puedeAvanzarPaso, moqEfectivo } from "@/lib/design/rules";
import { CapasGorra, type DisplayView } from "./CapasGorra";
import { Decoracion } from "./Decoracion";
import { Vistas } from "./Vistas";
import { Restablecer } from "./Restablecer";
import { AvisoDisponibilidad } from "./AvisoDisponibilidad";
import { BarraControles } from "./BarraControles";
import { usePrecarga } from "./Precarga";
import { Stepper } from "./Stepper";
import { PasoColores } from "./PasoColores";
import { PasoLogo } from "./PasoLogo";
import { PasoResumen } from "./PasoResumen";

const TOTAL_STEPS = 3;

function defaultColorsOf(manifest: ModelManifest): Record<string, string> {
  const colors: Record<string, string> = {};
  for (const comp of manifest.components) {
    if (!comp.customizable) continue;
    const def = comp.colors.find((c) => c.id === comp.defaultColorId) ?? comp.colors[0];
    if (def) colors[comp.id] = def.id;
  }
  return colors;
}

export function ConfiguradorApp({
  locale,
  manifest,
  maxDecoratedZones,
  labels,
}: {
  locale: Locale;
  manifest: ModelManifest;
  maxDecoratedZones: number;
  labels: Record<string, string>;
}) {
  const router = useRouter();
  const [draft, setDraft] = useState<Draft>(() => {
    const existing = loadDraft(manifest.model.id);
    return existing ?? createEmptyDraft(manifest.model.id, defaultColorsOf(manifest));
  });
  const [view, setView] = useState<DisplayView>("front");
  const [unavailable, setUnavailable] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [maxStepReached, setMaxStepReached] = useState(1);
  const [quantity, setQuantity] = useState(() => moqEfectivo(manifest.moq));
  const [modelUnavailable, setModelUnavailable] = useState(false);

  const customizableComponentIds = useMemo(
    () => manifest.components.filter((c) => c.customizable).map((c) => c.id),
    [manifest],
  );

  // Al abrir, valida que los colores del borrador sigan disponibles (FR-033
  // de 001-configurador-gorras).
  useEffect(() => {
    const defaults = defaultColorsOf(manifest);
    const fixed: string[] = [];
    const nextColors = { ...draft.colors };
    for (const comp of manifest.components) {
      if (!comp.customizable) continue;
      const colorId = nextColors[comp.id];
      const color = comp.colors.find((c) => c.id === colorId);
      if (!colorId || !color || color.status !== "available") {
        nextColors[comp.id] = defaults[comp.id];
        fixed.push(locale === "es" ? comp.nameEs : comp.nameEn);
      }
    }

    if (fixed.length > 0) {
      setUnavailable(fixed);
      setDraft((d) => ({ ...d, colors: nextColors }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [manifest.model.id]);

  useEffect(() => {
    saveDraft(draft);
  }, [draft]);

  // Al llegar al resumen, vuelve a comprobar que el modelo siga publicado
  // (006-configurador-stepper FR-022, research.md#7): nada más en el
  // configurador vuelve a consultar el servidor tras la carga inicial.
  useEffect(() => {
    if (currentStep !== TOTAL_STEPS) return;
    let cancelled = false;
    fetch(`/api/imagenes-modelo/${manifest.model.id}`)
      .then((r) => {
        if (!cancelled) setModelUnavailable(!r.ok);
      })
      .catch(() => {
        // Sin conexión: no bloquea, se vuelve a intentar en el próximo envío.
      });
    return () => {
      cancelled = true;
    };
  }, [currentStep, manifest.model.id]);

  const priorityUrls = useMemo(() => {
    const urls: string[] = [];
    for (const comp of manifest.components) {
      for (const c of comp.colors) {
        const url = c.images.front;
        if (url) urls.push(url);
      }
    }
    return urls;
  }, [manifest]);

  usePrecarga(manifest, priorityUrls);

  const aspectRatio =
    manifest.model.imageWidth && manifest.model.imageHeight
      ? manifest.model.imageWidth / manifest.model.imageHeight
      : 1;

  function selectColor(componentId: string, colorId: string) {
    setDraft((d) => ({ ...d, colors: { ...d.colors, [componentId]: colorId } }));
  }

  function reset() {
    setDraft(createEmptyDraft(manifest.model.id, defaultColorsOf(manifest)));
  }

  function addDecoration(decoration: Decoration): boolean {
    const placement = canPlaceDecoration(
      draft.decorations.map((d) => d.zone),
      decoration.zone,
      maxDecoratedZones,
    );
    if (!placement.allowed) return false;
    setDraft((d) => ({ ...d, decorations: [...d.decorations, decoration] }));
    return true;
  }

  function updateDecoration(index: number, patch: Partial<Decoration>) {
    setDraft((d) => ({
      ...d,
      decorations: d.decorations.map((dec, i) =>
        i === index ? ({ ...dec, ...patch } as Decoration) : dec,
      ),
    }));
  }

  function removeDecoration(index: number) {
    setDraft((d) => ({
      ...d,
      decorations: d.decorations.filter((_, i) => i !== index),
    }));
  }

  const canAdvance = puedeAvanzarPaso(currentStep, draft, customizableComponentIds);

  function goToStep(step: number) {
    if (step < 1 || step > maxStepReached) return;
    setCurrentStep(step);
  }

  function handlePrimary() {
    if (currentStep < TOTAL_STEPS) {
      if (!canAdvance) return;
      const next = currentStep + 1;
      setCurrentStep(next);
      setMaxStepReached((m) => Math.max(m, next));
      return;
    }
    if (modelUnavailable) return;
    router.push(`/${locale}/solicitud?qty=${quantity}`);
  }

  return (
    <div className="flex flex-col gap-4 pb-4 lg:flex-row lg:items-start lg:gap-8 lg:px-8 lg:py-6">
      <div className="flex flex-1 flex-col gap-4">
        <AvisoDisponibilidad
          componentNames={unavailable}
          labels={{ title: labels.unavailableTitle }}
        />

        <div className="relative w-full overflow-hidden rounded lg:bg-inverse-surface" style={{ aspectRatio }}>
          <CapasGorra manifest={manifest} colors={draft.colors} view={view} />
          <Decoracion
            manifest={manifest}
            view={view}
            decorations={draft.decorations}
            onChange={updateDecoration}
            onRemove={removeDecoration}
            labels={{ remove: labels.removeElement, resize: labels.resize }}
          />
        </div>

        <Vistas
          manifest={manifest}
          current={view}
          onChange={setView}
          labels={{
            previous: labels.previousView,
            next: labels.nextView,
            view_front: labels.viewFront,
            view_side: labels.viewSide,
            view_side_mirrored: labels.viewSideMirrored,
            view_back: labels.viewBack,
          }}
        />
      </div>

      <div className="flex w-full flex-col gap-6 px-4 lg:w-[480px] lg:shrink-0 lg:px-0">
        <div>
          <h1 className="mb-1 font-headline-md text-headline-md text-on-surface">
            {locale === "es" ? manifest.model.nameEs : manifest.model.nameEn}
          </h1>
        </div>

        <Stepper
          steps={[
            { label: labels.stepColors },
            { label: labels.stepLogo },
            { label: labels.stepSummary },
          ]}
          current={currentStep}
          maxReached={maxStepReached}
          onJump={goToStep}
          onBack={() => currentStep > 1 && setCurrentStep(currentStep - 1)}
          primaryLabel={currentStep < TOTAL_STEPS ? labels.next : labels.requestQuote}
          primaryDisabled={currentStep < TOTAL_STEPS ? !canAdvance : modelUnavailable}
          onPrimary={handlePrimary}
          backLabel={labels.back}
        >
          {currentStep === 1 && (
            <PasoColores
              locale={locale}
              manifest={manifest}
              colors={draft.colors}
              onSelect={selectColor}
              labels={{ approximate: labels.approximateColor }}
            />
          )}
          {currentStep === 2 && (
            <PasoLogo
              locale={locale}
              manifest={manifest}
              view={view}
              onViewChange={setView}
              decorations={draft.decorations}
              maxZones={maxDecoratedZones}
              technique={draft.technique}
              onSelectTechnique={(techniqueId) =>
                setDraft((d) => ({ ...d, technique: techniqueId }))
              }
              onAddDecoration={addDecoration}
              onUpdateDecoration={updateDecoration}
              labels={labels}
            />
          )}
          {currentStep === 3 && (
            <>
              {modelUnavailable && (
                <p className="rounded border border-error/40 bg-error-container p-3 text-sm text-on-error-container">
                  {labels.modelUnavailable}
                </p>
              )}
              <PasoResumen
                locale={locale}
                manifest={manifest}
                draft={draft}
                quantity={quantity}
                minQuantity={moqEfectivo(manifest.moq)}
                onQuantityChange={setQuantity}
                labels={labels}
              />
            </>
          )}
        </Stepper>

        <BarraControles>
          <Restablecer
            onConfirm={reset}
            labels={{
              reset: labels.reset,
              confirmMessage: labels.resetConfirm,
              confirm: labels.confirmYes,
              cancel: labels.confirmNo,
            }}
          />
        </BarraControles>
      </div>
    </div>
  );
}
