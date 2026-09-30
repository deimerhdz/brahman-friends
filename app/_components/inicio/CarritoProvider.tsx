"use client";

import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import {
  leerCarritoGuardado,
  reducirCarrito,
  type LineaCarrito,
} from "@/lib/carrito/carrito";

// La visita dura lo que dura la pestaña: sessionStorage (research.md #5).
const CLAVE_ALMACENAMIENTO = "bf-carrito-v1";

type ContextoCarrito = {
  lineas: LineaCarrito[];
  abierto: boolean;
  abrir: () => void;
  cerrar: () => void;
  agregar: (linea: Omit<LineaCarrito, "clave" | "cantidad">) => void;
  cambiarCantidad: (clave: string, delta: number) => void;
  eliminar: (clave: string) => void;
};

const Carrito = createContext<ContextoCarrito | null>(null);

type Accion =
  | Parameters<typeof reducirCarrito>[1]
  | { tipo: "cargar"; lineas: LineaCarrito[] };

function reductor(lineas: LineaCarrito[], accion: Accion): LineaCarrito[] {
  return accion.tipo === "cargar"
    ? accion.lineas
    : reducirCarrito(lineas, accion);
}

export function CarritoProvider({ children }: { children: React.ReactNode }) {
  const [lineas, despachar] = useReducer(reductor, []);
  const [abierto, setAbierto] = useState(false);
  const cargado = useRef(false);

  useEffect(() => {
    try {
      despachar({
        tipo: "cargar",
        lineas: leerCarritoGuardado(
          sessionStorage.getItem(CLAVE_ALMACENAMIENTO),
        ),
      });
    } catch {
      // Almacenamiento bloqueado: el carrito sigue funcionando en memoria.
    }
  }, []);

  useEffect(() => {
    // La primera ejecución todavía ve el carrito vacío inicial: no debe
    // pisar lo guardado antes de que se cargue.
    if (!cargado.current) {
      cargado.current = true;
      return;
    }
    try {
      sessionStorage.setItem(CLAVE_ALMACENAMIENTO, JSON.stringify(lineas));
    } catch {
      // Igual que arriba: sin almacenamiento, solo memoria.
    }
  }, [lineas]);

  const valor: ContextoCarrito = {
    lineas,
    abierto,
    abrir: () => setAbierto(true),
    cerrar: () => setAbierto(false),
    agregar: (linea) => {
      despachar({ tipo: "agregar", linea });
      setAbierto(true);
    },
    cambiarCantidad: (clave, delta) =>
      despachar({ tipo: "cambiarCantidad", clave, delta }),
    eliminar: (clave) => despachar({ tipo: "eliminar", clave }),
  };

  return <Carrito.Provider value={valor}>{children}</Carrito.Provider>;
}

export function useCarrito(): ContextoCarrito {
  const contexto = useContext(Carrito);
  if (!contexto) throw new Error("useCarrito necesita un CarritoProvider");
  return contexto;
}
