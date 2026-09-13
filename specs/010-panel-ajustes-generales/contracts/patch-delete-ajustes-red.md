# Contract: `PATCH` / `DELETE /api/panel/ajustes/redes/[id]` (nueva)

Editar o quitar un enlace de red social existente (FR-012). Mismo patrón que
`PATCH /api/panel/colores/[id]`.

## Autenticación

Ambos métodos requieren sesión de panel. Sin sesión → **401** `{ "error": "no_autorizado" }`.

## `PATCH`

### Request

```json
{ "platform": "facebook", "url": "https://facebook.com/brahmanfriends" }
```

Ambos campos opcionales (se actualiza solo lo que venga); mismas reglas de validación que
`post-ajustes-redes.md` para cualquier campo incluido.

### Response

**200** `{ "id": "…", "platform": "facebook", "url": "https://facebook.com/brahmanfriends" }`

**400** `{ "error": "datos_invalidos" }`

**404** `{ "error": "no_encontrado" }` — el `id` no corresponde a ningún enlace existente.

**401** `{ "error": "no_autorizado" }`

## `DELETE`

### Response

**204** sin cuerpo — el enlace se borra físicamente (sin historial, no requerido por la spec).

**404** `{ "error": "no_encontrado" }`

**401** `{ "error": "no_autorizado" }`
