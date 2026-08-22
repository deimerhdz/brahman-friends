# Fase 1 — Modelo de datos

**Feature**: Login de cliente y traducciones por tabla independiente | **Fecha**: 2026-08-22

Traduce las `Key Entities` de la [spec](./spec.md#key-entities) a tablas concretas. Cada tabla y
cada regla llevan el requisito que las pide (Principio III).

**Lectura en dos minutos**: hay dos bloques, sin relación entre sí. El **Bloque 1** es la cuenta
de cliente y su sesión. El **Bloque 2** es la nueva forma de guardar texto traducido para las
cuatro entidades del catálogo que ya existían antes de esta funcionalidad.

---

## Bloque 1 — Cliente y sesión

### `customer` — Cliente (FR-002 a FR-010c)

| Campo | Tipo | Notas |
|-------|------|-------|
| `id` | uuid PK | |
| `name` | text | Nombre para mostrar mientras hay sesión |
| `email` | text UNIQUE | Identificador de acceso; se guarda en minúsculas y sin espacios, igual que `admin_user.email` |
| `password_hash` | text | Mismo formato `salt:hash` de `lib/auth/password.ts`; nunca la contraseña en claro (FR-008) |
| `active` | boolean, default `true` | Dato interno; esta versión no tiene pantalla para que el equipo lo cambie (ver Assumptions de la spec) |
| `failed_login_attempts` | integer, default `0` | Se incrementa en cada intento fallido; se reinicia a 0 al iniciar sesión con éxito (FR-010c) |
| `locked_until` | timestamptz, nullable | Si está en el futuro, el login responde igual que una contraseña incorrecta (FR-010c, decisión 3 de research.md) |
| `created_at` | timestamptz, default now | |

Un único rol de cliente (no hay niveles ni permisos). Completamente separada de `admin_user`
(FR-009): ninguna consulta ni ninguna sesión cruza entre las dos tablas.

### Sesión de cliente (FR-006, FR-007, FR-009)

Sin tabla propia, igual que la sesión del panel: una cookie firmada (`bf_customer_session`,
`HttpOnly`, `Secure`, `SameSite=Lax`) que el servidor verifica en cada petición. Payload:
`{ customerId, email, name }`. Expira a los 30 días de inactividad, mismo plazo que ya usa la
sesión del panel.

---

## Bloque 2 — Traducciones por tabla independiente

Reemplaza, para las cuatro entidades siguientes, las columnas paralelas por idioma que existían
antes de esta funcionalidad. **No hay tabla genérica**: cada entidad tiene su propia tabla hija
(decisión 6 de research.md).

### Enum `locale`

`"es" | "en"` — mismo conjunto que `lib/i18n/t.ts#locales`.

### `cap_model_translation` (FR-011)

| Campo | Tipo | Notas |
|-------|------|-------|
| `model_id` | uuid, FK → `cap_model.id`, `onDelete: cascade` | |
| `locale` | `locale` | |
| `name` | text, requerido | Reemplaza `cap_model.name_es` / `cap_model.name_en` |
| `description` | text, default `""` | Reemplaza `cap_model.description_es` / `cap_model.description_en` |

PK compuesta `(model_id, locale)` — a lo sumo una fila por idioma, igual que `model_view` limita a
una fila por vista.

### `color_translation` (FR-011)

| Campo | Tipo | Notas |
|-------|------|-------|
| `color_id` | uuid, FK → `color.id`, `onDelete: cascade` | |
| `locale` | `locale` | |
| `name` | text, requerido | Reemplaza `color.name_es` / `color.name_en` |

PK compuesta `(color_id, locale)`.

### `component_translation` (FR-011)

| Campo | Tipo | Notas |
|-------|------|-------|
| `component_id` | uuid, FK → `component.id`, `onDelete: cascade` | |
| `locale` | `locale` | |
| `name` | text, requerido | Reemplaza `component.name_es` / `component.name_en` |

PK compuesta `(component_id, locale)`.

### `technique_translation` (FR-011)

| Campo | Tipo | Notas |
|-------|------|-------|
| `technique_id` | uuid, FK → `technique.id`, `onDelete: cascade` | |
| `locale` | `locale` | |
| `name` | text, requerido | Reemplaza `technique.name_es` / `technique.name_en` |

PK compuesta `(technique_id, locale)`.

### Columnas que se eliminan de las tablas existentes

| Tabla | Columnas eliminadas |
|-------|---------------------|
| `cap_model` | `name_es`, `name_en`, `description_es`, `description_en` |
| `color` | `name_es`, `name_en` |
| `component` | `name_es`, `name_en` |
| `technique` | `name_es`, `name_en` |

Ninguna otra columna de estas cuatro tablas cambia (código, estado, material, referencia de
proveedor, etc. siguen siendo columnas propias, sin traducción — FR-012).

---

## Regla de validación: ambos idiomas presentes (FR-011 a FR-016)

Hoy `name_es`/`name_en` son `NOT NULL` en las cuatro entidades: **ya es imposible** guardar un
color, modelo, componente o técnica sin ambos idiomas. Esa misma garantía se conserva, pero al
moverse el dato a filas ya no la da Postgres por sí solo (ver decisión 8 de research.md), así que
`lib/catalogo/traduccion.ts` la aplica en el mismo punto donde hoy ya se valida `nameEs`/`nameEn`
no vacíos:

- Al crear o editar cualquiera de las cuatro entidades, deben llegar los dos nombres (`es` y `en`)
  no vacíos; si falta alguno, la petición se rechaza con `400 datos_invalidos`, igual que hoy.
- `description` (solo en modelo) sigue siendo opcional por idioma (se guarda `""` si no se envía),
  igual que hoy.
- El gate de publicación del modelo (`lib/catalogo/publicacion.ts`, FR-012 de 001) no cambia: sigue
  validando imágenes y zonas, no nombres, porque el nombre ya no puede faltar desde el momento en
  que se crea el modelo.

## Migración (FR-018, FR-019)

Una sola migración, en orden:

1. Crear el enum `locale` y las cuatro tablas nuevas.
2. Por cada fila existente en `cap_model`, `color`, `component`, `technique`: insertar una fila
   `es` y una fila `en` en la tabla de traducción correspondiente, copiando el valor de la columna
   vieja tal cual (sin normalizar, sin recortar espacios).
3. Eliminar las ocho columnas listadas arriba.

Después de la migración, el sitio público (`app/[locale]/page.tsx`, el configurador) y el panel
leen el nombre/descripción mediante un `join` a la tabla de traducción filtrado por `locale`, en
vez de elegir entre dos columnas — el resultado visible para un visitante no cambia (FR-019).
