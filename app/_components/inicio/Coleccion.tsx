"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { formatUsd } from "@/lib/catalogo/precio";
import { useCarrito } from "@/app/_components/inicio/CarritoProvider";
import { FaArrowRight, FaBagShopping, FaMagnifyingGlass, FaXmark } from "react-icons/fa6";

export type ColorTarjeta = { id: string; name: string; imageUrl: string };

export type TarjetaColeccion = {
  id: string;
  name: string;
  type: "configurable" | "fixed_product";
  frontImageUrl: string | null;
  // Solo un producto fijo trae precio (009-modelos-producto-fijo).
  price: string | null;
  href: string;
  // Solo modelos configurables: colores con foto frontal propia (research.md #7).
  colores: ColorTarjeta[];
};

export type TextosColeccion = {
  eyebrow: string;
  titulo: string;
  subtitulo: string;
  contador: string;
  filtros: string;
  filtroTodos: string;
  filtroPersonalizables: string;
  filtroListos: string;
  buscarPlaceholder: string;
  buscarEtiqueta: string;
  cerrarBusqueda: string;
  sinResultados: string;
  vacia: string;
  etiquetaPersonalizable: string;
  etiquetaListo: string;
  cotizar: string;
  personalizar: string;
  anadir: string;
  aviso: string;
  // Plantillas con {{name}} / {{color}}
  colores: string;
  colorDe: string;
  altGorra: string;
};

type Filtro = "todos" | TarjetaColeccion["type"];

const botonAccion =
  "mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-md bg-primary text-xs font-bold uppercase text-on-primary transition-colors hover:bg-primary/90";

