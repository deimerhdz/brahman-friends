# Contract: `POST /api/panel/modelos`

Ruta existente (`app/api/panel/modelos/route.ts`). Este documento describe el contrato **después**
de esta funcionalidad; lo único nuevo respecto al contrato actual es el campo opcional `price`.

## Request

Requiere sesión de panel activa (cookie de sesión); sin sesión responde `401`.

```jsonc
{
  "code": "string, requerido, no vacío",
  "name": { "es": "string, requerido", "en": "string, requerido" },
  "description": { "es": "string, opcional", "en": "string, opcional" },
  "price": "number >= 0, opcional (nuevo en esta funcionalidad)"
}
```

Reglas de validación (igual estilo que hoy):

- `code`: string no vacía. (La unicidad la impone la base de datos; un choque hoy resulta en error
  genérico 500 — comportamiento sin cambios, ver Edge Cases de la spec.)
- `name.es` y `name.en`: requeridos vía `validarNombreTraducido`; si falta alguno → `400
  datos_invalidos`.
- `description.es` / `description.en`: opcionales, se guardan como cadena vacía si no vienen.
- `price` (nuevo): si viene, debe ser `number` finito y `>= 0`; si es inválido → `400
  datos_invalidos`. Si no viene o es `null`, el modelo se crea sin precio definido (`NULL`), igual
  que hoy.

## Response

**201 Created** (éxito) — mismo formato que hoy, con `price` agregado:

```jsonc
{
  "id": "uuid",
  "code": "string",
  "status": "draft",
  "imageWidth": null,
  "imageHeight": null,
  "moq": null,
  "price": "string | null",   // nuevo: precio guardado con 2 decimales, o null si no se definió
  "defaultColorId": null,
  "publishedAt": null,
  "createdAt": "timestamptz",
  "nameEs": "string",
  "nameEn": "string",
  "descriptionEs": "string",
  "descriptionEn": "string"
}
```

**400** `{ "error": "datos_invalidos" }` — falta `code`, `name.es`/`name.en`, o `price` viene con un
valor no numérico o negativo.

**401** `{ "error": "no_autorizado" }` — sin sesión de panel.

**500** `{ "error": "generic" }` — incluye el caso de `code` duplicado (comportamiento actual, sin
cambios en esta funcionalidad).

## Compatibilidad

Los llamadores existentes que no envían `price` siguen funcionando igual (campo opcional,
`undefined` se trata como "no definir precio"). No es un cambio incompatible.
