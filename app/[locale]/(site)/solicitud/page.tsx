import { getT, type Locale } from "@/lib/i18n/t";
import { SolicitudApp } from "./_components/SolicitudApp";

export default async function SolicitudPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = getT(locale);

  return (
    <SolicitudApp
      locale={locale}
      labels={{
        title: t("solicitud.title"),
        quantity: t("solicitud.quantity"),
        colors: t("solicitud.colors"),
        decorations: t("solicitud.decorations"),
        logo: t("solicitud.logo"),
        text: t("solicitud.text"),
        technique: t("solicitud.technique"),
        noPriceWarning: t("solicitud.noPriceWarning"),
        zone_front: t("panel.modelos.zone.front"),
        zone_left: t("panel.modelos.zone.left"),
        zone_right: t("panel.modelos.zone.right"),
        zone_back: t("panel.modelos.zone.back"),
        name: t("solicitud.name"),
        email: t("auth.email"),
        phone: t("solicitud.phone"),
        comments: t("solicitud.comments"),
        optional: t("common.optional"),
        privacyPrefix: t("solicitud.privacyPrefix"),
        privacyLink: t("solicitud.privacyLink"),
        submit: t("solicitud.submit"),
        submitting: t("solicitud.submitting"),
        retry: t("common.retry"),
        noDesign: t("solicitud.noDesign"),
        backHome: t("nav.home"),
        loadError: t("configurador.imagesError"),
        loading: t("common.loading"),
        genericError: t("errors.generic"),
        networkError: t("solicitud.networkError"),
        modelo_no_disponible: t("errors.modelo_no_disponible"),
        color_no_disponible: t("errors.color_no_disponible"),
        cantidad_invalida: t("errors.cantidad_invalida"),
        datos_contacto_invalidos: t("errors.datos_contacto_invalidos"),
        decoracion_invalida: t("errors.decoracion_invalida"),
      }}
    />
  );
}
