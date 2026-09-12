# Contract: `POST /api/panel/modelos` (modificada)

Ruta existente (`app/api/panel/modelos/route.ts`). Se le agrega el campo `type`, que además cambia
si `price` es obligatorio.

## Request

Requiere sesión de panel activa; sin sesión responde `401`.

```jsonc
{
  "code": "string, requerido, no vacío",
  "name": { "es": "string, requerido", "en": "string, requerido" },
  "description": { "es": "string, opcional", "en": "string, opcional" },
  "type": "\"configurable\" | \"fixed_product\", opcional (nuevo; por defecto \"configurable\")",
  "price": "number >= 0; opcional si type=\"configurable\", requerido si type=\"fixed_product\""
}
```

Reglas de validación (agregan a las que ya existen sin cambiarlas):

- `type` (nuevo): si viene, debe ser exactamente `"configurable"` o `"fixed_product"`; cualquier
  otro valor → `400 datos_invalidos`. Si no viene, se asume `"configurable"` (compatibilidad con
  llamadores existentes, FR-001).
- `price`: la regla existente ("si viene, debe ser número finito ≥ 0") se mantiene, y se agrega:
  si `type = "fixed_product"` y `price` no viene o es `null` → `400 datos_invalidos` (FR-002). Si
  `type = "configurable"`, `price` sigue siendo opcional (FR-003, sin cambios).

## Response

**201 Created** — mismo formato que hoy, con `type` agregado:

```jsonc
{
  "id": "uuid",
  "code": "string",
  "status": "draft",
  "type": "\"configurable\" | \"fixed_product\"",
  "imageWidth": null,
  "imageHeight": null,
  "moq": null,
  "price": "string | null",
  "defaultColorId": null,
  "publishedAt": null,
  "createdAt": "timestamptz",
  "nameEs": "string",
  "nameEn": "string",
  "descriptionEs": "string",
  "descriptionEn": "string"
}
```

**400** `{ "error": "datos_invalidos" }` — agrega los dos casos nuevos de arriba a los ya
existentes (falta `code`/`name`, o `price` inválido).

**401** `{ "error": "no_autorizado" }` — sin cambios.

## Compatibilidad

Los llamadores que no envían `type` siguen creando modelos `"configurable"` exactamente como hoy
(FR-009 — el valor por defecto cubre tanto el código existente como los modelos ya creados en la
base de datos, vía el `DEFAULT` de la columna).
