# Phase 1 Data Model: Migración de subida de archivos a Cloudflare R2

No se agregan ni modifican tablas, columnas ni migraciones de base de datos. Todas las entidades
que referencian un archivo ya lo hacen mediante una columna de texto con la URL pública; una URL de
Cloudflare R2 es un valor igual de válido que una de Vercel Blob para esas columnas. Esta sección
documenta, para cada entidad ya existente en `lib/db/schema.ts`, cómo se relaciona con el archivo
que sube esta funcionalidad.

## Entidades y su relación con el archivo subido

### Color (`color`)

- **Representa**: un color de tela disponible para las gorras.
- **Campo de archivo**: `sample_image_url` (`text`, `NOT NULL`) — imagen de muestra del color.
- **Ciclo de vida del archivo**: la persona administradora selecciona una imagen en el componente
  reutilizable de subida; solo tras confirmar el botón "Subir" y recibir éxito, el valor queda en
  el estado del formulario (`ColorForm`) y se persiste al guardar el color (alta o edición), igual
  que hoy.
- **Reemplazo**: subir una nueva imagen sobre un color existente reemplaza el valor de
  `sample_image_url`; la URL anterior deja de estar referenciada por esta entidad (no se borra el
  objeto en el almacenamiento como parte de este alcance, igual que el comportamiento actual).

### Vista de modelo (`model_view`)

- **Representa**: la imagen base de una de las vistas (`front`, `side`, `back`) de un modelo de
  gorra. Clave primaria compuesta `(model_id, view)`.
- **Campo de archivo**: `base_image_url` (`text`, nullable — una vista puede estar activa sin
  imagen aún).
- **Ciclo de vida del archivo**: `VistasForm` sube la imagen con el componente reutilizable y, a
  diferencia de `Color`, persiste inmediatamente el resultado llamando a
  `POST /api/panel/modelos/[id]/vistas` en cuanto la subida confirma éxito (comportamiento ya
  existente, no cambia).

### Imagen de componente / carga masiva (`component_image`)

- **Representa**: la imagen de un componente de un modelo, en un color y vista específicos,
  subida individualmente o en lote durante la carga masiva.
- **Campo de archivo**: `image_url` (`text`, `NOT NULL`), junto con `width`/`height` ya calculados
  en el cliente antes de subir.
- **Ciclo de vida del archivo**: sin cambios de flujo (FR-012); `_CargaMasiva.tsx` sigue resolviendo
  el lote completo (parseo de nombre de archivo, coincidencia por componente/color/vista, revisión
  en matriz) y solo cambia el endpoint que usa para obtener el destino de subida.

### Vista compuesta de solicitud (`request_image`)

- **Representa**: la imagen final compuesta de una vista del diseño que un cliente personalizó,
  generada y subida automáticamente al enviar una solicitud de cotización.
- **Campo de archivo**: `image_url` (`text`, `NOT NULL`).
- **Ciclo de vida del archivo**: `subir-vistas.ts` compone cada vista (`composeView`) y la sube
  antes de registrar la solicitud (`POST /api/solicitudes`); sin cambios de flujo, solo cambia el
  endpoint de presigner.

### Logotipo del cliente (`logo_asset`) — infraestructura compartida, sin cambio de flujo

- **Representa**: el logotipo que un cliente anónimo sube durante la personalización, saneado
  (SVG) y analizado (resolución, transparencia) en el servidor antes de guardarse.
- **Campo de archivo**: `url` (`text`, `NOT NULL`).
- **Ciclo de vida del archivo**: sin cambios visibles — `/api/logos` sigue recibiendo el archivo
  completo y llamando a `uploadPublicFile` de `lib/media/storage.ts`; esta migración solo cambia lo
  que esa función hace internamente (R2 en vez de Vercel Blob). Se documenta aquí porque comparte
  la misma capa de almacenamiento que las demás entidades y porque `deletePublicFile` (usado por
  `/api/panel/solicitudes/[id]/anonimizar` y `/api/cron/retencion` para borrar logotipos) también
  pasa a operar sobre R2.

## Convención de rutas de objeto (keys) en R2

Se conserva la misma convención de nombres que ya usa cada flujo con Vercel Blob, para no perder
legibilidad ni trazabilidad al depurar:

| Flujo | Convención actual (Vercel Blob) | Convención en R2 |
|---|---|---|
| Color | `colores/{timestamp}-{nombre-archivo}` | igual |
| Vista de modelo | `modelos/{modelId}/base-{view}-{timestamp}-{nombre-archivo}` | igual |
| Carga masiva | (definida dentro de `_CargaMasiva.tsx`, por componente/color/vista) | igual |
| Vista de solicitud | `solicitudes/{timestamp}-{view}.png` | igual |
| Logotipo | `logos/{timestamp}-{uuid}.{extensión}` | igual |

## Sin transiciones de estado a nivel de datos

Ninguna de estas entidades introduce una máquina de estados nueva en base de datos. El único
"estado" de este alcance (`idle` / `seleccionado` / `subiendo` / `éxito` / `error`) vive
exclusivamente en el cliente, dentro del componente reutilizable de subida — ver
[contracts/componente-subida.md](./contracts/componente-subida.md) — y nunca se persiste.
