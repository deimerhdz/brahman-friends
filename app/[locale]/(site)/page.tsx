import type { Metadata } from "next";
import { Suspense } from "react";
import { and, asc, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { capModel, color, colorImage } from "@/lib/db/schema";
import {
  capModelConNombreYPortada,
  colorConNombre,
} from "@/lib/catalogo/consultas-traducidas";
import { getT, type Locale, type T } from "@/lib/i18n/t";
import { obtenerAjustesSitio } from "@/lib/ajustes/consultas";
import { Heroe } from "@/app/_components/inicio/Heroe";
import { Beneficios } from "@/app/_components/inicio/Beneficios";
import {
  Coleccion,
  type TarjetaColeccion,
  type TextosColeccion,
} from "@/app/_components/inicio/Coleccion";
import {
  VitrinaPersonaliza,
  type TextosVitrina,
} from "@/app/_components/inicio/VitrinaPersonaliza";
import { PedidosMayor } from "@/app/_components/inicio/PedidosMayor";
import { Comunidad } from "@/app/_components/inicio/Comunidad";
import { numeroWhatsApp } from "@/lib/ajustes/whatsapp";

// La portada depende de qué modelos están publicados en este momento
// (FR-014, RN1): nunca se genera estáticamente.
export const dynamic = "force-dynamic";

// SEO configurable desde /panel/ajustes (010-panel-ajustes-generales, FR-009
// a FR-011): si el título/descripción no están configurados, se usa el
// nombre del sitio y el subtítulo del héroe como valor por defecto razonable
// (research.md #9), para que la página nunca quede sin título ni descripción.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = getT(locale);
  const ajustes = await obtenerAjustesSitio();
  const siteName = locale === "es" ? ajustes.siteNameEs : ajustes.siteNameEn;
  const seoTitle =
    (locale === "es" ? ajustes.seoTitleEs : ajustes.seoTitleEn) || siteName;
  const seoDescription =
    (locale === "es" ? ajustes.seoDescriptionEs : ajustes.seoDescriptionEn) ||
    t("inicio.hero.subtitulo");

  return {
    title: seoTitle,
    description: seoDescription,
    openGraph: {
      title: seoTitle,
      description: seoDescription,
      images: ajustes.seoImageUrl ? [ajustes.seoImageUrl] : undefined,
    },
  };
}

/**
 * Modelos publicados para "Nuestra colección" (data-model.md#TarjetaColeccion):
 * los configurables llevan sus colores con foto frontal, que la tarjeta usa
 * como muestras (research.md #7).
 */
async function cargarColeccion(locale: Locale): Promise<TarjetaColeccion[]> {
  const modelos = await capModelConNombreYPortada()
    .where(eq(capModel.status, "published"))
    .orderBy(desc(capModel.publishedAt));

  const idsConfigurables = modelos
    .filter((m) => m.type === "configurable")
    .map((m) => m.id);
  const [colores, fotos] = idsConfigurables.length
    ? await Promise.all([
        colorConNombre()
          .where(inArray(color.modelId, idsConfigurables))
          .orderBy(asc(color.createdAt)),
        db
          .select({
            colorId: colorImage.colorId,
            imageUrl: colorImage.imageUrl,
          })
          .from(colorImage)
          .where(
            and(
              inArray(colorImage.modelId, idsConfigurables),
              eq(colorImage.view, "front"),
            ),
          ),
      ])
    : [[], []];
  const fotoPorColor = new Map(fotos.map((f) => [f.colorId, f.imageUrl]));

  return modelos.map((m) => ({
    id: m.id,
    name: locale === "es" ? m.nameEs : m.nameEn,
    type: m.type,
    frontImageUrl: m.frontImageUrl,
    price: m.type === "fixed_product" ? m.price : null,
    href:
      m.type === "fixed_product"
        ? `/${locale}/producto/${m.id}`
        : `/${locale}/configurador/${m.id}`,
    colores: colores.flatMap((c) => {
      const imageUrl = fotoPorColor.get(c.id);
      return c.modelId === m.id && imageUrl
        ? [{ id: c.id, name: locale === "es" ? c.nameEs : c.nameEn, imageUrl }]
        : [];
    }),
  }));
}

function textosColeccion(t: T): TextosColeccion {
  const claves: (keyof TextosColeccion)[] = [
    "eyebrow",
    "titulo",
    "subtitulo",
    "contador",
    "filtros",
    "filtroTodos",
    "filtroPersonalizables",
    "filtroListos",
    "buscarPlaceholder",
    "buscarEtiqueta",
    "cerrarBusqueda",
    "sinResultados",
    "vacia",
    "etiquetaPersonalizable",
    "etiquetaListo",
    "cotizar",
    "personalizar",
    "anadir",
    "aviso",
    "colores",
    "colorDe",
    "altGorra",
  ];
  return Object.fromEntries(
    claves.map((clave) => [clave, t(`inicio.coleccion.${clave}`)]),
  ) as TextosColeccion;
}

function textosVitrina(t: T): TextosVitrina {
  const p = (clave: string) => t(`inicio.personaliza.${clave}`);
  return {
    eyebrow: p("eyebrow"),
    titulo: p("titulo"),
    subtitulo: p("subtitulo"),
    vistaPrevia: p("vistaPrevia"),
    altVistaPrevia: p("altVistaPrevia"),
    paso1: p("paso1"),
    paso2: p("paso2"),
    paso3: p("paso3"),
    paso3Sub: p("paso3Sub"),
    subir: p("subir"),
    casa: p("casa"),
    enConfigurador: p("enConfigurador"),
    cta: p("cta"),
    estilos: ["trucker", "cuero", "curva"].map((e) => p(`estilos.${e}`)),
    // Mismo orden que COLORES en VitrinaPersonaliza.tsx
    colores: ["azulRojo", "arenaCafe", "negro", "camo"].map((c) =>
      p(`colores.${c}`),
    ),
  };
}

// Portada con el diseño de ../brahman-threads (011-rediseno-paleta-inicio,
// FR-004). Franja, encabezado, pie y botón de WhatsApp los pone el layout.
export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = getT(locale);
  const [ajustes, modelos] = await Promise.all([
    obtenerAjustesSitio(),
    cargarColeccion(locale),
  ]);
  const siteName = locale === "es" ? ajustes.siteNameEs : ajustes.siteNameEn;
  const youtubeUrl =
    ajustes.socialLinks.find((link) => link.platform === "youtube")?.url ??
    null;
  // La vitrina lleva al configurable publicado más reciente; sin ninguno,
  // a la colección (caso borde de la spec).
  const hrefPersonalizar =
    modelos.find((m) => m.type === "configurable")?.href ?? "#colecciones";

  return (
    <>
      <Heroe t={t} bannerUrl={ajustes.bannerUrl} />
      <Beneficios t={t} />
      {/* Suspense: la colección lee ?buscar=1 con useSearchParams */}
      <Suspense>
        <Coleccion modelos={modelos} textos={textosColeccion(t)} />
      </Suspense>
      <VitrinaPersonaliza
        hrefPersonalizar={hrefPersonalizar}
        textos={textosVitrina(t)}
      />
      <PedidosMayor t={t} whatsapp={numeroWhatsApp(ajustes)} />
      <Comunidad t={t} siteName={siteName} youtubeUrl={youtubeUrl} />
    </>
  );
}