function normalizar(texto: string): string {
  return texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

function rellenar(plantilla: string, valores: Record<string, string>): string {
  return Object.entries(valores).reduce(
    (texto, [clave, valor]) => texto.replaceAll(`{{${clave}}}`, valor),
    plantilla,
  );
}

// "Nuestra colección" de la portada (FR-013 a FR-018): modelos publicados,
// pestañas por tipo y buscador que abre la lupa del encabezado (?buscar=1).
export function Coleccion({
  modelos,
  textos,
}: {
  modelos: TarjetaColeccion[];
  textos: TextosColeccion;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { agregar } = useCarrito();
  const buscadorVisible = useSearchParams().get("buscar") === "1";
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [busqueda, setBusqueda] = useState("");
  const [colorElegido, setColorElegido] = useState<Record<string, string>>({});

  const termino = buscadorVisible ? normalizar(busqueda.trim()) : "";
  const visibles = modelos.filter(
    (modelo) =>
      (filtro === "todos" || modelo.type === filtro) &&
      normalizar(modelo.name).includes(termino),
  );

  const filtros: { valor: Filtro; label: string }[] = [
    { valor: "todos", label: textos.filtroTodos },
    { valor: "configurable", label: textos.filtroPersonalizables },
    { valor: "fixed_product", label: textos.filtroListos },
  ];

  function cerrarBuscador() {
    setBusqueda("");
    router.replace(`${pathname}#colecciones`, { scroll: false });
  }

  return (
    <section
      id="colecciones"
      className="scroll-mt-24 px-5 py-20 md:px-10 md:py-24 lg:px-14"
    >
      <div className="mx-auto max-w-[1328px]">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="eyebrow">{textos.eyebrow}</p>
            <h2 className="section-title mt-3">
              {textos.titulo}
              <span className="text-primary">.</span>
            </h2>
            <p className="mt-3 text-sm text-on-surface-variant md:text-base">
              {textos.subtitulo}
            </p>
          </div>
          <span className="text-xs font-bold uppercase text-on-surface-variant">
            {textos.contador}
          </span>
        </div>

        {buscadorVisible && (
          <div className="mt-8 flex max-w-lg items-center gap-3 border-b-2 border-on-surface pb-2">
            <FaMagnifyingGlass className="text-[19px] shrink-0" aria-hidden="true" />
            <input
              autoFocus
              className="w-full bg-transparent text-sm outline-none placeholder:text-on-surface-variant"
              placeholder={textos.buscarPlaceholder}
              aria-label={textos.buscarEtiqueta}
              value={busqueda}
              onChange={(event) => setBusqueda(event.target.value)}
            />
            <button
              type="button"
              aria-label={textos.cerrarBusqueda}
              onClick={cerrarBuscador}
              className="flex h-9 w-9 items-center justify-center rounded-md hover:bg-surface-container"
            >
              <FaXmark className="text-[18px] shrink-0" aria-hidden="true" />
            </button>
          </div>
        )}

        {modelos.length === 0 ? (
          <p className="mt-10 text-on-surface-variant">{textos.vacia}</p>
        ) : (
          <>
            <div
              className="mt-10 flex gap-2 overflow-x-auto pb-3 md:gap-6"
              role="tablist"
              aria-label={textos.filtros}
            >
              {filtros.map(({ valor, label }) => (
                <button
                  key={valor}
                  type="button"
                  role="tab"
                  aria-selected={filtro === valor}
                  onClick={() => setFiltro(valor)}
                  className={`shrink-0 border-b-2 px-1 pb-3 pt-1 text-[11px] font-bold uppercase transition-colors md:text-xs ${
                    filtro === valor
                      ? "border-primary text-on-surface"
                      : "border-transparent text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {visibles.map((modelo) => {
                const color = modelo.colores.find(
                  (c) => c.id === colorElegido[modelo.id],
                );
                const imagen = color?.imageUrl ?? modelo.frontImageUrl;
                const esFijo = modelo.type === "fixed_product";
                return (
                  <article
                    key={modelo.id}
                    className="group bg-surface-container-lowest"
                  >
                    <div className="relative aspect-[1/1.08] overflow-hidden bg-surface-container">
                      {imagen && (
                        <Image
                          src={imagen}
                          alt={rellenar(textos.altGorra, { name: modelo.name })}
                          fill
                          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      )}
                      <span className="absolute left-3 top-3 bg-deep px-2.5 py-1.5 text-[9px] font-bold uppercase text-on-deep">
                        {esFijo
                          ? textos.etiquetaListo
                          : textos.etiquetaPersonalizable}
                      </span>
                    </div>
                    <div className="pt-5">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="min-w-0 break-words font-display text-xl font-black uppercase">
                          {modelo.name}
                        </h3>
                        <span
                          className={`shrink-0 font-bold uppercase ${
                            esFijo && modelo.price
                              ? "text-sm text-on-surface"
                              : "text-[10px] text-primary"
                          }`}
                        >
                          {esFijo && modelo.price
                            ? formatUsd(modelo.price)
                            : textos.cotizar}
                        </span>
                      </div>
                      {modelo.colores.length > 0 && (
                        <div
                          className="mt-5 flex flex-wrap items-center gap-2"
                          aria-label={rellenar(textos.colores, {
                            name: modelo.name,
                          })}
                        >
                          {modelo.colores.map((opcion) => {
                            const activo = color?.id === opcion.id;
                            return (
                              <button
                                key={opcion.id}
                                type="button"
                                title={opcion.name}
                                aria-label={rellenar(textos.colorDe, {
                                  name: modelo.name,
                                  color: opcion.name,
                                })}
                                aria-pressed={activo}
                                onClick={() =>
                                  setColorElegido((previo) => ({
                                    ...previo,
                                    [modelo.id]: opcion.id,
                                  }))
                                }
                                className={`relative h-7 w-7 overflow-hidden rounded-full border p-0.5 ${
                                  activo
                                    ? "border-on-surface"
                                    : "border-outline-variant"
                                }`}
                              >
                                <span className="relative block h-full w-full overflow-hidden rounded-full">
                                  <Image
                                    src={opcion.imageUrl}
                                    alt=""
                                    fill
                                    sizes="28px"
                                    className="object-cover"
                                  />
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                      {esFijo ? (
                        <button
                          type="button"
                          onClick={() =>
                            agregar({
                              modelId: modelo.id,
                              nombre: modelo.name,
                              imagenUrl: modelo.frontImageUrl,
                              color: "",
                            })
                          }
                          className={botonAccion}
                        >
                          {textos.anadir}
                          <FaBagShopping className="text-[16px] shrink-0" aria-hidden="true" />
                        </button>
                      ) : (
                        <Link href={modelo.href} className={botonAccion}>
                          {textos.personalizar}
                          <FaArrowRight className="text-[16px] shrink-0" aria-hidden="true" />
                        </Link>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>

            {visibles.length === 0 && (
              <p className="py-16 text-center text-on-surface-variant">
                {textos.sinResultados}
              </p>
            )}
          </>
        )}

        <p className="mt-8 text-xs text-on-surface-variant">{textos.aviso}</p>
      </div>
    </section>
  );
}
