import { FaShieldHalved, FaStar, FaSun, FaTruckFast } from "react-icons/fa6";
import type { T } from "@/lib/i18n/t";

const BENEFICIOS = [
  { Icono: FaStar, titulo: "bordado", sub: "bordadoSub" },
  { Icono: FaSun, titulo: "sol", sub: "solSub" },
  { Icono: FaTruckFast, titulo: "envios", sub: "enviosSub" },
  { Icono: FaShieldHalved, titulo: "durar", sub: "durarSub" },
] as const;

export function Beneficios({ t }: { t: T }) {
  return (
    <section
      className="border-b border-outline-variant bg-surface-container"
      aria-label={t("inicio.beneficios.etiqueta")}
    >
      <div className="mx-auto grid max-w-[1440px] grid-cols-2 divide-x divide-outline-variant px-4 py-5 md:grid-cols-4 md:px-10 lg:px-14">
        {BENEFICIOS.map(({ Icono, titulo, sub }) => (
          <div
            key={titulo}
            className="flex items-center gap-3 px-3 py-3 md:justify-center md:gap-4"
          >
            <Icono className="shrink-0 text-[25px] text-primary" aria-hidden="true" />
            <div>
              <h2 className="text-[11px] font-black uppercase leading-tight md:text-xs">
                {t(`inicio.beneficios.${titulo}`)}
              </h2>
              <p className="mt-0.5 text-[10px] text-on-surface-variant md:text-xs">
                {t(`inicio.beneficios.${sub}`)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
