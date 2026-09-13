import { eq, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { capModel, modelView } from "@/lib/db/schema";
import { capModelConNombre } from "@/lib/catalogo/consultas-traducidas";
import { getT, type Locale } from "@/lib/i18n/t";
import { ProductoApp } from "./_components/ProductoApp";

/**
 * Página pública de un modelo "Producto fijo" (009-modelos-producto-fijo,
 * FR-011, FR-012, FR-015): sin configurador ni borrador en localStorage —
 * solo fotos, descripción, precio y un formulario de pedido chico. Un modelo
 * que no existe, no está publicado, o es "configurable", responde 404 (ese
 * tipo sigue viviendo en /configurador).
 */
export default async function ProductoPage({
  params,
}: {
  params: Promise<{ locale: Locale; modelId: string }>;
}) {
  const { locale, modelId } = await params;
  const t = getT(locale);

  const [model] = await capModelConNombre().where(eq(capModel.id, modelId)).limit(1);
  if (!model || model.status !== "published" || model.type !== "fixed_product") {
    notFound();
  }

  const views = await db
    .select()
    .from(modelView)
    .where(and(eq(modelView.modelId, modelId), eq(modelView.active, true)));
  const photos = views
    .filter((v): v is typeof v & { baseImageUrl: string } => !!v.baseImageUrl)
    .map((v) => ({ view: v.view, url: v.baseImageUrl }));

  return (
    <ProductoApp
      locale={locale}
      modelId={modelId}
      name={locale === "es" ? model.nameEs : model.nameEn}
      description={locale === "es" ? model.descriptionEs : model.descriptionEn}
      price={model.price}
      photos={photos}
      labels={{
        priceLabel: t("producto.priceLabel"),
        quantity: t("solicitud.quantity"),
        orderTitle: t("producto.orderTitle"),
        buyNow: t("producto.buyNow"),
        close: t("producto.close"),
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
        networkError: t("solicitud.networkError"),
        genericError: t("errors.generic"),
        cantidad_invalida: t("errors.cantidad_invalida"),
        datos_contacto_invalidos: t("errors.datos_contacto_invalidos"),
        modelo_no_disponible: t("errors.modelo_no_disponible"),
      }}
    />
  );
}
