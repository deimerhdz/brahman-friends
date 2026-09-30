"use client";

import { useEffect, useState } from "react";
import { FaArrowUpRightFromSquare, FaBars, FaXmark } from "react-icons/fa6";

export type EnlaceSeccion = { href: string; label: string };

// Parte interactiva del encabezado: menú móvil (FR-012). Recibe como
// `children` el selector de idioma y el control de cuenta, que por debajo de
// `xl` solo aparecen dentro de este menú.
export function AccionesEncabezado({
  enlaces,
  youtube,
  textos,
  children,
}: {
  enlaces: EnlaceSeccion[];
  youtube: EnlaceSeccion | null;
  textos: { abrirMenu: string; cerrarMenu: string; navMovil: string };
  children: React.ReactNode;
}) {
  const [menuAbierto, setMenuAbierto] = useState(false);

  useEffect(() => {
    if (!menuAbierto) return;
    const alPulsar = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuAbierto(false);
    };
    window.addEventListener("keydown", alPulsar);
    return () => window.removeEventListener("keydown", alPulsar);
  }, [menuAbierto]);

  return (
    <>
      <button
        type="button"
        onClick={() => setMenuAbierto(!menuAbierto)}
        aria-expanded={menuAbierto}
        aria-label={menuAbierto ? textos.cerrarMenu : textos.abrirMenu}
        className="flex h-10 w-10 items-center justify-center rounded-md transition-colors hover:bg-surface-container xl:hidden"
      >
        {menuAbierto ? (
          <FaXmark className="text-[22px]" aria-hidden="true" />
        ) : (
          <FaBars className="text-[22px]" aria-hidden="true" />
        )}
      </button>

      {menuAbierto && (
        <nav
          aria-label={textos.navMovil}
          className="absolute inset-x-0 top-full border-y border-outline-variant bg-surface px-5 py-4 shadow-sm xl:hidden"
        >
          {enlaces.map((enlace) => (
            <a
              key={enlace.href}
              href={enlace.href}
              onClick={() => setMenuAbierto(false)}
              className="block border-b border-outline-variant py-3 text-sm font-bold uppercase"
            >
              {enlace.label}
            </a>
          ))}
          {youtube && (
            <a
              href={youtube.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 border-b border-outline-variant py-3 text-sm font-bold uppercase"
            >
              {youtube.label}
              <FaArrowUpRightFromSquare className="text-[11px]" aria-hidden="true" />
            </a>
          )}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4">
            {children}
          </div>
        </nav>
      )}
    </>
  );
}
