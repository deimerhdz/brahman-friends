"use client";

import { useCarrito } from "@/app/_components/inicio/CarritoProvider";
import { totalUnidades } from "@/lib/carrito/carrito";
import { FaBagShopping } from "react-icons/fa6";

// Botón del carrito del encabezado con contador de unidades (FR-019, FR-020).
export function BotonCarrito({ etiqueta }: { etiqueta: string }) {
  const { lineas, abrir } = useCarrito();
  const cantidad = totalUnidades(lineas);

  return (
    <button
      type="button"
      onClick={abrir}
      aria-label={etiqueta.replaceAll("{{count}}", String(cantidad))}
      className="relative flex h-10 w-10 items-center justify-center rounded-md transition-colors hover:bg-surface-container"
    >
      <FaBagShopping className="text-[20px] shrink-0" aria-hidden="true" />
      {cantidad > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-0.5 text-[9px] font-bold text-on-primary">
          {cantidad}
        </span>
      )}
    </button>
  );
}
