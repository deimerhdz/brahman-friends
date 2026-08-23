# Phase 0 Research: Migración de subida de archivos a Cloudflare R2

## Contexto de código relevado

- `lib/media/storage.ts` ya es la única capa que envuelve `@vercel/blob` para escritura/borrado
  (`uploadPublicFile`, `deletePublicFile`); la usan `/api/logos` (subida de logotipo del cliente),
  `/api/panel/solicitudes/[id]/anonimizar` y `/api/cron/retencion` (borrado de logotipos).
- Cuatro flujos usan el patrón "token + subida directa desde el navegador" de
  `@vercel/blob/client` (`upload()` en el cliente + `handleUpload()` en el servidor):
  `_ColorForm.tsx`, `_VistasForm.tsx`, `_CargaMasiva.tsx` y `subir-vistas.ts` (vistas compuestas de
  solicitud). Los dos endpoints que autorizan esas subidas son
  `app/api/panel/subidas/autorizar/route.ts` (admin) y `app/api/subidas/autorizar/route.ts`
  (público/anónimo).
- Ninguna tabla de `lib/db/schema.ts` guarda nada distinto de una URL en texto plano para archivos:
  `color.sample_image_url`, `model_view.base_image_url`, `component_image.image_url`,
  `request_image.image_url`, `logo_asset.url`.
- El proyecto se despliega en Vercel (`vercel.json` con crons) y no usa Edge Runtime en ninguna
  ruta de API (`export const runtime = "edge"` no aparece en `app/api`), así que un SDK Node.js
  estándar es compatible en todas las rutas involucradas.
- `next.config.ts` restringe `images.remotePatterns` al hostname público de Vercel Blob; debe
  ampliarse con el hostname público de R2.

## Decisiones

### Decisión: cliente S3-compatible para R2

- **Decision**: usar `@aws-sdk/client-s3` junto con `@aws-sdk/s3-request-presigner` para hablar con
  Cloudflare R2.
- **Rationale**: R2 expone una API compatible con S3 y Cloudflare documenta explícitamente el SDK
  de AWS como la vía recomendada para integrarlo desde un backend Node.js. Permite reemplazar
  `put`/`del` de `@vercel/blob` con `PutObjectCommand`/`DeleteObjectCommand`, y generar URLs
  prefirmadas para subida directa desde el navegador.
- **Alternatives considered**:
  - *Cloudflare Workers R2 bindings*: descartado porque solo están disponibles dentro del runtime
    de Cloudflare Workers, no en una app Next.js corriendo en Vercel.
  - *Llamadas REST manuales a la API S3 de R2*: descartado porque obligaría a implementar a mano la
    firma AWS SigV4, un algoritmo delicado que el SDK ya resuelve de forma probada.

### Decisión: reemplazar el patrón de subida directa por URLs prefirmadas

- **Decision**: los cuatro flujos que hoy usan `@vercel/blob/client` (color, vista de modelo, carga
  masiva, vista compuesta de solicitud) pasan a un patrón equivalente de dos pasos: el navegador
  pide al servidor una URL prefirmada (`PUT`) con las restricciones de tipo/tamaño ya vigentes hoy
  por flujo, y luego sube el archivo directo a R2 con esa URL, sin pasar el archivo por el
  servidor.
- **Rationale**: las funciones serverless de Vercel tienen un límite de tamaño de cuerpo de
  solicitud (~4.5 MB). La carga masiva (hasta ~540 imágenes por lote) y las vistas compuestas del
  configurador deben poder subir directo al almacenamiento igual que hoy; una URL prefirmada de S3
  es el equivalente directo del token de subida directa que ofrecía `@vercel/blob/client`.
- **Alternatives considered**:
  - *Proxyear todos los archivos a través del servidor* (como ya hace `/api/logos`): descartado
    para estos cuatro flujos por el límite de tamaño de Vercel y porque duplicaría innecesariamente
    el ancho de banda del servidor en cargas masivas.

### Decisión: el logotipo del cliente conserva su flujo servidor-proxy

