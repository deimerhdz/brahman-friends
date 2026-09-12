# Data Model: Formulario de creación de modelo alineado con edición

No se agregan entidades ni columnas nuevas. Esta funcionalidad expone en el formulario de creación
un campo (`price`) que ya existe en el esquema y se usa hoy solo desde la edición.

## Entidad: `cap_model` (`lib/db/schema.ts`)

Campos relevantes para esta funcionalidad (sin cambios de esquema):

| Campo    | Tipo                        | Reglas                                                                 | Se toca en esta funcionalidad |
|----------|------------------------------|-------------------------------------------------------------------------|--------------------------------|
| `id`     | uuid, PK, default random     | Generado al crear                                                       | No                              |
| `code`   | text, `unique`, not null     | Debe ser único; se define al crear y no vuelve a poder cambiar          | No (regla sin cambios; ver Decisión 2 en research.md) |
| `status` | enum `draft` \| `published`  | Nace en `draft`; publicar exige vistas/colores completos (regla existente) | No                           |
| `price`  | numeric(10,2), nullable      | Opcional; `NULL` = "sin precio definido"; no negativo si se define      | **Sí** — ahora también se puede fijar al crear, no solo al editar |
| `moq`    | integer, nullable            | Cantidad mínima de pedido; regla existente: solo se define después de crear (006-configurador-stepper) | No — sigue sin aparecer en creación (FR-004) |

## Entidad: `cap_model_translation` (`lib/db/schema.ts`)

| Campo        | Tipo                    | Reglas                                   | Se toca en esta funcionalidad |
|--------------|--------------------------|--------------------------------------------|--------------------------------|
| `model_id`   | uuid, FK → `cap_model.id` | Una fila por idioma (`es`, `en`)          | No |
| `locale`     | enum `es` \| `en`         | —                                          | No |
| `name`       | text, not null            | Obligatorio en ambos idiomas para guardar  | No (ya se pide en creación hoy) |
| `description`| text                      | Opcional                                   | No (ya se pide en creación hoy) |

## Validación al crear (nueva regla para `price` en `POST`)

- `price` ausente o `null` → el modelo se crea sin precio definido (comportamiento actual, sin
  cambios).
- `price` presente → debe ser un número finito ≥ 0; se guarda con dos decimales, igual que la regla
  ya aplicada en `PATCH /api/panel/modelos/[id]`.
- `price` inválido (no numérico, negativo, `NaN`/`Infinity`) → la petición se rechaza con el mismo
  código de error genérico de datos inválidos que usa el resto de la ruta (`datos_invalidos`); no se
  crea el modelo.

## Transiciones de estado

Sin cambios: el modelo sigue naciendo en `status = "draft"` al crearse, y solo puede pasar a
`"published"` a través del flujo de publicación existente (que exige vistas y colores completos),
no como parte de esta funcionalidad.
