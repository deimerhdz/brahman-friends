import { FaStar } from "react-icons/fa6";
import type { T } from "@/lib/i18n/t";

export function FranjaAnuncio({ t }: { t: T }) {
  return (
    <div className="bg-deep px-4 py-2.5 text-center text-[10px] font-semibold uppercase leading-snug text-on-deep md:text-xs">
      <FaStar className="mr-2 inline-block align-[-1px] text-gold" aria-hidden="true" /> {t("inicio.anuncio.envios")}{" "}
      <span className="mx-2 text-gold">/</span> {t("inicio.anuncio.bordado")}
    </div>
  );
}
