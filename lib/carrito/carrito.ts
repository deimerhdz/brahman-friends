/**
 * Carrito de consulta por WhatsApp (011-rediseno-paleta-inicio, data-model.md,
 * constitution 2.1.0): solo productos fijos, vive en el navegador y nunca se
 * envía al servidor. Estas funciones son puras para poder probarlas.
 */
export type LineaCarrito = {
  clave: string;
  modelId: string;
  nombre: string;
  imagenUrl: string | null;
  // Vacío para productos fijos, que no tienen colores (009-modelos-producto-fijo).
  color: string;
  cantidad: number;
};

export type AccionCarrito =
  | { tipo: "agregar"; linea: Omit<LineaCarrito, "clave" | "cantidad"> }
  | { tipo: "cambiarCantidad"; clave: string; delta: number }
  | { tipo: "eliminar"; clave: string }
  | { tipo: "vaciar" };

export function claveLinea(modelId: string, color: string): string {
  return `${modelId}:${color}`;
}

export function reducirCarrito(
  lineas: LineaCarrito[],
  accion: AccionCarrito,
): LineaCarrito[] {
  switch (accion.tipo) {
    case "agregar": {
      const clave = claveLinea(accion.linea.modelId, accion.linea.color);
      return lineas.some((l) => l.clave === clave)
        ? lineas.map((l) =>
            l.clave === clave ? { ...l, cantidad: l.cantidad + 1 } : l,
          )
        : [...lineas, { ...accion.linea, clave, cantidad: 1 }];
    }
    case "cambiarCantidad":
      return lineas
        .map((l) =>
          l.clave === accion.clave
            ? { ...l, cantidad: l.cantidad + accion.delta }
            : l,
        )
        .filter((l) => l.cantidad > 0);
    case "eliminar":
      return lineas.filter((l) => l.clave !== accion.clave);
    case "vaciar":
      return [];
  }
}

export function totalUnidades(lineas: LineaCarrito[]): number {
  return lineas.reduce((total, l) => total + l.cantidad, 0);
}

/** Mensaje de WhatsApp: encabezado + `• cantidad × nombre — color` por línea (contracts §2). */
export function mensajeCarrito(
  encabezado: string,
  lineas: LineaCarrito[],
): string {
  const detalle = lineas.map(
    (l) => `• ${l.cantidad} × ${l.nombre}${l.color ? ` — ${l.color}` : ""}`,
  );
  return [encabezado, ...detalle].join("\n");
}

/** Lee el carrito guardado; cualquier dato inválido se descarta. */
export function leerCarritoGuardado(json: string | null): LineaCarrito[] {
  if (!json) return [];
  try {
    const valor: unknown = JSON.parse(json);
    if (!Array.isArray(valor)) return [];
    return valor.filter(
      (l): l is LineaCarrito =>
        typeof l === "object" &&
        l !== null &&
        typeof l.clave === "string" &&
        typeof l.modelId === "string" &&
        typeof l.nombre === "string" &&
        typeof l.color === "string" &&
        (typeof l.imagenUrl === "string" || l.imagenUrl === null) &&
        Number.isInteger(l.cantidad) &&
        l.cantidad > 0,
    );
  } catch {
    return [];
  }
}
