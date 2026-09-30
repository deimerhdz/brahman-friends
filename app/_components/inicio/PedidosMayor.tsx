import Image from "next/image";
import type { T } from "@/lib/i18n/t";
import { SOCIAL_PLATFORM_ICONS } from "@/lib/ajustes/iconos-redes";
import { enlaceWhatsApp } from "@/lib/ajustes/whatsapp";
import { FaArrowRight } from "react-icons/fa6";

const IconoWhatsApp = SOCIAL_PLATFORM_ICONS.whatsapp;

// Bloque de pedidos por mayor (FR-024): el botón abre WhatsApp con un mensaje
// para 12 o más unidades; sin número configurado no se muestra.
export function PedidosMayor({
  t,
  whatsapp,
}: {
  t: T;
  whatsapp: string | null;
}) {
  return (
    <section
      id="mayor"
      className="scroll-mt-24 bg-deep px-5 py-20 text-on-deep md:px-10 md:py-24 lg:px-14"
    >
      <div className="mx-auto grid max-w-[1328px] items-center gap-12 lg:grid-cols-2 lg:gap-20">
        <div>
          <p className="eyebrow text-gold!">{t("inicio.mayor.eyebrow")}</p>
          <h2 className="section-title mt-5 max-w-[570px]">
            {t("inicio.mayor.titulo")}
            <span className="text-primary">?</span>
          </h2>
          <p className="mt-6 max-w-[550px] text-sm leading-relaxed text-on-deep/75 md:text-base">
            {t("inicio.mayor.texto")}
          </p>
          <div className="mt-8 flex items-center gap-4 border-l-2 border-gold pl-4">
            <span className="font-display text-4xl font-black text-gold">
              {t("inicio.mayor.unidades")}
            </span>
            <span className="max-w-[120px] text-xs font-bold uppercase leading-snug">
              {t("inicio.mayor.unidadesTexto")}
            </span>
          </div>
          {whatsapp && (
            <a
              href={enlaceWhatsApp(whatsapp, t("inicio.mayor.mensaje"))}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-9 inline-flex h-12 items-center gap-2 rounded-md bg-primary px-6 text-xs font-bold uppercase text-on-primary transition-colors hover:bg-primary/90"
            >
              <IconoWhatsApp className="h-[17px] w-[17px]" />
              {t("inicio.mayor.cta")}
              <FaArrowRight className="text-[16px] shrink-0" aria-hidden="true" />
            </a>
          )}
        </div>
        <div className="relative">
          <Image
            src="/inicio/ranch-team.jpg"
            alt={t("inicio.mayor.altFoto")}
            width={1200}
            height={800}
            loading="lazy"
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="aspect-[4/3] w-full object-cover"
          />
          <span className="absolute -bottom-4 -left-4 bg-gold px-5 py-3 font-display text-xs font-black uppercase text-deep md:-left-6">
            {t("inicio.mayor.etiquetaFoto")}
          </span>
        </div>
      </div>
    </section>
  );
}
