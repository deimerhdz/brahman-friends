# Contrato: rutas de subida prefirmada

Reemplazan a `app/api/panel/subidas/autorizar/route.ts` y `app/api/subidas/autorizar/route.ts`
(patrón `handleUpload` de `@vercel/blob/client`). Mismo propósito: el servidor autoriza y el
navegador sube directo al almacenamiento, sin que el archivo pase por el servidor.

## `POST /api/panel/subidas/presignar` (admin)

**Autenticación**: requiere sesión de panel (`getSession()`); sin sesión responde `401`, igual que
la ruta actual.

**Usada por**: `_ColorForm.tsx`, `_VistasForm.tsx`, `_CargaMasiva.tsx` (vía el componente
reutilizable o su propio cliente de subida).

### Request

```json
{
  "pathname": "colores/1737561234-muestra.png",
  "contentType": "image/png"
}
```

- `pathname`: ruta/clave propuesta para el objeto en el bucket, generada por el cliente siguiendo
  la misma convención que hoy (ver `data-model.md`).
- `contentType`: MIME del archivo a subir.

### Validación en servidor (igual que hoy en `onBeforeGenerateToken`)

- `contentType` DEBE estar en la lista permitida para este flujo: `image/png`, `image/jpeg`,
  `image/svg+xml`, `image/webp`.
- Tamaño máximo declarado por el cliente (`contentLength`, opcional) se valida contra el límite
  vigente del flujo si se envía; el límite definitivo lo aplica R2 al rechazar el `PUT` si el
  cuerpo excede lo firmado.

### Response `200`

```json
{
  "uploadUrl": "https://<bucket>.<account>.r2.cloudflarestorage.com/colores/1737561234-muestra.png?X-Amz-...",
  "publicUrl": "https://<dominio-publico-r2>/colores/1737561234-muestra.png",
  "expiresInSeconds": 300
}
```

- `uploadUrl`: URL prefirmada (`PUT`), válida por `expiresInSeconds` (5 minutos).
- `publicUrl`: URL pública permanente y definitiva del archivo una vez subido (FR-013); es el valor
  que se guarda en base de datos al persistir la entidad.

### Errores

- `401` — sin sesión de administrador.
- `400` — `contentType` no permitido para este flujo.

## `POST /api/subidas/presignar` (público/anónimo)

Igual contrato que el anterior, sin autenticación (el cliente sigue siendo anónimo en el flujo de
solicitud, Principio V). Restringido a `contentType: "image/png"` y tamaño máximo de 10 MB, igual
que la ruta actual.

**Usada por**: `subir-vistas.ts` (vistas compuestas del configurador antes de registrar una
solicitud).

## Flujo del cliente (ambas rutas)

1. El cliente arma el `pathname` y `contentType` y llama a la ruta correspondiente.
2. Con la respuesta, hace `fetch(uploadUrl, { method: "PUT", headers: { "Content-Type": contentType }, body: file })`.
3. Si el `PUT` responde `2xx`, la subida se considera exitosa y se usa `publicUrl` como resultado
   final — equivalente al objeto `{ url }` que hoy devuelve `upload()` de `@vercel/blob/client`.
4. Si el `PUT` falla (red, `4xx`/`5xx` de R2), se trata como error de subida (alerta de error,
   FR-004), sin registrar ninguna URL en la entidad.

## No cambia

- Los límites de tipo/tamaño por flujo (color, vista, carga masiva, solicitud) son los mismos que
  ya aplican hoy en las rutas `*/subidas/autorizar`; esta migración no los amplía ni los reduce.
- El endpoint no persiste nada en base de datos: la asociación con la entidad (color, vista,
  imagen de componente, vista de solicitud) la hace, como hoy, el endpoint propio de esa entidad
  cuando el formulario guarda o confirma.
