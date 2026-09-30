"use client";

import { useEffect } from "react";
import Image from "next/image";
import { useCarrito } from "@/app/_components/inicio/CarritoProvider";
import { enlaceWhatsApp } from "@/lib/ajustes/whatsapp";
import { mensajeCarrito, totalUnidades } from "@/lib/carrito/carrito";
import { FaArrowRight, FaBagShopping, FaMinus, FaPlus, FaTrashCan, FaXmark } from "react-icons/fa6";

export type TextosCarrito = {
  eyebrow: string;
  titulo: string;
  etiqueta: string;
  cerrar: string;
  vacio: string;
  vacioSub: string;
  verColeccion: string;
  precioPorConfirmar: string;
  // Plantillas con {{name}}
  quitarUno: string;
  anadirUno: string;
  eliminar: string;
  aviso: string;
  enviar: string;
  sinWhatsapp: string;
  mensaje: string;
};

const conNombre = (plantilla: string, nombre: string) =>
  plantilla.replaceAll("{{name}}", nombre);

// Panel lateral del carrito (FR-019, FR-020, FR-022): envía el pedido por
// WhatsApp; no cobra ni guarda nada en el sistema (constitution 2.1.0).
export function PanelCarrito({
  numero,
  hrefColeccion,
  textos,
}: {
  numero: string | null;
  hrefColeccion: string;
  textos: TextosCarrito;
}) {
  const { lineas, abierto, cerrar, cambiarCantidad, eliminar } = useCarrito();

  useEffect(() => {
    if (!abierto) return;
    const alPulsar = (event: KeyboardEvent) => {
      if (event.key === "Escape") cerrar();
    };
    window.addEventListener("keydown", alPulsar);
    return () => window.removeEventListener("keydown", alPulsar);
  }, [abierto, cerrar]);

  if (!abierto) return null;

  const cantidad = totalUnidades(lineas);
  const botonIcono =
    "flex h-7 w-7 items-center justify-center hover:bg-surface-container";

  return (
    <div className="fixed inset-0 z-50" role="presentation">
      <div className="absolute inset-0 bg-deep/65" onClick={cerrar} />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={textos.etiqueta}
        className="absolute inset-y-0 right-0 flex w-full max-w-[430px] flex-col bg-surface shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-outline-variant px-6 py-6">
          <div>
            <p className="eyebrow">{textos.eyebrow}</p>
            <h2 className="font-display text-2xl font-black uppercase">
              {textos.titulo} <span className="text-primary">({cantidad})</span>
            </h2>
          </div>
          <button
            type="button"
            aria-label={textos.cerrar}
            onClick={cerrar}
            autoFocus
            className="flex h-10 w-10 items-center justify-center rounded-md hover:bg-surface-container"
          >
            <FaXmark className="text-[22px] shrink-0" aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {lineas.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <FaBagShopping className="text-[42px] text-on-surface-variant shrink-0" aria-hidden="true" />
              <h3 className="mt-5 font-display text-xl font-black uppercase">
                {textos.vacio}
              </h3>
              <p className="mt-2 text-sm text-on-surface-variant">
                {textos.vacioSub}
              </p>
              <a
                href={hrefColeccion}
                onClick={cerrar}
                className="mt-6 inline-flex h-10 items-center gap-2 rounded-md border border-on-surface px-4 text-sm font-bold uppercase"
              >
                {textos.verColeccion}
                <FaArrowRight className="text-[16px] shrink-0" aria-hidden="true" />
              </a>
            </div>
          ) : (
            lineas.map((linea) => (
              <div
                key={linea.clave}
                className="flex gap-4 border-b border-outline-variant py-5"
              >
                <div className="relative h-24 w-24 shrink-0 overflow-hidden bg-surface-container">
                  {linea.imagenUrl && (
                    <Image
                      src={linea.imagenUrl}
                      alt={linea.nombre}
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="break-words font-display text-base font-black uppercase">
                    {linea.nombre}
                  </h3>
                  {linea.color && (
                    <p className="mt-1 text-xs text-on-surface-variant">
                      {linea.color}
                    </p>
                  )}
                  <p className="mt-1 text-xs font-bold text-primary">
                    {textos.precioPorConfirmar}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center border border-outline-variant">
                      <button
                        type="button"
                        aria-label={conNombre(textos.quitarUno, linea.nombre)}
                        onClick={() => cambiarCantidad(linea.clave, -1)}
                        className={botonIcono}
                      >
                        <FaMinus className="text-[13px] shrink-0" aria-hidden="true" />
                      </button>
                      <span className="w-6 text-center text-xs">
                        {linea.cantidad}
                      </span>
                      <button
                        type="button"
                        aria-label={conNombre(textos.anadirUno, linea.nombre)}
                        onClick={() => cambiarCantidad(linea.clave, 1)}
                        className={botonIcono}
                      >
                        <FaPlus className="text-[13px] shrink-0" aria-hidden="true" />
                      </button>
                    </div>
                    <button
                      type="button"
                      aria-label={conNombre(textos.eliminar, linea.nombre)}
                      onClick={() => eliminar(linea.clave)}
                      className={`${botonIcono} text-on-surface-variant`}
                    >
                      <FaTrashCan className="text-[15px] shrink-0" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {lineas.length > 0 && (
          <div className="border-t border-outline-variant p-6">
            <p className="mb-4 text-xs leading-relaxed text-on-surface-variant">
              {textos.aviso}
            </p>
            {numero ? (
              <a
                href={enlaceWhatsApp(
                  numero,
                  mensajeCarrito(textos.mensaje, lineas),
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-12 w-full items-center justify-center gap-2 rounded-md bg-primary text-xs font-bold uppercase text-on-primary transition-colors hover:bg-primary/90"
              >
                {textos.enviar}
                <FaArrowRight className="text-[16px] shrink-0" aria-hidden="true" />
              </a>
            ) : (
              <p className="text-sm font-bold text-on-surface">
                {textos.sinWhatsapp}
              </p>
            )}
          </div>
        )}
      </aside>
    </div>
  );
}
