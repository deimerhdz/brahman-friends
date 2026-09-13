import { getT, type Locale } from "@/lib/i18n/t";
import { obtenerAjustesSitio } from "@/lib/ajustes/consultas";
import { env } from "@/lib/config/env";
import { AjustesForm } from "./_components/AjustesForm";
import { RedesSociales } from "./_components/RedesSociales";
import { SOCIAL_PLATFORMS } from "@/lib/ajustes/iconos-redes";

export default async function AjustesPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = getT(locale);
  const ajustes = await obtenerAjustesSitio();
  const maxMb = env.maxLogoMb;

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 pb-10">
      <AjustesForm
        initial={{
          siteName: { es: ajustes.siteNameEs, en: ajustes.siteNameEn },
          contactEmail: ajustes.contactEmail ?? "",
          contactPhone: ajustes.contactPhone ?? "",
          logoUrl: ajustes.logoUrl,
          bannerUrl: ajustes.bannerUrl,
          seoTitle: { es: ajustes.seoTitleEs ?? "", en: ajustes.seoTitleEn ?? "" },
          seoDescription: {
            es: ajustes.seoDescriptionEs ?? "",
            en: ajustes.seoDescriptionEn ?? "",
          },
          seoImageUrl: ajustes.seoImageUrl,
        }}
        maxImageBytes={maxMb * 1024 * 1024}
        labels={{
          topBarEyebrow: t("panel.ajustes.topBarEyebrow"),
          discard: t("panel.ajustes.discard"),
          stickyTitle: t("panel.ajustes.stickyTitle"),
          stickySubtitle: t("panel.ajustes.stickySubtitle"),

          sectionTitle: t("panel.ajustes.basics.sectionTitle"),
          sectionSubtitle: t("panel.ajustes.basics.sectionSubtitle"),
          siteNameEs: t("panel.ajustes.basics.siteNameEs"),
          siteNameEsHint: t("panel.ajustes.basics.siteNameEsHint"),
          siteNameEn: t("panel.ajustes.basics.siteNameEn"),
          siteNameEnHint: t("panel.ajustes.basics.siteNameEnHint"),
          contactEmail: t("panel.ajustes.basics.contactEmail"),
          contactEmailHint: t("panel.ajustes.basics.contactEmailHint"),
          contactPhone: t("panel.ajustes.basics.contactPhone"),
          contactPhoneHint: t("panel.ajustes.basics.contactPhoneHint"),
          multilingualTitle: t("panel.ajustes.basics.multilingualTitle"),
          multilingualHint: t("panel.ajustes.basics.multilingualHint"),
          save: t("common.save"),
          success: t("panel.ajustes.basics.success"),
          error: t("panel.ajustes.basics.error"),
          nameRequired: t("panel.ajustes.basics.nameRequired"),

          mediaSectionTitle: t("panel.ajustes.media.sectionTitle"),
          mediaSectionSubtitle: t("panel.ajustes.media.sectionSubtitle"),
          logoSectionTitle: t("panel.ajustes.logo.sectionTitle"),
          logoRecommendation: t("panel.ajustes.logo.recommendation", { maxMb }),
          logoEmpty: t("panel.ajustes.logo.empty"),
          logoFormats: t("panel.ajustes.logo.formats", { maxMb }),
          logoRemove: t("panel.ajustes.logo.remove"),
          bannerSectionTitle: t("panel.ajustes.banner.sectionTitle"),
          bannerRecommendation: t("panel.ajustes.banner.recommendation", { maxMb }),
          bannerEmpty: t("panel.ajustes.banner.empty"),
          bannerFormats: t("panel.ajustes.banner.formats", { maxMb }),
          bannerRemove: t("panel.ajustes.banner.remove"),
          uploadSelect: t("panel.ajustes.upload.select"),
          uploadButton: t("panel.ajustes.upload.uploadButton"),
          uploading: t("common.uploading"),
          uploadSuccess: t("common.uploadSuccess"),
          uploadError: t("panel.ajustes.upload.error"),
          retry: t("common.retry"),

          seoSectionTitle: t("panel.ajustes.seo.sectionTitle"),
          seoSectionSubtitle: t("panel.ajustes.seo.sectionSubtitle"),
          seoTitleEs: t("panel.ajustes.seo.titleEs"),
          seoTitleEn: t("panel.ajustes.seo.titleEn"),
          titleCounter: t("panel.ajustes.seo.titleCounter"),
          seoDescriptionEs: t("panel.ajustes.seo.descriptionEs"),
          seoDescriptionEn: t("panel.ajustes.seo.descriptionEn"),
          descriptionCounter: t("panel.ajustes.seo.descriptionCounter"),
          seoImageSectionTitle: t("panel.ajustes.seo.imageSectionTitle"),
          seoImageRecommendation: t("panel.ajustes.seo.imageRecommendation", { maxMb }),
          seoImageRemove: t("panel.ajustes.seo.imageRemove"),
          seoPreviewDomain: t("panel.ajustes.seo.previewDomain"),
          seoPreviewPlaceholder: t("panel.ajustes.seo.previewPlaceholder"),
        }}
      />

      <RedesSociales
        initial={ajustes.socialLinks}
        labels={{
          sectionTitle: t("panel.ajustes.redes.sectionTitle"),
          sectionSubtitle: t("panel.ajustes.redes.sectionSubtitle"),
          addNewTitle: t("panel.ajustes.redes.addNewTitle"),
          linkedTitle: t("panel.ajustes.redes.linkedTitle"),
          active: t("panel.ajustes.redes.active"),
          empty: t("panel.ajustes.redes.empty"),
          add: t("panel.ajustes.redes.add"),
          edit: t("panel.ajustes.redes.edit"),
          save: t("common.save"),
          remove: t("panel.ajustes.redes.remove"),
          urlPlaceholder: t("panel.ajustes.redes.urlPlaceholder"),
          invalidUrl: t("panel.ajustes.redes.invalidUrl"),
          ...Object.fromEntries(
            SOCIAL_PLATFORMS.map((platform) => [
              `platform_${platform}`,
              t(`panel.ajustes.redes.platform_${platform}`),
            ]),
          ),
        }}
      />
    </div>
  );
}
