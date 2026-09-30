"use client";

import { useState } from "react";
import Image from "next/image";
import { FaArrowRight, FaCheck, FaUpload } from "react-icons/fa6";

export type TextosVitrina = {
  eyebrow: string;
  titulo: string;
  subtitulo: string;
  // Plantillas con {{color}}
  vistaPrevia: string;
  altVistaPrevia: string;
  paso1: string;
  paso2: string;
  paso3: string;
  paso3Sub: string;
  subir: string;
  casa: string;
  enConfigurador: string;
  cta: string;
  estilos: string[];
  colores: string[];
};

// Fotos y muestras de la referencia, en el mismo orden que `textos.colores`.
const COLORES = [
  { imagen: "/inicio/cap-navy.jpg", muestra: "swatch-navy" },
  { imagen: "/inicio/cap-sand.jpg", muestra: "swatch-sand" },
  { imagen: "/inicio/cap-black.jpg", muestra: "swatch-black" },
  { imagen: "/inicio/cap-camo.jpg", muestra: "swatch-camo" },
];

const conColor = (plantilla: string, color: string) =>
  plantilla.replaceAll("{{color}}", color);

// "Tu hierro. Tu gorra" (FR-023): vitrina del proceso de personalización. El
// estilo y el color solo cambian la vista previa; la personalización real se
// hace en el configurador, al que lleva el único botón activo.
export function VitrinaPersonaliza({
  hrefPersonalizar,
  textos,
}: {
  hrefPersonalizar: string;
  textos: TextosVitrina;
}) {
  const [estilo, setEstilo] = useState(0);
  const [color, setColor] = useState(0);
  const nombreColor = textos.colores[color]!;

  return (
    <section
      id="personaliza"
      className="scroll-mt-24 bg-surface-container px-5 py-20 md:px-10 md:py-24 lg:px-14"
    >
      <div className="mx-auto max-w-[1328px]">
        <div className="mb-10">
          <p className="eyebrow">{textos.eyebrow}</p>
          <h2 className="section-title mt-3">
            {textos.titulo}
            <span className="text-primary">.</span>
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-on-surface-variant md:text-base">
            {textos.subtitulo}
          </p>
        </div>

        <div className="grid gap-9 lg:grid-cols-[1.05fr_.95fr] lg:gap-16">
          <div className="relative flex min-h-[350px] items-center justify-center overflow-hidden bg-preview md:min-h-[530px]">
            <Image
              src={COLORES[color]!.imagen}
              alt={conColor(textos.altVistaPrevia, nombreColor)}
              width={600}
              height={600}
              loading="lazy"
              className="h-full w-full max-w-[590px] object-contain"
            />
            <span className="absolute left-5 top-5 bg-surface px-3 py-2 text-[10px] font-bold uppercase text-on-surface">
              {conColor(textos.vistaPrevia, nombreColor)}
            </span>
            <span className="absolute bottom-5 right-5 bg-deep px-3 py-2 text-[10px] font-bold uppercase text-on-deep">
              {textos.estilos[estilo]}
            </span>
          </div>

          <div className="flex flex-col justify-center">
            <div className="border-b border-outline-variant pb-7">
              <h3 className="flex items-center gap-3 text-sm font-black uppercase">
                <span className="step-number">01</span> {textos.paso1}
              </h3>
              <div className="mt-5 grid grid-cols-3 gap-2">
                {textos.estilos.map((nombre, indice) => (
                  <button
                    key={nombre}
                    type="button"
                    aria-pressed={estilo === indice}
                    onClick={() => setEstilo(indice)}
                    className={`min-h-16 rounded-sm border px-2 py-3 text-center text-[11px] font-bold uppercase leading-tight transition-colors ${
                      estilo === indice
                        ? "border-on-surface bg-on-surface text-surface"
                        : "border-outline-variant bg-surface hover:border-on-surface"
                    }`}
                  >
                    {nombre}
                  </button>
                ))}
              </div>
            </div>

            <div className="border-b border-outline-variant py-7">
              <h3 className="flex items-center gap-3 text-sm font-black uppercase">
                <span className="step-number">02</span> {textos.paso2}
              </h3>
              <div className="mt-5 flex flex-wrap gap-3">
                {textos.colores.map((nombre, indice) => (
                  <button
                    key={nombre}
                    type="button"
                    aria-pressed={color === indice}
                    onClick={() => setColor(indice)}
                    className={`flex h-10 items-center gap-2 rounded-sm border bg-surface px-3 text-[11px] font-bold transition-colors ${
                      color === indice
                        ? "border-on-surface"
                        : "border-outline-variant"
                    }`}
                  >
                    <span
                      className={`h-4 w-4 rounded-full ${COLORES[indice]!.muestra}`}
                    />
                    {nombre}
                  </button>
                ))}
              </div>
            </div>

            <div className="py-7">
              <h3 className="flex items-center gap-3 text-sm font-black uppercase">
                <span className="step-number">03</span> {textos.paso3}
              </h3>
              <p className="ml-11 mt-2 text-xs text-on-surface-variant">
                {textos.paso3Sub}
              </p>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="flex h-16 items-center justify-center gap-2 rounded-sm border border-dashed border-outline-variant px-3 text-center text-xs font-bold uppercase">
                  <FaUpload className="text-[17px] shrink-0" aria-hidden="true" />
                  {textos.subir}
                </div>
                <div className="flex h-16 items-center justify-center gap-2 rounded-sm border border-outline-variant px-3 text-center text-xs font-bold uppercase">
                  <FaCheck className="text-[17px] shrink-0" aria-hidden="true" />
                  {textos.casa}
                </div>
              </div>
              <p className="mt-3 text-xs text-on-surface-variant">
                {textos.enConfigurador}
              </p>
            </div>

            <a
              href={hrefPersonalizar}
              className="flex h-12 items-center justify-center gap-2 rounded-md bg-primary px-4 text-xs font-bold uppercase text-on-primary transition-colors hover:bg-primary/90"
            >
              {textos.cta}
              <FaArrowRight className="text-[16px] shrink-0" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
