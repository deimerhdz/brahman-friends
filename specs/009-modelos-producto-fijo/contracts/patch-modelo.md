# Contract: `PATCH /api/panel/modelos/[id]` (modificada)

Ruta existente (`app/api/panel/modelos/[id]/route.ts`). `type` sigue sin poder editarse (FR-010);
lo único que cambia es la validación de `price` cuando el modelo es `fixed_product`.

## Request

Mismo body que hoy (`name`, `description`, `code`, `moq`, `price`, `defaultColorId`, todos
opcionales). **No se acepta un campo `type`** — si viene, se ignora silenciosamente (igual que hoy
se ignora cualquier campo no reconocido), para dejar sentado que el tipo no se edita por esta vía.

## Reglas de validación (nuevas, agregan a las existentes)

- Antes de aplicar el patch, la ruta lee `capModel.type` del modelo (`id`) desde la base de datos.
- Si `type = "fixed_product"` y el body incluye `price` con valor `null` → `400 datos_invalidos`
  (no se puede vaciar el precio de un producto fijo, FR-002). Si `price` no viene en el body, no se
  toca (sin cambios respecto al comportamiento actual del PATCH parcial).
- Si `type = "configurable"`, sin cambios: `price` sigue aceptando `null` para vaciarlo.

## Response

Sin cambios de forma respecto al contrato actual, salvo que el objeto devuelto ahora incluye `type`
(igual que ya incluye `price`, `moq`, etc., por ser una columna más de `cap_model`).

**400** `{ "error": "datos_invalidos" }` — agrega el caso nuevo de arriba.

**404** `{ "error": "no_encontrado" }` — sin cambios.

**401** `{ "error": "no_autorizado" }` — sin cambios.
