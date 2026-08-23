"use client";

import { useMemo, useState, type DragEvent } from "react";
import { useRouter } from "next/navigation";
import { subirDirecto } from "@/lib/media/subir-directo";
import {
  parseImageFilename,
  matchBySlug,
} from "@/lib/media/convencion-nombres";
import { findMismatched, type ImageDimensions } from "@/lib/media/dimensiones";
import { leerArchivosSoltados } from "./_lib/leer-carpeta";
import { leerDimensiones } from "./_lib/leer-dimensiones";
import { EstadoBadge } from "../../../_EstadoBadge";

type View = "front" | "side" | "back";

interface ComponenteConColores {
  id: string;
  nameEs: string;
  colores: { id: string; nameEs: string }[];
}

interface Cargada {
  componentId: string;
  colorId: string;
  view: View;
}

type Estado =
  | { fase: "vacio" }
  | { fase: "leyendo" }
  | {
      fase: "listo";
      matched: (File & { _dims?: ImageDimensions })[];
      resueltos: {
        file: File;
        componentId: string;
        colorId: string;
        view: View;
        dims: ImageDimensions;
      }[];
      sinAsignar: File[];
      conDimensionDistinta: File[];
    }
  | { fase: "subiendo"; progreso: number; total: number }
  | { fase: "hecho"; subidas: number };

