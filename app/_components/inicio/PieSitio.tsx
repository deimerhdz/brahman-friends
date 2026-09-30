import type { T, Locale } from "@/lib/i18n/t";
import type { AjustesSitio } from "@/lib/ajustes/consultas";
import { SOCIAL_PLATFORM_ICONS } from "@/lib/ajustes/iconos-redes";
import { enlaceWhatsApp } from "@/lib/ajustes/whatsapp";
import { Marca } from "@/app/_components/inicio/Marca";
import { FaArrowUp, FaArrowUpRightFromSquare, FaShieldHalved } from "react-icons/fa6";

const enlacePie =
  "text-sm text-on-deep/70 transition-colors hover:text-on-deep";

// Pie de página del sitio público (FR-026), con las redes de Ajustes.
export function PieSitio({
  t,
  locale,
  siteName,
  logoUrl,
  socialLinks,
  whatsapp,
  youtubeUrl,
}: {
  t: T;
  locale: Locale;
  siteName: string;
  logoUrl: string | null;
  socialLinks: AjustesSitio["socialLinks"];
  whatsapp: string | null;
  youtubeUrl: string | null;
}) {
  return (
    <footer className="bg-deep px-5 pb-7 pt-16 text-on-deep md:px-10 lg:px-14">
      <div className="mx-auto max-w-[1328px]">
        <div className="grid gap-10 border-b border-on-deep/20 pb-14 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Marca logoUrl={logoUrl} siteName={siteName} variante="pie" />
            <p className="mt-6 max-w-[270px] text-sm leading-relaxed text-on-deep/65">
              {t("inicio.pie.proposito")}
            </p>
            {socialLinks.length > 0 && (
              <div className="mt-6 flex items-center gap-4">
                {socialLinks.map((link) => {
                  const Icono = SOCIAL_PLATFORM_ICONS[link.platform];
                  return (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={link.platform}
                      className="text-on-deep/70 transition-colors hover:text-gold"
                    >
                      <Icono className="h-5 w-5" />
                    </a>
                  );
                })}
              </div>
            )}
          </div>
          <div>
            <h2 className="footer-heading">{t("inicio.pie.explora")}</h2>
            <div className="mt-5 flex flex-col gap-3">
              <a href={`/${locale}#colecciones`} className={enlacePie}>
                {t("inicio.nav.colecciones")}
              </a>
              <a href={`/${locale}#personaliza`} className={enlacePie}>
                {t("inicio.nav.personaliza")}
              </a>
              <a href={`/${locale}#mayor`} className={enlacePie}>
                {t("inicio.nav.mayor")}
              </a>
            </div>
          </div>
          <div>
            <h2 className="footer-heading">{t("inicio.pie.contacto")}</h2>
            <div className="mt-5 flex flex-col gap-3">
              {whatsapp && (
                <a
                  href={enlaceWhatsApp(
                    whatsapp,
                    t("inicio.whatsapp.general", { siteName }),
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={enlacePie}
                >
                  {t("inicio.pie.hablarWhatsapp")}
                  <FaArrowUpRightFromSquare className="ml-1.5 inline-block text-[10px]" aria-hidden="true" />
                </a>
              )}
              {youtubeUrl && (
                <a
                  href={youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={enlacePie}
                >
                  {t("inicio.pie.verYoutube")}
                  <FaArrowUpRightFromSquare className="ml-1.5 inline-block text-[10px]" aria-hidden="true" />
                </a>
              )}
            </div>
          </div>
          <div>
            <h2 className="footer-heading">{t("inicio.pie.tuPedido")}</h2>
            <p className="mt-5 text-sm leading-relaxed text-on-deep/70">
              {t("inicio.pie.tuPedidoTexto")}
            </p>
            <div className="mt-5 flex items-center gap-2 text-xs text-gold">
              <FaShieldHalved className="text-[18px] shrink-0" aria-hidden="true" />
              {t("inicio.pie.atencion")}
            </div>
          </div>
        </div>
        <div className="flex flex-col justify-between gap-3 pt-6 text-[11px] text-on-deep/50 md:flex-row">
          <span>
            {t("inicio.pie.derechos", {
              year: new Date().getFullYear(),
              siteName,
            })}
          </span>
          <a
            href={`/${locale}#inicio`}
            className="uppercase transition-colors hover:text-on-deep"
          >
            {t("inicio.pie.volverArriba")}
            <FaArrowUp className="ml-1.5 inline-block" aria-hidden="true" />
          </a>
        </div>
      </div>
    </footer>
  );
}
