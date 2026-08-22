# Contrato — Rutas HTTP

**Feature**: Configurador de gorras y solicitud de cotización | **Fecha**: 2026-08-12

Estas rutas son **internas**: las usa el propio navegador de la aplicación, no terceros. No se
publica documentación externa ni se versiona la interfaz, porque no hay ningún consumidor fuera de
este proyecto (Principio I).

Todo lo que se puede resolver renderizando la página en el servidor no tiene ruta aquí. Las rutas
existen solo donde el navegador necesita realmente hablar con el servidor.

**Convenciones**:

- Cuerpos en JSON, salvo la subida de archivos.
- Errores: `{ "error": "<clave>", "detail": <objeto opcional> }`, con clave traducible por el
  navegador (Principio II: el servidor no devuelve texto para el usuario, devuelve claves).
- Códigos: `400` datos inválidos, `401` sin sesión, `403` sesión sin permiso o secreto de tarea
  inválido, `409` conflicto de estado, `413` archivo demasiado grande, `422` regla de negocio no
  cumplida.

---

## Público (sin sesión, sin cuentas)

### `POST /api/logos`

Sube un logotipo. Cuerpo: `multipart/form-data` con el campo `file`.

**Validaciones** (FR-037, FR-037a):

1. Formato dentro de `LOGO_FORMATS` → si no, `400 formato_no_permitido`.
2. Peso dentro de `MAX_LOGO_MB` → si no, `413 archivo_demasiado_grande` con
   `detail: { maxMb: 5 }` para poder decirle al cliente el límite (SC-011).
3. Si es SVG: se le retira todo contenido ejecutable. Si tras la limpieza no queda un dibujo válido
   → `422 svg_no_valido_tras_saneo`.

**Respuesta `201`**:

```json
{
  "logoAssetId": "uuid",
  "url": "https://…",
  "width": 1200,
  "height": 600,
  "warnings": ["baja_resolucion", "fondo_no_transparente"]
}
```

`warnings` son avisos, no rechazos: el logotipo se acepta igual (edge cases de la spec). El navegador
los traduce y los muestra.

**Lo que esta ruta no hace**: no pide ningún dato del cliente. En este punto el cliente sigue siendo
anónimo (Principio V).

### `POST /api/solicitudes`

Registra la solicitud. Es la operación más delicada del sistema.

**Cuerpo**:

```json
{
  "submissionId": "uuid",
  "design": { "…forma 1 de design-payload.md" },
  "quantity": 60,
  "sizes": [{ "label": "M", "quantity": 30 }, { "label": "L", "quantity": 30 }],
  "contact": { "name": "…", "email": "…", "phone": "…" },
  "comments": "…",
  "privacyAccepted": true,
  "viewImages": [{ "view": "front", "url": "https://…" }],
  "locale": "es"
}
```

`viewImages` son las imágenes que el navegador ya generó y subió antes de llamar aquí (FR-053).

**Orden de comprobaciones** (importa: se comprueba antes de escribir nada):

| # | Comprobación | Fallo |
|---|--------------|-------|
| 1 | ¿Ya existe una solicitud con este `submissionId`? | `200` devolviendo **la misma** solicitud, sin crear otra (FR-054) |
| 2 | El modelo sigue publicado | `409 modelo_no_disponible` (FR-033, RN4) |
| 3 | Todos los colores siguen disponibles | `409 color_no_disponible` con `detail: { componentIds: [...] }` |
| 4 | La suma por tallas iguala el total, y las tallas son del modelo | `422 tallas_no_cuadran` (RN17) |
| 5 | Correo válido y `privacyAccepted` verdadero | `400 datos_contacto_invalidos` (FR-050) |
| 6 | Los elementos decorativos caben, uno por zona, máximo tres | `422 decoracion_invalida` (RN12, RN13) |

**Al pasar todo, en una sola transacción**: se genera el código, se congela el diseño copiando los
valores del catálogo, se escriben `request`, `request_size`, `request_image`, se asocia el
`logo_asset` a la solicitud y se deja `notification_status = pending`.

**Respuesta `201`**:

```json
{ "code": "BF-2026-0043", "notificationPending": true }
```

**El correo se envía después de responder, y su resultado no afecta esta respuesta** (FR-056a,
RN20a). Si falla, `notification_status` queda en `failed` y el reintento programado se encarga; el
cliente ya vio su código.

`notificationPending: true` es lo que hace que la pantalla de confirmación muestre el aviso de que el
correo puede demorar (SC-020a).

### `GET /api/imagenes-modelo/:modelId`

Devuelve el mapa de imágenes que el configurador necesita: por componente, color y vista.

Se llama una vez al abrir el configurador. La respuesta se ordena poniendo primero la vista frontal
con los colores por defecto (FR-031a), para que el navegador empiece a descargar lo que se ve antes
que lo que no.

---

## Panel (requiere sesión)

