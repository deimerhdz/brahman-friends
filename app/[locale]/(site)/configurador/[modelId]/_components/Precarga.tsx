"use client";

import { useEffect, useState } from "react";
import type { ModelManifest } from "@/lib/catalogo/model-manifest";

/**
 * Descarga en segundo plano el resto de vistas y colores, y expone qué
 * imágenes ya están listas para que el indicador de progreso sea por
 * componente, no del configurador entero (FR-031, FR-031a, FR-031b, SC-008).
 */
export function usePrecarga(
  manifest: ModelManifest,
  priorityUrls: readonly string[],
): { readyUrls: Set<string>; loaded: number; total: number } {
  const [readyUrls, setReadyUrls] = useState<Set<string>>(
    () => new Set(priorityUrls),
  );

  useEffect(() => {
    const all = new Set<string>();
    for (const url of Object.values(manifest.baseImages)) {
      if (url) all.add(url);
    }
    for (const color of manifest.colors) {
      for (const url of Object.values(color.images)) {
        if (url) all.add(url);
      }
    }

    const rest = [...all].filter((url) => !priorityUrls.includes(url));
    const ordered = [...priorityUrls, ...rest];

    let cancelled = false;
    setReadyUrls((prev) => {
      const next = new Set(prev);
      for (const url of priorityUrls) next.add(url);
      return next;
    });

    (async () => {
      for (const url of ordered) {
        if (cancelled) return;
        await preload(url);
        if (cancelled) return;
        setReadyUrls((prev) => {
          if (prev.has(url)) return prev;
          const next = new Set(prev);
          next.add(url);
          return next;
        });
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [manifest]);

  const total =
    Object.values(manifest.baseImages).filter(Boolean).length +
    manifest.colors.reduce((sum, c) => sum + Object.keys(c.images).length, 0);

  return { readyUrls, loaded: readyUrls.size, total };
}

function preload(url: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => resolve();
    img.src = url;
  });
}
