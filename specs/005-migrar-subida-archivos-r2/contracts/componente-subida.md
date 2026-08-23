# Contrato: componente reutilizable de subida de un solo archivo

Cubre FR-002, FR-003, FR-004, FR-005, FR-006 y las historias de usuario 1 y 2 de la spec. Usado por
`_ColorForm.tsx` (imagen de muestra del color) y `_VistasForm.tsx` (imagen base de cada vista de
modelo). No se usa en `_CargaMasiva.tsx` (FR-012, flujo propio de lote).

## Estados

```text
idle (sin archivo local; puede mostrar currentUrl si la entidad ya tenía imagen)
  │  selecciona archivo
  ▼
seleccionado (vista previa local, NO subido)
  │  cambia de archivo → vuelve a "seleccionado" con el nuevo archivo
  │  presiona "Subir"
  ▼
subiendo (botón deshabilitado, indicador de progreso)
  │
  ├─ éxito → alerta de éxito, onUploaded(publicUrl), vuelve a "idle" mostrando la nueva imagen
  │
  └─ error → alerta de error, permite "Reintentar" (vuelve a "subiendo" con el mismo archivo)
             o "Cambiar archivo" (vuelve a "seleccionado"/"idle")
```

- Ningún estado intermedio (`seleccionado`, `subiendo`, `error`) escribe `onUploaded`; solo el
  estado `éxito` lo hace, y solo entonces el formulario contenedor puede considerar la imagen lista
  para guardarse (FR-005, FR-006).

## Props (contrato de interfaz)

```ts
interface SubidaArchivoProps {
  /** Ruta de la API de presigner a usar: admin o público (ver contracts/subidas-presignadas.md) */
  presignEndpoint: string;
  /** Prefijo/convención de pathname para este flujo, p. ej. "colores" o `modelos/${modelId}` */
  pathPrefix: string;
  /** MIME permitidos, para el <input accept> y la validación previa en cliente */
  accept: string[];
  /** Tamaño máximo en bytes, para rechazar antes de intentar subir */
  maxSizeBytes?: number;
  /** URL actual de la entidad, si ya tiene una imagen guardada */
  currentUrl?: string;
  /** Se invoca solo tras una subida exitosa, con la URL pública final y el archivo original
   *  (para que quien llama pueda leer metadatos como ancho/alto sin repetir la selección) */
  onUploaded: (publicUrl: string, file: File) => void;
  /** Notifica cada cambio de estado; el formulario contenedor lo usa para bloquear su propio
   *  guardado mientras el estado sea "subiendo" o "error" (FR-006) */
  onStatusChange?: (status: "idle" | "seleccionado" | "subiendo" | "error") => void;
  /** Textos ya traducidos (Principio II): seleccionar, subir, subiendo, éxito, error, reintentar */
  labels: Record<string, string>;
}
```

## Comportamiento observable (para `quickstart.md`)

1. Seleccionar un archivo válido muestra su vista previa inmediatamente, sin ninguna llamada de
   red.
2. El botón "Subir" solo está habilitado cuando hay un archivo seleccionado sin subir.
3. Al presionar "Subir" con éxito, aparece una alerta de éxito y la vista previa pasa a ser la
   imagen ya guardada.
4. Al presionar "Subir" con un archivo que provoca un error (tipo no permitido, fallo de red, etc.),
   aparece una alerta de error con un texto entendible, sin perder la vista previa ni bloquear un
   reintento.
5. Mientras la subida está en curso, el botón se deshabilita para evitar una segunda subida
   simultánea del mismo archivo (edge case de la spec).
