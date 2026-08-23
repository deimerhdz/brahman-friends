import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { color } from "@/lib/db/schema";
import { colorConNombre } from "@/lib/catalogo/consultas-traducidas";
import { getT, type Locale } from "@/lib/i18n/t";
import { ColorForm, type ColorFormValue } from "./_ColorForm";
import { PanelHeader } from "../../_PanelHeader";

export default async function ColorFormPage({
  params,
}: {
  params: Promise<{ locale: Locale; id: string }>;
}) {
  const { locale, id } = await params;
  const t = getT(locale);

  let initial: ColorFormValue = {
    nameEs: "",
    nameEn: "",
    supplierRef: "",
    material: "",
    sampleImageUrl: "",
    status: "available",
  };

  if (id !== "nuevo") {
    const [existing] = await colorConNombre().where(eq(color.id, id)).limit(1);
    if (!existing) notFound();
    initial = existing;
  }

  return (
    <div>
      <PanelHeader
        eyebrow={t("nav.colors")}
        title={id === "nuevo" ? t("panel.colores.new") : t("panel.colores.editTitle")}
      />
      <ColorForm
        locale={locale}
        initial={initial}
        labels={{
          name: t("common.name"),
          switchEs: t("panel.switchIdioma.es"),
          switchEn: t("panel.switchIdioma.en"),
          supplierRef: t("panel.colores.supplierRef"),
          material: t("panel.colores.material"),
          selectMaterial: t("panel.colores.selectMaterial"),
          status: t("panel.colores.status.label"),
          statusAvailable: t("panel.colores.status.available"),
          statusOutOfStock: t("panel.colores.status.out_of_stock"),
          statusDiscontinued: t("panel.colores.status.discontinued"),
          sampleImage: t("panel.colores.sampleImage"),
          upload: t("common.upload"),
          uploading: t("common.uploading"),
          uploadSuccess: t("common.uploadSuccess"),
          retry: t("common.retry"),
          uploadError: t("errors.generic"),
          saveError: t("errors.generic"),
          save: t("common.save"),
        }}
      />
    </div>
  );
}
