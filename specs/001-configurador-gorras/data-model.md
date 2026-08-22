# Fase 1 — Modelo de datos

**Feature**: Configurador de gorras y solicitud de cotización | **Fecha**: 2026-08-12

Traduce las `Key Entities` de la [spec](./spec.md#key-entities) a tablas concretas. Cada tabla y
cada regla llevan el requisito que las pide (Principio III).

**Lectura en dos minutos**: hay tres bloques. El **catálogo** es lo que el equipo administra
(modelos, componentes, colores, zonas, técnicas). El **diseño** no está aquí: vive en el navegador
del cliente. Y la **solicitud** es una copia congelada del diseño más los datos de contacto, que
nada del catálogo puede alterar después.

---

## Bloque 1 — Catálogo

### `material` (lista fija en código, no tabla)

Los tipos de material —tela, hilo de bordado, plástico, metal— son un conjunto cerrado definido en
`lib/catalogo/materiales.ts` con su nombre en ambos idiomas.

**Límite conocido y aceptado** (Principio I): sumar un material nuevo es un cambio de una línea y un
despliegue. La spec no pide pantalla de administración de materiales, así que no se construye.
Requisitos que lo usan: FR-007, FR-016, FR-019, RN6.

### `admin_user` — Usuario administrador (FR-057, FR-062)

| Campo | Tipo | Notas |
|-------|------|-------|
| `id` | uuid PK | |
| `email` | text UNIQUE | Identificador de acceso |
| `name` | text | Es el nombre que aparece en el historial de estados |
| `password_hash` | text | Nunca la contraseña en claro |
| `active` | boolean | Dar de baja sin borrar el historial que firmó |
| `created_at` | timestamptz | |

Un único rol (Assumption 13). Las cuentas se crean por comando; **no hay registro público ni cuentas
de cliente**. La sesión no tiene tabla: es una cookie firmada que el servidor verifica en cada
petición del panel.

### `color` — Color (FR-016 a FR-023)

| Campo | Tipo | Notas |
|-------|------|-------|
| `id` | uuid PK | |
| `name_es`, `name_en` | text | Nombre comercial bilingüe (FR-016) |
| `supplier_ref` | text | Referencia del proveedor; va en la ficha técnica (FR-060) |
| `material` | text | De la lista fija; determina en qué componentes puede habilitarse (RN6) |
| `sample_image_url` | text | Fotografía de la muestra física (FR-016, FR-021) |
| `status` | `available` \| `out_of_stock` \| `discontinued` | FR-017, FR-023 |
| `created_at` | timestamptz | |

- `out_of_stock` = agotado: desaparece del configurador y se conserva en solicitudes ya enviadas
  (FR-018, RN7).
- `discontinued` = descontinuado: sustituye al borrado cuando el color ya se usó (FR-023, RN8).
- **Borrado**: solo permitido si ningún `component_image` y ninguna solicitud lo referencian. La
  base de datos lo impide con claves foráneas; la interfaz ofrece descontinuar (RN8).

### `cap_model` — Modelo (FR-005, FR-011, FR-013)

| Campo | Tipo | Notas |
|-------|------|-------|
| `id` | uuid PK | |
| `code` | text UNIQUE | Código interno |
| `name_es`, `name_en` | text | FR-005 |
| `description_es`, `description_en` | text | FR-005 |
| `status` | `draft` \| `published` | FR-013; solo `published` llega al cliente (FR-014, RN1) |
| `image_width`, `image_height` | int NULL | Se fijan con la primera imagen cargada; toda imagen posterior debe coincidir (FR-011, RN5) |
| `published_at` | timestamptz NULL | |
| `created_at` | timestamptz | |

### `model_view` — Vista activa (FR-006)

| Campo | Tipo | Notas |
|-------|------|-------|
| `model_id` | uuid FK | |
| `view` | `front` \| `side` \| `back` | Catálogo fijo de tres (Assumption 5) |
| `base_image_url` | text | Imagen base con las partes no personalizables (FR-008) |

Clave primaria (`model_id`, `view`). `front` es obligatoria para publicar (FR-006). **El lateral
derecho no es una fila**: se genera reflejando `side` en el momento de mostrarlo (FR-026).

### `component` — Componente (FR-007)

| Campo | Tipo | Notas |
|-------|------|-------|
| `id` | uuid PK | |
| `model_id` | uuid FK | |
| `name_es`, `name_en` | text | Corona, visera, botón, ojales, costuras… |
| `material` | text | De la lista fija |
| `customizable` | boolean | Si es `false`, va en la imagen base y no tiene imágenes por color |
| `layer_order` | int | Orden de apilado de las capas al dibujar la gorra |
| `default_color_id` | uuid FK NULL | Obligatorio si `customizable`; debe estar habilitado y disponible (FR-029, RN9) |

### `component_color` — Color habilitado por componente (FR-019, FR-020)

Clave primaria (`component_id`, `color_id`).

**Regla al insertar**: `color.material` debe igualar `component.material`, o se rechaza (FR-019,
RN6). Es la regla que impide habilitar un hilo de bordado en la corona.

### `component_image` — Imagen de componente (FR-009, FR-011)

| Campo | Tipo | Notas |
|-------|------|-------|
| `id` | uuid PK | |
| `model_id` | uuid FK | Redundante pero necesario para validar dimensiones por modelo |
| `component_id` | uuid FK | |
| `color_id` | uuid FK | |
| `view` | `front` \| `side` \| `back` | Debe ser una vista activa del modelo |
| `image_url` | text | |
| `width`, `height` | int | Deben coincidir con `cap_model.image_width/height` (FR-011, RN5) |

UNIQUE (`component_id`, `color_id`, `view`): una imagen por combinación, sin duplicados.

**Volumen esperado**: 6 componentes × 3 vistas × 30 colores ≈ 540 filas por modelo (Assumption 3).
Es la tabla que crece; de ahí que la carga masiva sea funcionalidad de primera clase.

### `model_size` — Talla disponible (FR-015)

| Campo | Tipo | Notas |
|-------|------|-------|
| `model_id` | uuid FK | |
| `label` | text | S, M, L, Única… |
| `sort_order` | int | |

Clave primaria (`model_id`, `label`). Solo estas tallas pueden usarse al distribuir la cantidad
(RN17).

### `decoration_zone` — Zona de decoración (FR-034, FR-035)

| Campo | Tipo | Notas |
|-------|------|-------|
| `id` | uuid PK | |
| `model_id` | uuid FK | Las zonas son **por modelo** (Assumption 8 enmendado) |
| `position` | `front` \| `left` \| `right` \| `back` | Cuatro posiciones (FR-034) |
| `max_width_cm`, `max_height_cm` | numeric | Medidas reales; valor por defecto 11 × 5,5 en la zona frontal |
| `box_x`, `box_y`, `box_w`, `box_h` | int | Dónde cae la zona sobre la imagen del modelo, en píxeles |
| `arc` | numeric | Cuánto se arquea la superficie (FR-035) |
| `tilt` | numeric | Cuánto se inclina |
| `taper` | numeric | Cuánto se estrecha hacia los bordes |
| `max_text_chars` | int | Límite de caracteres del texto en esta zona (FR-044) |

Clave única (`model_id`, `position`). Los tres parámetros de deformación son las "tres perillas" de
la decisión 8 de [research.md](./research.md#8-cómo-se-adapta-un-logotipo-a-la-curvatura-de-la-gorra);
el panel muestra su efecto en vivo (FR-035a).

**Visibilidad por vista** (FR-041, FR-042), derivada, no almacenada:

| Zona | Se ve en |
|------|----------|
| `front` | vista frontal |
| `left` | vista lateral |
| `right` | vista lateral reflejada |
| `back` | vista trasera |

### `technique` y `model_technique` — Técnica de decoración (FR-036)

`technique`: `id`, `name_es`, `name_en`, `active`.
`model_technique`: (`model_id`, `technique_id`).

Una sola técnica por diseño completo, nunca por zona (FR-047, RN14).

### `logo_asset` — Logotipo cargado (FR-037, FR-038, FR-039)

| Campo | Tipo | Notas |
|-------|------|-------|
| `id` | uuid PK | La referencia que guarda el navegador |
| `url` | text | Siempre la versión saneada si es SVG (FR-037b) |
| `mime` | text | `image/png`, `image/jpeg`, `image/svg+xml` |
| `bytes` | int | Verificado contra el límite (FR-037) |
| `original_filename` | text | Se muestra al cliente y al equipo |
| `width`, `height` | int NULL | Para la advertencia de resolución baja |
| `request_id` | uuid FK NULL | `NULL` mientras el logotipo no llegue a una solicitud |
| `created_at` | timestamptz | Base del borrado de huérfanos a los 30 días (FR-039) |
| `deleted_at` | timestamptz NULL | Se marca al anonimizar (FR-070) |

---

## Bloque 2 — El diseño no se guarda en el servidor

**Diseño** (entidad de la spec) no tiene tabla. Vive en `localStorage` del navegador y se envía
completo al registrar la solicitud. Su forma exacta está en
[contracts/design-payload.md](./contracts/design-payload.md).

**Por qué importa**: es lo que permite que no haya cuentas de cliente, ni sesiones, ni datos
personales en el servidor antes de que el cliente decida enviar (Principio V). El precio de esa
simplicidad está escrito en la spec: si el cliente cambia de dispositivo, pierde el diseño.

La única excepción es el logotipo, que sí se sube al elegirlo (Assumption 9), porque un archivo de
hasta 5 MB no cabe con garantías en el navegador y porque FR-055 exige poder reintentar un envío
fallido sin volver a configurar.

---

## Bloque 3 — Solicitud (todo congelado)

### `request` — Solicitud (FR-048 a FR-056, FR-062 a FR-070)

| Campo | Tipo | Notas |
|-------|------|-------|
| `id` | uuid PK | |
| `code` | text UNIQUE | Código único e irrepetible que ve el cliente (FR-052, RN20) |
| `submission_id` | uuid UNIQUE | Lo genera el navegador; garantiza un solo registro si se pulsa dos veces (FR-054) |
| `model_id` | uuid FK | Solo para trazar; **la solicitud no depende de él para mostrarse** |
| `design_snapshot` | jsonb | Copia completa y congelada: modelo, componentes, colores con su referencia de proveedor, elementos decorativos con medidas en cm, técnica (FR-053, FR-060, RN19) |
| `quantity` | int | Cantidad total (FR-048) |
| `comments` | text NULL | FR-051 |
| `contact_name` | text NULL | Dato personal; `NULL` tras anonimizar |
| `contact_email` | text NULL | Ídem |
| `contact_phone` | text NULL | Ídem |
| `privacy_accepted_at` | timestamptz | Fecha en que autorizó el tratamiento (FR-066) |
| `status` | `new` \| `in_review` \| `quoted` \| `closed` \| `rejected` | FR-063 |
| `status_changed_at` | timestamptz | Base del plazo de 12 meses cuando el estado es final (FR-068) |
| `notification_status` | `pending` \| `sent` \| `failed` | FR-056b |
| `notification_attempts` | int | |
| `anonymized_at` | timestamptz NULL | FR-068, FR-069 |
| `anonymized_by` | uuid FK NULL | Usuario responsable si fue a petición (FR-069) |
| `created_at` | timestamptz | |

**El campo que sostiene la promesa del producto** es `design_snapshot`. Guarda **valores copiados**,
no referencias al catálogo: el nombre del color, su referencia de proveedor, el nombre del
componente, las medidas en centímetros. Así, cuando el administrador reemplace las imágenes o
descontinúe un color, la solicitud de hace tres meses sigue diciendo exactamente lo mismo (SC-021,
RN3, RN19).

### `request_image` — Imagen congelada del diseño (FR-053)

| Campo | Tipo | Notas |
|-------|------|-------|
| `request_id` | uuid FK | |
| `view` | `front` \| `side` \| `side_mirrored` \| `back` | Una por vista que el cliente tenía |
| `image_url` | text | PNG generado por el navegador del cliente al enviar |

Clave primaria (`request_id`, `view`).

### `request_size` — Distribución por tallas (FR-048, RN17)

| Campo | Tipo | Notas |
|-------|------|-------|
| `request_id` | uuid FK | |
| `size_label` | text | Copiado, no referenciado: si el modelo deja de ofrecer esa talla, la solicitud la conserva |
| `quantity` | int | > 0 |

Clave primaria (`request_id`, `size_label`). **Invariante**: la suma de `quantity` iguala
`request.quantity`. Se valida en el navegador para avisar en el momento y otra vez en el servidor
antes de registrar.

### `request_status_history` — Historial (FR-062, RN21)

| Campo | Tipo | Notas |
|-------|------|-------|
| `id` | uuid PK | |
| `request_id` | uuid FK | |
| `from_status`, `to_status` | text | |
| `admin_user_id` | uuid FK | Quién (FR-062, SC-027) |
| `created_at` | timestamptz | Cuándo |

Nunca se borra ni se modifica, y sobrevive a la anonimización: no contiene datos personales del
cliente.

---

## Estados de la solicitud (FR-063, RN21)

```text
   new ──────► in_review ──────► quoted ──────► closed  (final)
    │              │               │
    └──────────────┴───────────────┴───────────► rejected (final)
```

| Desde | Hacia permitido |
|-------|-----------------|
| `new` | `in_review`, `rejected` |
| `in_review` | `quoted`, `rejected` |
| `quoted` | `closed`, `rejected` |
| `closed` | — (final) |
| `rejected` | — (final) |

- No se puede saltar pasos: `new → closed` está prohibido (SC-026).
- Se puede rechazar desde cualquier estado abierto, para cortar temprano casos como el de RN16
  (Assumption 12).
- Toda transición escribe una fila en `request_status_history`.
- Implementado y probado en `lib/solicitud/estados.ts`.

---

## Reglas de validación, por dónde se aplican

| Regla | Requisito | Dónde vive |
|-------|-----------|------------|
| Un color solo se habilita en componentes de su mismo material | FR-019, RN6 | Al guardar `component_color` |
| Todas las imágenes de un modelo miden igual | FR-011, RN5 | En el navegador antes de subir, y otra vez al registrar |
| No se publica un modelo con imágenes faltantes | FR-012, RN2 | `lib/catalogo/publicacion.ts`, al publicar |
| Cada componente personalizable tiene un color habilitado y disponible, y su color por defecto entre ellos | RN9 | Misma comprobación de publicación |
| `front` activa para publicar | FR-006 | Misma comprobación |
| Un color usado no se borra, se descontinúa | FR-023, RN8 | Claves foráneas + interfaz |
| Un elemento decorativo cabe en su zona | FR-043, RN11, RN12 | `lib/design/rules.ts`, en el navegador y al registrar |
| Un elemento por zona, máximo tres zonas | FR-045, RN13 | Ídem |
| Una sola técnica por diseño | FR-047, RN14 | Estructura del propio diseño: es un campo, no una lista |
| La suma por tallas iguala el total | FR-048, RN17 | `lib/solicitud/tallas.ts`, en el navegador y al registrar |
| Correo válido y tratamiento de datos aceptado | FR-050, SC-019 | Formulario y al registrar |
| El modelo sigue publicado al enviar | FR-033, RN4, SC de US4 escenario 5 | Al registrar |
| Todos los colores del diseño siguen disponibles al enviar | FR-033, edge case | Al registrar |
| Un SVG queda saneado o se rechaza | FR-037a | Al subir el logotipo |

**Regla general**: todo lo que se valida en el navegador para avisar rápido se vuelve a validar en el
servidor antes de escribir. El navegador es comodidad; el servidor es la garantía.

---

## Retención y anonimización (FR-039, FR-068 a FR-070)

| Qué | Cuándo | Efecto |
|-----|--------|--------|
| Logotipo que nunca llegó a una solicitud | 30 días desde `logo_asset.created_at`, con `request_id` nulo | Se borra del almacenamiento y de la tabla (FR-039) |
| Datos de contacto de una solicitud en estado final | 12 meses desde `status_changed_at` | `contact_name`, `contact_email`, `contact_phone` a `NULL`; `anonymized_at` con la fecha; se borra el logotipo (FR-068, FR-070) |
| Anonimización a petición del titular | Cuando el administrador la pide | Mismo efecto, y además `anonymized_by` con el responsable (FR-069) |

**Qué sobrevive siempre**: código, `design_snapshot`, imágenes del diseño, ficha técnica, cantidad,
tallas e historial de estados. No son datos personales y son el histórico de negocio (Assumption 16).

**Irreversible**: una solicitud anonimizada no se puede restaurar (RN23). La interfaz lo advierte
antes de confirmar.

**Efecto visible en el panel** (SC-034): el detalle deja de mostrar nombre, correo y teléfono, el
botón de descargar logotipo desaparece, y el resto sigue ahí.

---

## Índices

Solo los que un requisito concreto necesita:

- `request(status, created_at)` — el filtro del listado del panel (FR-058).
- `request(status, status_changed_at)` — lo que busca la tarea de retención (FR-068).
- `request(notification_status)` — lo que busca el reintento de correos (FR-056b).
- `logo_asset(request_id, created_at)` — huérfanos a borrar (FR-039).
- `component_image(component_id, color_id, view)` — ya cubierto por la clave única; es la consulta
  del configurador.

Sin índices "por si acaso" (Principio I).
