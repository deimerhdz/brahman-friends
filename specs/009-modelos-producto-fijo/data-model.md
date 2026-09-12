# Data Model: Modelos de producto fijo junto a modelos configurables

## `cap_model` (modificada)

| Campo | Tipo | Notas |
|---|---|---|
| `type` | enum `model_type`: `"configurable"` \| `"fixed_product"` | **Nueva.** `NOT NULL DEFAULT 'configurable'` — cubre FR-009 sin backfill manual. Se fija al crear el modelo (FR-001) y no se vuelve a exponer para editar (FR-010): la API rechaza cualquier intento de cambiarla después de la creación. |
| `price` | numeric(10,2), nullable | Sin cambios de tipo. La regla de si es obligatorio pasa a depender de `type`: obligatorio si `type = 'fixed_product'` (FR-002), opcional si `type = 'configurable'` (FR-003), validado en la API de creación/edición, no en la base de datos (mismo patrón que hoy: `NULL` = no definido). |
| resto de columnas | — | Sin cambios (`code`, `status`, `imageWidth/Height`, `moq`, `defaultColorId`, `publishedAt`, `createdAt`). `defaultColorId` no aplica a `fixed_product` pero se deja `NULL` en ese caso, igual que hoy para cualquier modelo sin colores configurados — no hace falta una restricción nueva. |

**Reglas de validación** (aplicadas en la API, no en constraints de base de datos, siguiendo el
patrón ya usado para `price`/`code` en `app/api/panel/modelos/route.ts`):

- Al crear (`POST /api/panel/modelos`): `type` es uno de los dos valores del enum (por defecto
  `"configurable"` si no se envía, para no romper ningún cliente/test que no lo mande todavía). Si
  `type = "fixed_product"`, `price` es requerido y debe ser un número ≥ 0.
- Al editar (`PATCH /api/panel/modelos/[id]`): `type` no se acepta en el body — es inmutable
  (FR-010). Si el modelo es `fixed_product`, `price` sigue siendo requerido para cualquier
  actualización que lo incluya (no se puede vaciar).

**Transiciones de estado**: sin cambios sobre `status` (`draft` → `published` y viceversa); lo que
cambia es qué debe cumplirse para pasar a `published`, ver "Reglas de publicación" abajo.

## `model_view` (sin cambios de esquema)

Se reutiliza tal cual para ambos tipos: `front`/`side`/`back`, cada una con `baseImageUrl` y
`active`. Para `fixed_product` estas son las fotos de producto (FR-005); no hay variantes de color
por vista como sí existe (vía `component_image`) para modelos configurables.

## Reglas de publicación (`lib/catalogo/publicacion.ts`)

| Tipo | Se puede publicar cuando... |
|---|---|
| `configurable` | Igual que hoy: `checkPublicacion(...)` — todas las vistas activas tienen foto base, todo componente personalizable tiene colores habilitados con su color por defecto usable, y todas las combinaciones componente×color×vista tienen imagen. (FR-007, sin cambios) |
| `fixed_product` | Nueva `checkPublicacionProductoFijo(...)` — `price` no es `NULL`, y al menos una vista activa tiene `baseImageUrl`. (FR-002, FR-006) |

## `request` / `request_image` (sin cambios de esquema, nueva forma de `design_snapshot`)

`design_snapshot` (jsonb) pasa a tener dos formas posibles, discriminadas por `kind`:

**Forma existente — pedido de modelo configurable** (`kind: "configurable"`, la que ya arma
`buildDesignSnapshot`): sin cambios — componentes, colores, decoraciones, técnica.

**Forma nueva — pedido de producto fijo** (`kind: "fixed_product"`, arma
`buildFixedProductSnapshot`):

| Campo | De dónde sale |
|---|---|
| `kind` | Literal `"fixed_product"` |
| `modelId` | `cap_model.id` |
| `nameEs` / `nameEn` | `cap_model_translation` en el momento del pedido |
| `descriptionEs` / `descriptionEn` | `cap_model_translation` en el momento del pedido |
| `price` | `cap_model.price` en el momento del pedido |
| `photos` | `[{ view, url }]` desde las vistas activas con `baseImageUrl` en ese momento |

`request_image` guarda esas mismas fotos (una fila por vista, `requestId` + `view` + `imageUrl`),
igual que hoy guarda las vistas compuestas de un pedido configurable — la diferencia es que la URL
es la foto de producto tal cual, sin composición de logo/decoración.

Ambas formas conviven bajo la misma tabla/columna: cualquier código que lea `request.designSnapshot`
DEBE revisar `kind` antes de asumir su forma (ver research.md #7).

## Entidades de la spec sin cambios de esquema

- **Modelo de gorra** (`cap_model` + `cap_model_translation`): descrito arriba.
- **Fotos del modelo** (`model_view`): descrito arriba, sin cambios de esquema.
- **Pedido/solicitud** (`request` + `request_image`): sin cambios de esquema, nueva forma de
  contenido descrita arriba.
