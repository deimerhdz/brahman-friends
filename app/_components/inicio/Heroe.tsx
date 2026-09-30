import Image from "next/image";
import type { T } from "@/lib/i18n/t";
import { FaArrowDown, FaArrowRight } from "react-icons/fa6";

// Héroe de la portada (FR-006): banner de Ajustes si existe; si no, la foto de
// campo de la referencia, siempre bajo el degradado azul marino.
export function Heroe({ t, bannerUrl }: { t: T; bannerUrl: string | null }) {
  return (
    <section
      id="inicio"
      className="relative flex min-h-[590px] items-center overflow-hidden bg-deep md:min-h-[680px] lg:min-h-[690px]"
    >
      <Image
        src={bannerUrl ?? "/inicio/ranch-hero.jpg"}
        alt={t("inicio.hero.altImagen")}
        fill
        priority
        sizes="100vw"
        // El banner de Ajustes puede venir de cualquier almacenamiento
        // configurado; se sirve tal cual para no depender de remotePatterns.
        unoptimized={!!bannerUrl}
        className="object-cover object-[61%_center]"
      />
      <div className="hero-shade absolute inset-0" />
      <div className="relative mx-auto w-full max-w-[1440px] px-6 py-20 md:px-10 lg:px-14">
        <div className="max-w-[700px] text-on-deep">
          <p className="mb-6 flex items-center gap-3 text-[11px] font-bold uppercase text-gold md:text-xs">
            <span className="h-px w-9 bg-gold" /> {t("inicio.hero.eyebrow")}
          </p>
          <h1 className="max-w-[700px] font-display text-[43px] font-black uppercase leading-[1.03] sm:text-[58px] lg:text-[76px]">
            {t("inicio.hero.titulo")}
            <span className="text-primary">.</span>
          </h1>
          <p className="mt-6 max-w-[520px] text-[15px] leading-relaxed text-on-deep/85 md:text-lg">
            {t("inicio.hero.subtitulo")}
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <a
              href="#personaliza"
              className="inline-flex h-12 items-center gap-2 rounded-md bg-primary px-6 text-sm font-bold uppercase text-on-primary transition-colors hover:bg-primary/90"
            >
              {t("inicio.hero.ctaPersonalizar")}
              <FaArrowRight className="text-[17px] shrink-0" aria-hidden="true" />
            </a>
            <a
              href="#colecciones"
              className="inline-flex h-12 items-center rounded-md border border-on-deep/70 px-6 text-sm font-bold uppercase text-on-deep transition-colors hover:bg-on-deep hover:text-deep"
            >
              {t("inicio.hero.ctaColeccion")}
            </a>
          </div>
        </div>
      </div>
      <a
        href="#colecciones"
        className="absolute bottom-6 left-6 hidden items-center gap-3 text-[10px] font-bold uppercase text-on-deep/80 md:left-10 md:flex lg:left-14"
      >
        {t("inicio.hero.explora")}
        <FaArrowDown className="text-[15px] shrink-0" aria-hidden="true" />
      </a>
    </section>
  );
}