export function CargaMasiva({
  modelId,
  activeViews,
  componentes,
  cargadas,
  expected,
  labels,
}: {
  modelId: string;
  activeViews: View[];
  componentes: ComponenteConColores[];
  cargadas: Cargada[];
  expected: ImageDimensions | null;
  labels: Record<string, string>;
}) {
  const router = useRouter();
  const [estado, setEstado] = useState<Estado>({ fase: "vacio" });

  const cargadasSet = useMemo(
    () => new Set(cargadas.map((c) => `${c.componentId}:${c.colorId}:${c.view}`)),
    [cargadas],
  );

  const matriz = useMemo(() => {
    const pendientesEnLote = new Set(
      estado.fase === "listo"
        ? estado.resueltos.map((r) => `${r.componentId}:${r.colorId}:${r.view}`)
        : [],
    );
    return componentes.flatMap((comp) =>
      comp.colores.flatMap((col) =>
        activeViews.map((view) => {
          const key = `${comp.id}:${col.id}:${view}`;
          const estadoCelda = cargadasSet.has(key)
            ? "cargada"
            : pendientesEnLote.has(key)
              ? "pendiente"
              : "faltante";
          return {
            key,
            componentName: comp.nameEs,
            colorName: col.nameEs,
            view,
            estadoCelda,
          };
        }),
      ),
    );
  }, [componentes, activeViews, cargadasSet, estado]);

  const faltantes = matriz.filter((m) => m.estadoCelda === "faltante");

  async function procesarArchivos(files: File[]) {
    setEstado({ fase: "leyendo" });

    const resueltos: {
      file: File;
      componentId: string;
      colorId: string;
      view: View;
      dims: ImageDimensions;
    }[] = [];
    const sinAsignar: File[] = [];

    for (const file of files) {
      const parsed = parseImageFilename(file.name);
      if (!parsed) {
        sinAsignar.push(file);
        continue;
      }
      let matchedComponentId: string | null = null;
      let matchedColorId: string | null = null;
      for (const comp of componentes) {
        const compMatch = matchBySlug(parsed.componentSlug, [comp]);
        if (!compMatch) continue;
        const colorMatch = matchBySlug(parsed.colorSlug, comp.colores);
        if (colorMatch) {
          matchedComponentId = comp.id;
          matchedColorId = colorMatch.id;
          break;
        }
      }
      if (!matchedComponentId || !matchedColorId) {
        sinAsignar.push(file);
        continue;
      }
      try {
        const dims = await leerDimensiones(file);
        resueltos.push({
          file,
          componentId: matchedComponentId,
          colorId: matchedColorId,
          view: parsed.view,
          dims,
        });
      } catch {
        sinAsignar.push(file);
      }
    }

    const { mismatched } = findMismatched(
      resueltos.map((r) => r.dims),
      expected,
    );
    const mismatchedSet = new Set(mismatched);
    const conDimensionDistinta = resueltos
      .filter((r) => mismatchedSet.has(r.dims))
      .map((r) => r.file);
    const validos = resueltos.filter((r) => !mismatchedSet.has(r.dims));

    setEstado({
      fase: "listo",
      matched: [],
      resueltos: validos,
      sinAsignar,
      conDimensionDistinta,
    });
  }

  async function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    const files = await leerArchivosSoltados(event.dataTransfer);
    await procesarArchivos(files.filter((f) => f.type.startsWith("image/")));
  }

  async function subir() {
    if (estado.fase !== "listo") return;
    const { resueltos } = estado;
    setEstado({ fase: "subiendo", progreso: 0, total: resueltos.length });

    const subidos: {
      componentId: string;
      colorId: string;
      view: View;
      url: string;
      width: number;
      height: number;
    }[] = [];

    let progreso = 0;
    for (const item of resueltos) {
      const url = await subirDirecto(
        "/api/panel/subidas/presignar",
        `modelos/${modelId}/${item.view}_${item.componentId}_${item.colorId}-${Date.now()}`,
        item.file,
        item.file.type,
      );
      subidos.push({
        componentId: item.componentId,
        colorId: item.colorId,
        view: item.view,
        url,
        width: item.dims.width,
        height: item.dims.height,
      });
      progreso += 1;
      setEstado({ fase: "subiendo", progreso, total: resueltos.length });
    }

    const response = await fetch(`/api/panel/modelos/${modelId}/imagenes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ images: subidos }),
    });

    if (response.ok) {
      setEstado({ fase: "hecho", subidas: subidos.length });
      router.refresh();
    } else {
      setEstado({
        fase: "listo",
        matched: [],
        resueltos,
        sinAsignar: estado.fase === "listo" ? estado.sinAsignar : [],
        conDimensionDistinta:
          estado.fase === "listo" ? estado.conDimensionDistinta : [],
      });
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()}
        className="flex flex-col items-center gap-2 rounded-lg border-2 border-dashed border-outline-variant bg-surface-container-lowest p-10 text-center font-body-md text-body-md text-on-surface-variant"
      >
        <p>{labels.dropHere}</p>
        <input
          type="file"
          multiple
          // @ts-expect-error -- atributo no estándar, soportado por Chrome/Safari
          webkitdirectory=""
          directory=""
          onChange={(e) =>
            procesarArchivos(Array.from(e.target.files ?? []))
          }
        />
      </div>

      {estado.fase === "leyendo" && (
        <p className="font-body-md text-body-md text-on-surface-variant">{labels.reading}</p>
      )}

      {estado.fase === "listo" && (
        <div className="flex flex-col gap-4">
          <p className="font-body-md text-body-md text-on-surface">
            {labels.matchedCount.replace(
              "{{n}}",
              String(estado.resueltos.length),
            )}
          </p>
          {estado.conDimensionDistinta.length > 0 && (
            <div className="rounded-lg border border-error/30 bg-error-container p-4">
              <p className="font-semibold text-on-error-container">
                {labels.dimensionMismatch}
              </p>
              <ul className="list-inside list-disc font-body-md text-body-md text-on-error-container">
                {estado.conDimensionDistinta.map((f) => (
                  <li key={f.name}>{f.name}</li>
                ))}
              </ul>
            </div>
          )}
          {estado.sinAsignar.length > 0 && (
            <div className="rounded-lg border border-[#F5E39A] bg-[#FFF8E1] p-4">
              <p className="font-semibold text-[#8D6E00]">{labels.unmatched}</p>
              <ul className="list-inside list-disc font-body-md text-body-md text-[#8D6E00]">
                {estado.sinAsignar.map((f) => (
                  <li key={f.name}>{f.name}</li>
                ))}
              </ul>
            </div>
          )}
          <button
            type="button"
            onClick={subir}
            disabled={estado.resueltos.length === 0}
            className="w-fit rounded bg-on-surface px-6 py-2 font-button text-button text-on-primary transition-colors duration-200 hover:bg-primary disabled:opacity-50"
          >
            {labels.upload}
          </button>
        </div>
      )}

      {estado.fase === "subiendo" && (
        <p className="font-body-md text-body-md text-on-surface-variant">
          {labels.uploading} {estado.progreso}/{estado.total}
        </p>
      )}

      {estado.fase === "hecho" && (
        <p className="font-body-md text-body-md text-[#2E7D32]">
          {labels.done.replace("{{n}}", String(estado.subidas))}
        </p>
      )}

      <div className="overflow-hidden rounded-lg border border-outline-variant/60 bg-surface-container-lowest ambient-shadow">
        <h2 className="border-b border-outline-variant/30 px-6 py-4 font-body-md text-body-md font-semibold text-on-surface">
          {labels.matrixTitle}
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead className="border-b border-outline-variant/30">
              <tr>
                <th className="px-6 py-3 text-label-caps font-label-caps text-on-surface-variant">
                  {labels.component}
                </th>
                <th className="px-6 py-3 text-label-caps font-label-caps text-on-surface-variant">
                  {labels.color}
                </th>
                <th className="px-6 py-3 text-label-caps font-label-caps text-on-surface-variant">
                  {labels.view}
                </th>
                <th className="px-6 py-3 text-label-caps font-label-caps text-on-surface-variant">
                  {labels.status}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {matriz.map((row) => (
                <tr key={row.key}>
                  <td className="px-6 py-2 font-body-md text-body-md text-on-surface">
                    {row.componentName}
                  </td>
                  <td className="px-6 py-2 font-body-md text-body-md text-on-surface">
                    {row.colorName}
                  </td>
                  <td className="px-6 py-2 font-body-md text-body-md text-on-surface">
                    {row.view}
                  </td>
                  <td className="px-6 py-2">
                    {row.estadoCelda === "cargada" && (
                      <EstadoBadge label={labels.loaded} tone="success" />
                    )}
                    {row.estadoCelda === "pendiente" && (
                      <EstadoBadge label={labels.pending} tone="neutral" />
                    )}
                    {row.estadoCelda === "faltante" && (
                      <EstadoBadge label={labels.missing} tone="danger" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {faltantes.length === 0 && matriz.length > 0 && (
          <p className="border-t border-outline-variant/30 px-6 py-3 font-body-md text-body-md text-[#2E7D32]">
            {labels.allLoaded}
          </p>
        )}
      </div>
    </div>
  );
}
