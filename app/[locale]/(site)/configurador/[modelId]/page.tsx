import { notFound } from "next/navigation";
import { loadModelManifest } from "@/lib/catalogo/model-manifest";
import { getT, type Locale } from "@/lib/i18n/t";
import { env } from "@/lib/config/env";
import { ConfiguradorApp } from "./_components/ConfiguradorApp";

// La vista frontal y los colores por defecto llegan ya renderizados en el
// servidor (FR-029, FR-031a): el manifiesto se calcula acá y se pasa como
// prop inicial del componente cliente, que React ya renderiza en el HTML
// de la primera respuesta.
export default async function ConfiguradorPage({
  params,
}: {
  params: Promise<{ locale: Locale; modelId: string }>;
}) {
  const { locale, modelId } = await params;
  const t = getT(locale);

  const manifest = await loadModelManifest(modelId);
  if (!manifest) notFound();

  return (
    <ConfiguradorApp
      locale={locale}
      manifest={manifest}
      maxDecoratedZones={env.maxDecoratedZones}
      labels={{
        unavailableTitle: t("configurador.unavailableTitle"),
        previousView: t("configurador.previousView"),
        nextView: t("configurador.nextView"),
        viewFront: t("configurador.view.front"),
        viewSide: t("configurador.view.side"),
        viewSideMirrored: t("configurador.view.sideMirrored"),
        viewBack: t("configurador.view.back"),
        approximateColor: t("configurador.approximateColor"),
        reset: t("configurador.reset"),
        resetConfirm: t("configurador.resetConfirm"),
        confirmYes: t("common.yes"),
        confirmNo: t("common.no"),
        removeElement: t("configurador.removeElement"),
        resize: t("configurador.widthCm"),
        uploading: t("common.loading"),
        logoUploadError: t("configurador.logoUploadError"),
        logoTooLarge: t("configurador.logoTooLarge"),
        logoFormatNotAllowed: t("configurador.logoFormatNotAllowed"),
        logoLowResolution: t("configurador.logoLowResolution"),
        logoOpaqueBackground: t("configurador.logoOpaqueBackground"),
        logoRightsNotice: t("configurador.logoRightsNotice"),
        addText: t("configurador.addText"),
        addLogo: t("configurador.addLogo"),
        textContent: t("configurador.textContent"),
        textFont: t("configurador.textFont"),
        textColor: t("configurador.textColor"),
        logoAdded: t("configurador.logoAdded"),
        maxZonesReached: t("configurador.maxZonesReached"),
        chooseTechnique: t("configurador.chooseTechnique"),
        zone_front: t("panel.modelos.zone.front"),
        zone_left: t("panel.modelos.zone.left"),
        zone_right: t("panel.modelos.zone.right"),
        zone_back: t("panel.modelos.zone.back"),
        // 006-configurador-stepper: pasos y resumen.
        next: t("common.next"),
        back: t("common.back"),
        requestQuote: t("configurador.continueToQuote"),
        stepColors: t("configurador.step.colors"),
        stepLogo: t("configurador.step.logo"),
        stepSummary: t("configurador.step.summary"),
        position: t("configurador.position"),
        title: t("configurador.step.summary"),
        decoration: t("configurador.summary.decoration"),
        noDecoration: t("configurador.summary.noDecoration"),
        logo: t("configurador.summary.logo"),
        quantity: t("solicitud.quantity"),
        colorLabel: t("solicitud.color"),
        modelUnavailable: t("errors.modelo_no_disponible"),
      }}
    />
  );
}
