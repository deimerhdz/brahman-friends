# Contract: `PUT /api/panel/ajustes` (nueva)

Reemplaza los campos editables de la fila única de configuración (research.md#4). No toca
`socialLinks` — las redes sociales se administran con sus propias rutas
(`post-ajustes-redes.md`, `patch-delete-ajustes-red.md`).

## Autenticación

Requiere sesión de panel. Sin sesión → **401** `{ "error": "no_autorizado" }`.

## Request

```json
{
  "siteName": { "es": "Brahman Friends", "en": "Brahman Friends" },
  "contactEmail": "hola@brahmanfriends.com",
  "contactPhone": null,
  "logoUrl": null,
  "bannerUrl": "https://…/ajustes/banner-….png",
  "seo": {
    "title": { "es": null, "en": null },
    "description": { "es": null, "en": "Premium custom caps." },
    "imageUrl": null
  }
}
```

- `siteName.es` y `siteName.en`: **requeridos**, string no vacío (FR-003).
- `contactEmail`, `contactPhone`, `logoUrl`, `bannerUrl`, `seo.title.es`, `seo.title.en`,
  `seo.description.es`, `seo.description.en`, `seo.imageUrl`: opcionales; `null` los deja/pone en
  blanco (equivale a "sin configurar", FR-007/FR-008/FR-011).
- `logoUrl` / `bannerUrl` / `seo.imageUrl` deben ser la URL pública devuelta por una subida previa
  vía `SubidaArchivo` (o `null`) — la ruta no valida que el archivo exista en R2 en cada guardado
  (mismo nivel de confianza que ya aplica hoy a `model_view.baseImageUrl`).

## Reglas de validación

- Si `siteName.es` o `siteName.en` falta o es string vacío → **400**
  `{ "error": "datos_invalidos" }`, no se guarda ningún campo (FR-003, edge case: no se permite
  guardar con un idioma obligatorio vacío).
- Si algún campo opcional presente no es string ni `null` → **400**
  `{ "error": "datos_invalidos" }`.

## Response

**200** — el mismo objeto que devuelve `GET /api/panel/ajustes` (incluye `socialLinks`, sin
cambios, ya que este endpoint no los toca), reflejando el estado recién guardado.

**400** `{ "error": "datos_invalidos" }` — ver reglas de validación arriba.

**401** `{ "error": "no_autorizado" }`.
