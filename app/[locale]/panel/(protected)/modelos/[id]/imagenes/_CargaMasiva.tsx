"use client";

import { useMemo, useState, type DragEvent } from "react";
import { useRouter } from "next/navigation";
import { upload } from "@vercel/blob/client";
import {
  parseImageFilename,
  matchBySlug,
} from "@/lib/media/convencion-nombres";
import { findMismatched, type ImageDimensions } from "@/lib/media/dimensiones";
import { leerArchivosSoltados } from "./_lib/leer-carpeta";
import { leerDimensiones } from "./_lib/leer-dimensiones";

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
      const blob = await upload(
        `modelos/${modelId}/${item.view}_${item.componentId}_${item.colorId}-${Date.now()}`,
        item.file,
        { access: "public", handleUploadUrl: "/api/panel/subidas/autorizar" },
      );
      subidos.push({
        componentId: item.componentId,
        colorId: item.colorId,
        view: item.view,
        url: blob.url,
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
        className="flex flex-col items-center gap-2 rounded border-2 border-dashed border-gray-300 p-10 text-center"
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

      {estado.fase === "leyendo" && <p>{labels.reading}</p>}

      {estado.fase === "listo" && (
        <div className="flex flex-col gap-4">
          <p>
            {labels.matchedCount.replace(
              "{{n}}",
              String(estado.resueltos.length),
            )}
          </p>
          {estado.conDimensionDistinta.length > 0 && (
            <div className="rounded border border-red-300 bg-red-50 p-3">
              <p className="font-medium text-red-700">
                {labels.dimensionMismatch}
              </p>
              <ul className="list-inside list-disc text-sm text-red-700">
                {estado.conDimensionDistinta.map((f) => (
                  <li key={f.name}>{f.name}</li>
                ))}
              </ul>
            </div>
          )}
          {estado.sinAsignar.length > 0 && (
            <div className="rounded border border-yellow-300 bg-yellow-50 p-3">
              <p className="font-medium text-yellow-800">{labels.unmatched}</p>
              <ul className="list-inside list-disc text-sm text-yellow-800">
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
            className="w-fit rounded bg-brand px-4 py-2 text-white disabled:opacity-50"
          >
            {labels.upload}
          </button>
        </div>
      )}

      {estado.fase === "subiendo" && (
        <p>
          {labels.uploading} {estado.progreso}/{estado.total}
        </p>
      )}

      {estado.fase === "hecho" && (
        <p className="text-green-700">
          {labels.done.replace("{{n}}", String(estado.subidas))}
        </p>
      )}

      <div>
        <h2 className="mb-2 font-medium">{labels.matrixTitle}</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500">
                <th className="pr-4">{labels.component}</th>
                <th className="pr-4">{labels.color}</th>
                <th className="pr-4">{labels.view}</th>
                <th>{labels.status}</th>
              </tr>
            </thead>
            <tbody>
              {matriz.map((row) => (
                <tr key={row.key} className="border-t border-gray-100">
                  <td className="pr-4 py-1">{row.componentName}</td>
                  <td className="pr-4 py-1">{row.colorName}</td>
                  <td className="pr-4 py-1">{row.view}</td>
                  <td className="py-1">
                    {row.estadoCelda === "cargada" && (
                      <span className="text-green-700">{labels.loaded}</span>
                    )}
                    {row.estadoCelda === "pendiente" && (
                      <span className="text-blue-700">{labels.pending}</span>
                    )}
                    {row.estadoCelda === "faltante" && (
                      <span className="text-red-700">{labels.missing}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {faltantes.length === 0 && matriz.length > 0 && (
          <p className="mt-2 text-green-700">{labels.allLoaded}</p>
        )}
      </div>
    </div>
  );
}
