# Contract: `GET /api/panel/ajustes` (nueva)

Devuelve la fila única de configuración del sitio junto con sus redes sociales, para precargar el
formulario de Ajustes (FR-015).

## Autenticación

Requiere sesión de panel (`getSession()`). Sin sesión → **401** `{ "error": "no_autorizado" }`.
Cualquier persona administradora autenticada puede leer (Assumption: sin niveles de permiso).

## Response

**200**

```json
{
  "siteName": { "es": "Brahman Friends", "en": "Brahman Friends" },
  "contactEmail": "hola@brahmanfriends.com",
  "contactPhone": null,
  "logoUrl": null,
  "bannerUrl": null,
  "seo": {
    "title": { "es": null, "en": null },
    "description": { "es": null, "en": null },
    "imageUrl": null
  },
  "socialLinks": [
    { "id": "…", "platform": "instagram", "url": "https://instagram.com/brahmanfriends" }
  ]
}
```

`socialLinks` viene ordenado por `created_at` ascendente (orden en que se agregaron). Como
`site_settings` siempre tiene su fila sembrada por migración (data-model.md), esta ruta nunca
devuelve "no encontrado": siempre hay una configuración que mostrar.
