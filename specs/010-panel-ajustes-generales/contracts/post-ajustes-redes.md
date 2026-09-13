# Contract: `POST /api/panel/ajustes/redes` (nueva)

Agrega un enlace de red social (FR-012). Mismo patrón que `POST /api/panel/modelos/[id]/colores`.

## Autenticación

Requiere sesión de panel. Sin sesión → **401** `{ "error": "no_autorizado" }`.

## Request

```json
{ "platform": "instagram", "url": "https://instagram.com/brahmanfriends" }
```

- `platform`: **requerido**, uno de `instagram | facebook | tiktok | whatsapp | x | youtube |
  linkedin` (lista fija, Clarificación 2026-09-13). Cualquier otro valor → **400**.
- `url`: **requerido**, string con formato de dirección web válida (`http://` o `https://`,
  FR-013). Duplicar la misma `platform` que una fila existente está permitido (edge case).

## Reglas de validación

- `platform` fuera de la lista fija → **400** `{ "error": "datos_invalidos" }`.
- `url` vacía, no-string, o sin formato de URL válido → **400** `{ "error": "datos_invalidos" }`.

## Response

**201**

```json
{ "id": "…", "platform": "instagram", "url": "https://instagram.com/brahmanfriends" }
```

**400** `{ "error": "datos_invalidos" }`.

**401** `{ "error": "no_autorizado" }`.
