# Data Model: Ajustes generales del sitio en el panel administrador

## `site_settings` (nueva, fila única)

| Campo | Tipo | Notas |
|---|---|---|
| `id` | uuid, PK | **Fijo.** Constante `SITE_SETTINGS_ID` sembrada por la migración; el código nunca inserta una segunda fila (research.md#1). |
| `site_name_es` | text, NOT NULL | FR-002, FR-003. Sembrado con `"Brahman Friends"` (mismo valor que hoy tiene `common.siteName`, research.md#2). |
| `site_name_en` | text, NOT NULL | Igual que arriba, versión inglés. |
| `contact_email` | text, nullable | FR-002. `NULL` = no configurado. |
| `contact_phone` | text, nullable | FR-002. `NULL` = no configurado. |
| `logo_url` | text, nullable | FR-004, FR-007. `NULL` = sin logo; una sola imagen para ambos idiomas (Clarificación 2026-09-13). |
| `banner_url` | text, nullable | FR-005, FR-008. `NULL` = sin banner; una sola imagen para ambos idiomas. |
| `seo_title_es` | text, nullable | FR-009. `NULL` = usa el valor por defecto (research.md#9). |
| `seo_title_en` | text, nullable | Igual, versión inglés. |
| `seo_description_es` | text, nullable | FR-009. `NULL` = usa el valor por defecto. |
| `seo_description_en` | text, nullable | Igual, versión inglés. |
| `seo_image_url` | text, nullable | FR-009. `NULL` = no se incluye imagen de vista previa. |
| `updated_at` | timestamp with time zone, NOT NULL, default now(), actualizado en cada `PUT` | Para diagnóstico; no expuesto como requisito de la spec, solo trazabilidad operativa mínima. |

**Reglas de validación** (aplicadas en la API, mismo patrón que `cap_model`/`color`, no en
constraints de base de datos salvo la de `NOT NULL`):

- `PUT /api/panel/ajustes`: `siteName.es` y `siteName.en` son strings no vacíos (FR-003) —
  si falta cualquiera de los dos, se rechaza toda la actualización sin guardar nada
  (`errors.datosInvalidos()`). `contactEmail`/`contactPhone`/`logoUrl`/`bannerUrl`/`seoTitle.*`/
  `seoDescription.*`/`seoImageUrl` son opcionales: `null` o ausente los deja/pone en `NULL`.
- Las URLs de `logoUrl`/`bannerUrl`/`seoImageUrl` no las escribe la persona administradora a mano:
  llegan como la `publicUrl` que devuelve `subirDirecto` tras una subida exitosa por `SubidaArchivo`
  (research.md#4); la API solo verifica que sea una string (o `null` para quitar la imagen).

**Transiciones de estado**: ninguna — es un registro de configuración, no una entidad con ciclo de
vida. Cada `PUT` reemplaza los campos editables completos de la única fila (research.md#4).

## `site_social_link` (nueva)

| Campo | Tipo | Notas |
|---|---|---|
| `id` | uuid, PK, default random | — |
| `platform` | enum `social_platform`: `instagram \| facebook \| tiktok \| whatsapp \| x \| youtube \| linkedin` | FR-012. Lista fija decidida en `/speckit-clarify`; el enum de Postgres impide guardar un valor fuera de la lista (research.md#5). |
| `url` | text, NOT NULL | FR-013. Validada como URL bien formada (`http(s)://...`) antes de guardar. |
| `created_at` | timestamp with time zone, NOT NULL, default now() | Determina el orden de aparición (edge case: "en el orden en que se agregaron"). |

**Reglas de validación**:

- `POST /api/panel/ajustes/redes`: `platform` debe ser uno de los 7 valores del enum;
  `url` debe tener formato de dirección web válida (FR-013). Se permite crear más de una fila con
  la misma `platform` (edge case: dos enlaces de Instagram es válido).
- `PATCH /api/panel/ajustes/redes/[id]`: mismos chequeos que el `POST` para los campos incluidos en
  el body.
- `DELETE /api/panel/ajustes/redes/[id]`: sin reglas adicionales; borrado físico (no hay
  requisito de conservar historial de redes eliminadas).

**Relaciones**: `site_social_link` no tiene clave foránea hacia `site_settings` — como
`site_settings` es una fila única y fija, cualquier fila de `site_social_link` pertenece
implícitamente a la única configuración del sitio (no hace falta `site_settings_id` en cada fila).

## Entidades de la spec y su tabla

- **Ajustes del sitio** (spec) → `site_settings` (arriba).
- **Red social** (spec) → `site_social_link` (arriba).

## Cambios en datos existentes (no en esquema)

- `messages/es.json` / `messages/en.json`: se retira la clave `common.siteName` una vez que
  `NavBar`, `Footer` y `PanelNav` leen el nombre desde `site_settings` (research.md#2). Ninguna
  otra clave de esos archivos cambia.
- Ninguna tabla existente (`cap_model`, `request`, etc.) se modifica: esta funcionalidad es
  aditiva.
