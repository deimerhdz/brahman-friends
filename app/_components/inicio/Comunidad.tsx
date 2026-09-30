import Image from "next/image";
import type { T } from "@/lib/i18n/t";
import { SOCIAL_PLATFORM_ICONS } from "@/lib/ajustes/iconos-redes";
import { FaArrowRight } from "react-icons/fa6";

const IconoYouTube = SOCIAL_PLATFORM_ICONS.youtube;

const FOTOS = [
  { src: "/inicio/community-pasture.jpg", alt: "potrero" },
  { src: "/inicio/community-auction.jpg", alt: "subasta" },
  { src: "/inicio/community-woman.jpg", alt: "ganadera" },
  { src: "/inicio/community-saddle.jpg", alt: "montura" },
] as const;

// "Somos de campo" (FR-025): fotos de comunidad y enlace al canal de YouTube
// configurado en Ajustes (sin enlace, el botón no se muestra).
export function Comunidad({
  t,
  siteName,
  youtubeUrl,
}: {
  t: T;
  siteName: string;
  youtubeUrl: string | null;
}) {
  return (
    <section
      id="comunidad"
      className="scroll-mt-24 px-5 py-20 md:px-10 md:py-24 lg:px-14"
    >
      <div className="mx-auto max-w-[1328px]">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="eyebrow">{t("inicio.comunidad.eyebrow")}</p>
            <h2 className="section-title mt-3">
              {t("inicio.comunidad.titulo")}
              <span className="text-primary">.</span>
            </h2>
            <p className="mt-3 text-sm text-on-surface-variant md:text-base">
              {t("inicio.comunidad.subtitulo")}
            </p>
          </div>
          {youtubeUrl && (
            <a
              href={youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 w-fit items-center gap-2 rounded-md border border-on-surface px-5 text-xs font-bold uppercase transition-colors hover:bg-on-surface hover:text-surface"
            >
              <IconoYouTube className="h-[17px] w-[17px]" />
              {t("inicio.comunidad.youtube", { siteName })}
              <FaArrowRight className="text-[15px] shrink-0" aria-hidden="true" />
            </a>
          )}
        </div>
        <div className="mt-10 grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-4">
          {FOTOS.map((foto) => (
            <div
              key={foto.src}
              className="aspect-square overflow-hidden bg-surface-container"
            >
              <Image
                src={foto.src}
                alt={t(`inicio.comunidad.alt.${foto.alt}`)}
                width={600}
                height={600}
                loading="lazy"
                sizes="(min-width: 768px) 25vw, 50vw"
                className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
              />
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-col gap-5 border-t border-outline-variant pt-8 md:flex-row md:items-center md:justify-between">
          <p className="max-w-lg font-display text-xl font-black uppercase leading-tight md:text-2xl">
            {t("inicio.comunidad.lema1")}
            <br />
            <span className="text-primary">{t("inicio.comunidad.lema2")}</span>
          </p>
          <span className="text-xs font-bold uppercase text-on-surface-variant">
            {t("inicio.comunidad.firma", { siteName })}
          </span>
        </div>
      </div>
    </section>
  );
}
