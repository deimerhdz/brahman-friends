import { notFound } from "next/navigation";
import { getT, isLocale, type Locale, type T } from "@/lib/i18n/t";
import { CarritoProvider } from "@/app/_components/inicio/CarritoProvider";
import {
  PanelCarrito,
  type TextosCarrito,
} from "@/app/_components/inicio/PanelCarrito";
import { obtenerAjustesSitio } from "@/lib/ajustes/consultas";
import { numeroWhatsApp } from "@/lib/ajustes/whatsapp";
import { FranjaAnuncio } from "@/app/_components/inicio/FranjaAnuncio";
import { EncabezadoSitio } from "@/app/_components/inicio/EncabezadoSitio";
import { PieSitio } from "@/app/_components/inicio/PieSitio";
import { BotonWhatsApp } from "@/app/_components/inicio/BotonWhatsApp";

// Estos layouts leen los ajustes del sitio (nombre y logo) de la base de datos: sin esto Next
// intenta prerenderizar las páginas hijas en el build, donde DATABASE_URL puede no existir, y
// además congelaría el nombre/logo en el momento del despliegue.
export const dynamic = "force-dynamic";

function textosCarrito(t: T, siteName: string): TextosCarrito {
  const claves: (keyof TextosCarrito)[] = [
    "eyebrow",
    "titulo",
    "etiqueta",
    "cerrar",
    "vacio",
    "vacioSub",
    "verColeccion",
    "precioPorConfirmar",
    "quitarUno",
    "anadirUno",
    "eliminar",
    "aviso",
    "enviar",
    "sinWhatsapp",
  ];
  return {
    ...Object.fromEntries(
      claves.map((clave) => [clave, t(`inicio.carrito.${clave}`)]),
    ),
    mensaje: t("inicio.carrito.mensaje", { siteName }),
  } as TextosCarrito;
}

export default async function SiteLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale: Locale = rawLocale;
  const t = getT(locale);
  const ajustes = await obtenerAjustesSitio();
  const siteName = locale === "es" ? ajustes.siteNameEs : ajustes.siteNameEn;
  const whatsapp = numeroWhatsApp(ajustes);
  const youtubeUrl =
    ajustes.socialLinks.find((link) => link.platform === "youtube")?.url ??
    null;

  // Paleta del sitio público (011-rediseno-paleta-inicio, research.md #1): el
  // panel queda fuera de .tema-campo y conserva sus colores.
  return (
    <div className="tema-campo min-h-screen bg-surface text-on-surface">
      <CarritoProvider>
        <FranjaAnuncio t={t} />
        <EncabezadoSitio
          locale={locale}
          siteName={siteName}
          logoUrl={ajustes.logoUrl}
          whatsapp={whatsapp}
          youtubeUrl={youtubeUrl}
        />
        <main>{children}</main>
        <PieSitio
          t={t}
          locale={locale}
          siteName={siteName}
          logoUrl={ajustes.logoUrl}
          socialLinks={ajustes.socialLinks}
          whatsapp={whatsapp}
          youtubeUrl={youtubeUrl}
        />
        <BotonWhatsApp
          numero={whatsapp}
          texto={t("inicio.whatsapp.flotante", { siteName })}
          etiqueta={t("inicio.whatsapp.etiqueta")}
        />
        <PanelCarrito
          numero={whatsapp}
          hrefColeccion={`/${locale}#colecciones`}
          textos={textosCarrito(t, siteName)}
        />
      </CarritoProvider>
    </div>
  );
}
