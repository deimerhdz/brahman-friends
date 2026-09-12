# Contract: `POST /api/panel/modelos/[id]/publicar` (modificada)

Ruta existente (`app/api/panel/modelos/[id]/publicar/route.ts`). Se agrega una rama de validación
para `type = "fixed_product"`; el caso `type = "configurable"` sigue exactamente igual (FR-007).

## Request

Sin cambios: no recibe body.

## Reglas de validación (nuevas)

Después de cargar el modelo, la ruta decide qué función de `lib/catalogo/publicacion.ts` correr
según `model.type`:

- `"configurable"` → `checkPublicacion(...)` + `canPublish(...)`, exactamente como hoy.
- `"fixed_product"` (nuevo) → `checkPublicacionProductoFijo({ price: model.price, viewsWithBaseImage })`.
  No publica si `price` es `null` o si `viewsWithBaseImage` está vacío (FR-002, FR-006).

## Response

**200** — modelo actualizado a `status: "published"` (sin cambios de forma).

**409** `{ "error": "publicacion_incompleta", "detail": { ... } }` — para `fixed_product`, `detail`
indica qué falta, por ejemplo `{ "missingPrice": true, "missingPhoto": false }`, en el mismo
espíritu que el `detail` que ya devuelve el caso `configurable` (missing/missingBaseViews/
componentsWithoutColors).

**401 / 404** — sin cambios.

## `DELETE` (despublicar)

Sin cambios: sigue funcionando igual para ambos tipos (vuelve a `status: "draft"`, sin validación
de completitud).