Todas exigen la cookie de sesión válida; sin ella, `401` (FR-057, SC-022).

### `POST /api/panel/login`

Cuerpo `{ email, password }`. Respuesta `204` con la cookie de sesión (`HttpOnly`, `Secure`,
`SameSite=Lax`). Credenciales incorrectas: `401 credenciales_invalidas`, con el mismo mensaje y el
mismo tiempo de respuesta para correo inexistente y contraseña errada.

### `POST /api/panel/logout`

Respuesta `204`, cookie borrada.

### `POST /api/panel/modelos/:id/publicar`

Comprueba lo que exige RN2 y FR-012. Si falta algo, no publica y devuelve exactamente qué falta:

```json
{
  "error": "publicacion_incompleta",
  "detail": {
    "missing": [
      { "component": "Corona", "color": "Azul Rey", "view": "back" }
    ],
    "missingBaseViews": ["side"],
    "componentsWithoutColors": ["Ojales"]
  }
}
```

Esa lista es lo que la pantalla muestra al administrador (SC-023). Es el motivo por el que el error
lleva `detail` estructurado y no un texto.

### `POST /api/panel/modelos/:id/imagenes`

Registra un lote de imágenes ya subidas al almacenamiento (la carga masiva de FR-010).

Cuerpo: lista de `{ componentId, colorId, view, url, width, height }`.

Rechaza el lote completo si alguna dimensión no coincide con las del modelo, indicando cuáles
(FR-011, SC-024). Se rechaza el lote entero y no imagen por imagen, para que el administrador no
quede con un modelo a medio cargar sin saberlo.

### `POST /api/panel/subidas/autorizar`

Devuelve la autorización para que el navegador suba archivos directo al almacenamiento. Es lo que
permite soltar una carpeta de 540 imágenes sin que pasen por el servidor.

### `PATCH /api/panel/solicitudes/:id/estado`

Cuerpo `{ "to": "in_review" }`. Aplica la máquina de estados de
[data-model.md](../data-model.md#estados-de-la-solicitud-fr-063-rn21). Transición no permitida:
`409 transicion_no_permitida` con `detail: { from, allowed: [...] }` (SC-026).

Al aceptar, escribe la fila del historial con el usuario de la sesión y la fecha (FR-062, SC-027).

### `POST /api/panel/solicitudes/:id/anonimizar`

Borra nombre, correo y teléfono, borra el logotipo y registra fecha y responsable (FR-069, FR-070).
Requiere confirmación explícita en la interfaz porque **no se puede revertir** (RN23). Respuesta
`204`. Si ya estaba anonimizada: `409 ya_anonimizada`.

### `GET /api/panel/solicitudes/:id/logo`

Descarga el logotipo tal como lo cargó el cliente: los mapas de bits en su resolución original, los
SVG en su forma saneada, sin reescalar ni recomprimir (FR-061, FR-037b, SC-028).

Si la solicitud está anonimizada: `410 logo_eliminado` (SC-034).

### `GET /api/panel/solicitudes/:id/ficha.pdf`

Ficha técnica en PDF (FR-064): datos de la solicitud, imágenes del diseño, tabla de componentes con
su referencia de material y medidas en centímetros de cada elemento decorativo. Se genera desde
`design_snapshot`, nunca desde el catálogo actual.

### `GET /api/panel/solicitudes.csv?estado=&desde=&hasta=`

Exporta el listado con los mismos filtros de la pantalla (FR-058, FR-064).

---

## Tareas programadas (sin sesión, con secreto)

Exigen el encabezado `Authorization: Bearer <CRON_SECRET>`; sin él, `403`. No son accesibles desde
la interfaz.

### `POST /api/cron/retencion` — diaria

1. Anonimiza las solicitudes con estado final y `status_changed_at` de hace más de 12 meses
   (FR-068).
2. Borra los `logo_asset` con `request_id` nulo y más de 30 días (FR-039).

Responde `{ "anonymized": n, "logosDeleted": m }` para poder verificarlo desde el registro de
ejecuciones.

### `POST /api/cron/correos` — cada hora

Reintenta las notificaciones `pending` y `failed`, incrementando `notification_attempts` (FR-056b).
Responde `{ "retried": n, "sent": m, "stillFailing": k }`.

---

## Lo que deliberadamente no existe

| No existe | Por qué |
|-----------|---------|
| Registro, login o recuperación de contraseña de cliente | La spec deja las cuentas de cliente fuera de alcance |
| Guardar o recuperar un diseño por código | Fuera de alcance explícito; el diseño vive en el navegador |
| Cualquier ruta de precios o cotización automática | El precio lo pone el equipo comercial fuera del sistema (RN18) |
| API pública, claves de API, versionado de rutas | No hay consumidores externos (Principio I) |
| Rutas para administrar los parámetros ⚠ | Viven en variables de entorno (Assumption 8) |
