import Link from "next/link";
import { ControlCuenta } from "@/app/_components/ControlCuenta";
import { SelectorIdioma } from "@/app/_components/SelectorIdioma";
import { Marca } from "@/app/_components/inicio/Marca";
import { AccionesEncabezado } from "@/app/_components/inicio/AccionesEncabezado";
import { BotonCarrito } from "@/app/_components/inicio/BotonCarrito";
import { SOCIAL_PLATFORM_ICONS } from "@/lib/ajustes/iconos-redes";
import { enlaceWhatsApp } from "@/lib/ajustes/whatsapp";
import { getT, type Locale } from "@/lib/i18n/t";
import { FaMagnifyingGlass } from "react-icons/fa6";

const IconoWhatsApp = SOCIAL_PLATFORM_ICONS.whatsapp;
const botonIcono =
  "flex h-10 w-10 items-center justify-center rounded-md transition-colors hover:bg-surface-container";

// Encabezado fijo del sitio público (FR-009 a FR-012). Los enlaces de sección
// apuntan a la portada para que funcionen desde cualquier página.
export function EncabezadoSitio({
  locale,
  siteName,
  logoUrl,
  whatsapp,
  youtubeUrl,
}: {
  locale: Locale;
  siteName: string;
  logoUrl: string | null;
  whatsapp: string | null;
  youtubeUrl: string | null;
}) {
  const t = getT(locale);
  const enlaces = [
    { href: `/${locale}#colecciones`, label: t("inicio.nav.colecciones") },
    { href: `/${locale}#personaliza`, label: t("inicio.nav.personaliza") },
    { href: `/${locale}#mayor`, label: t("inicio.nav.mayor") },
    { href: `/${locale}#comunidad`, label: t("inicio.nav.comunidad") },
  ];
  const idiomaYCuenta = (
    <>
      <SelectorIdioma locale={locale} label={t("nav.languageSelector")} />
      <ControlCuenta locale={locale} />
    </>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-outline-variant bg-surface/95 backdrop-blur-md">
      <div className="mx-auto flex h-[76px] max-w-[1440px] items-center justify-between gap-5 px-5 md:px-10 lg:h-[88px] lg:px-14">
        <Link
          href={`/${locale}`}
          aria-label={t("inicio.nav.irInicio", { siteName })}
          className="shrink-0"
        >
          <Marca logoUrl={logoUrl} siteName={siteName} variante="encabezado" />
        </Link>

        <nav
          className="hidden items-center gap-6 xl:flex"
          aria-label={t("inicio.nav.principal")}
        >
          {enlaces.map((enlace) => (
            <a
              key={enlace.href}
              href={enlace.href}
              className="text-[11px] font-bold uppercase text-on-surface transition-colors hover:text-primary"
            >
              {enlace.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-1 md:gap-2">
          <div className="hidden items-center gap-4 pr-2 xl:flex">
            {idiomaYCuenta}
          </div>
          {/* La colección abre su buscador al ver ?buscar=1 (research.md #11) */}
          <Link
            href={`/${locale}?buscar=1#colecciones`}
            aria-label={t("inicio.nav.buscar")}
            title={t("inicio.nav.buscar")}
            className={botonIcono}
          >
            <FaMagnifyingGlass className="text-[20px] shrink-0" aria-hidden="true" />
          </Link>
          {whatsapp && (
            <a
              href={enlaceWhatsApp(
                whatsapp,
                t("inicio.whatsapp.general", { siteName }),
              )}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t("inicio.nav.whatsapp")}
              title={t("inicio.nav.whatsapp")}
              className={botonIcono}
            >
              <IconoWhatsApp className="h-5 w-5" />
            </a>
          )}
          <BotonCarrito etiqueta={t("inicio.nav.abrirCarrito")} />
          <AccionesEncabezado
            enlaces={enlaces}
            youtube={
              youtubeUrl
                ? { href: youtubeUrl, label: t("inicio.nav.youtube") }
                : null
            }
            textos={{
              abrirMenu: t("inicio.nav.abrirMenu"),
              cerrarMenu: t("inicio.nav.cerrarMenu"),
              navMovil: t("inicio.nav.movil"),
            }}
          >
            {idiomaYCuenta}
          </AccionesEncabezado>
        </div>
      </div>
    </header>
  );
}