- **Decision**: `/api/logos` sigue recibiendo el archivo completo en el servidor (`FormData`); solo
  cambia la implementación interna de `lib/media/storage.ts` para escribir en R2.
- **Rationale**: ese endpoint sanea SVG (`sanitizeSvg`) y calcula advertencias de resolución/
  transparencia (`readImageInfo`) sobre el archivo en el servidor antes de guardarlo; ese análisis
  necesita el archivo completo en el backend de todos modos. Su tamaño máximo (`MAX_LOGO_MB`,
  5 MB por defecto) está dentro del límite de cuerpo de Vercel.
- **Alternatives considered**:
  - *Mover el logotipo también a subida directa*: descartado porque rompería el saneo de SVG y la
    detección de advertencias, que hoy solo puede ocurrir con el archivo ya en el servidor.

### Decisión: sin cambios de esquema en base de datos

- **Decision**: no se agrega ni modifica ninguna columna/tabla.
- **Rationale**: toda referencia a un archivo ya se guarda como `text` (URL). Una URL de R2 es un
  string igual de válido que uno de Vercel Blob; el cambio de proveedor es transparente para el
  modelo de datos.

### Decisión: bucket público con URLs permanentes (no firmadas)

- **Decision**: los objetos de R2 usados por estos flujos se sirven con acceso público (dominio
  público de R2 o dominio propio conectado al bucket), igual que Vercel Blob hoy.
- **Rationale**: decisión explícita de la persona usuaria en `/speckit-specify` (spec FR-013);
  preserva URLs permanentes sin lógica de refresco y evita restricciones de origen cruzado al
  componer imágenes en el `<canvas>` del configurador.
- **Alternatives considered**: URLs firmadas con expiración — descartada explícitamente por la
  persona usuaria por la complejidad de refrescar enlaces y el riesgo de "manchar" el canvas.

### Decisión: sin migración del histórico de Vercel Blob

- **Decision**: los archivos ya subidos antes de esta migración permanecen en Vercel Blob y sus
  URLs no se tocan.
- **Rationale**: decisión explícita de la persona usuaria (spec FR-011). Implica mantener la cuenta
  de Vercel Blob activa (y su hostname en `images.remotePatterns`) mientras existan URLs antiguas
  en uso; no se necesita ningún script de copia masiva en esta migración.

### Decisión: componente reutilizable de subida de un solo archivo

- **Decision**: un componente cliente único (`SubidaArchivo`) con estados
  `idle → seleccionado (vista previa local) → subiendo → éxito/error`, controlado por props
  (endpoint de presigner, tipos/tamaño permitidos, `onUploaded`), usado por `_ColorForm.tsx` y
  `_VistasForm.tsx`.
- **Rationale**: decisión explícita de la persona usuaria; evita duplicar la lógica de
  precarga/confirmación/alerta que hoy está mezclada dentro de cada formulario.
- **Alternatives considered**: mantener la lógica de subida duplicada en cada formulario —
  descartado, es justo lo que la spec pide eliminar (FR-002).
- **Fuera de alcance**: `_CargaMasiva.tsx` conserva su flujo especializado de lote/matriz (spec
  FR-012); solo cambia el endpoint de presigner que usa.

## Riesgos y mitigaciones

- **Riesgo**: si el bucket de R2 no se configura con CORS para permitir `PUT` desde el dominio de
  la app, las subidas directas desde el navegador fallarán. *Mitigación*: la guía de configuración
  de Cloudflare (FR-010) incluye el paso explícito de configurar CORS en el bucket.
- **Riesgo**: si el dominio público de R2 no se agrega a `images.remotePatterns`, `next/image`
  rechazará las imágenes nuevas. *Mitigación*: tarea explícita de actualizar `next.config.ts`.
- **Riesgo**: archivos huérfanos si una subida a R2 se completa pero el guardado posterior en base
  de datos falla. *Mitigación*: mismo comportamiento que existe hoy con Vercel Blob (documentado
  como edge case aceptado en la spec); no se agrega limpieza automática nueva en este alcance.
