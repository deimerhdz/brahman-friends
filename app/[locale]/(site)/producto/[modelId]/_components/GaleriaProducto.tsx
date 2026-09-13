"use client";

import { useState } from "react";

/**
 * Galería de fotos del producto fijo (009-modelos-producto-fijo): una imagen
 * grande con botones de desplazamiento y una tira de miniaturas para saltar
 * directo a una vista. Con una sola foto no se muestran controles.
 */
export function GaleriaProducto({
  photos,
  alt,
}: {
  photos: { view: string; url: string }[];
  alt: string;
}) {
  const [index, setIndex] = useState(0);

  if (photos.length === 0) {
    return (
      <div className="aspect-square w-full rounded-lg border border-gray-200 bg-gray-50" />
    );
  }

  const showControls = photos.length > 1;

  function prev() {
    setIndex((i) => (i - 1 + photos.length) % photos.length);
  }

  function next() {
    setIndex((i) => (i + 1) % photos.length);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square w-full overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photos[index].url}
          alt={alt}
          className="h-full w-full object-cover"
        />
        {showControls && (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="Anterior"
              className="absolute left-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-gray-800 shadow hover:bg-white"
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                <path
                  d="M15 18l-6-6 6-6"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Siguiente"
              className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-gray-800 shadow hover:bg-white"
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                <path
                  d="M9 6l6 6-6 6"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </>
        )}
      </div>

      {showControls && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {photos.map((p, i) => (
            <button
              key={p.view}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={p.view}
              className={`h-16 w-16 shrink-0 overflow-hidden rounded-md border ${
                i === index ? "border-brand" : "border-gray-200"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.url} alt={alt} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
