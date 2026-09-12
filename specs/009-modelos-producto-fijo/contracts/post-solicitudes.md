# Contract: `POST /api/solicitudes` (modificada)

Ruta existente (`app/api/solicitudes/route.ts`). Hoy solo acepta pedidos de modelos configurables;
se le agrega la forma de pedido de un producto fijo (FR-013, FR-014), discriminada por
`design.kind`.

## Request

```jsonc
{
  "submissionId": "uuid, requerido (sin cambios)",
  "design": {
    "kind": "\"configurable\" | \"fixed_product\", nuevo — si falta, se asume \"configurable\" (compatibilidad con el cliente actual)",
    "modelId": "uuid, requerido (sin cambios)",
    // Solo si kind = "configurable" (forma existente, sin cambios):
    "colors": { "componentId": "colorId" },
    "technique": "string | null",
    "decorations": [ /* Decoration[], sin cambios */ ]
  },
  "quantity": "integer >= 1 (sin cambios)",
  "contact": { "name": "string", "email": "string", "phone": "string" },
  "comments": "string, opcional",
  "privacyAccepted": "boolean, debe ser true",
  "viewImages": "[{ view, url }], solo aplica/se usa si kind = \"configurable\"; para \"fixed_product\" se ignora y se envía [] (las fotos salen del modelo, no de una subida del cliente)",
  "locale": "\"es\" | \"en\""
}
```

## Reglas de validación (nuevas para `kind = "fixed_product"`)

1. Se carga el modelo (`cap_model`) por `design.modelId`. Si no existe, no está `published`, o su
   `type` en base de datos **no coincide** con `design.kind` recibido → `errors.modeloNoDisponible()`
   (mismo error que ya existe hoy para "el modelo ya no está disponible"; nunca se confía en lo que
   el cliente dice que es el tipo).
2. No corren las validaciones de colores/decoraciones (pasos 3 y 6 del contrato actual) — no
   aplican a un producto sin componentes personalizables.
3. Cantidad (`quantity`) y contacto/privacidad: **mismas reglas que hoy**, sin cambios (pasos 4 y 5
   del contrato actual).

## Qué se guarda (rama `fixed_product`)

- `design_snapshot` se arma con `buildFixedProductSnapshot(model, translations)` (ver
  `data-model.md`) en vez de `buildDesignSnapshot`.
- `request_image` se llena con las vistas activas del modelo (`view`, `baseImageUrl`) tal como
  están en ese momento — no con `body.viewImages` (que para este caso llega vacío).
- No hay `logo_asset` que asociar (no hay decoraciones).
- El resto de la escritura (código único vía `generateRequestCode`, batch atómico, reintento por
  colisión de código, envío de notificación) es exactamente el mismo camino que ya existe.

## Response

Sin cambios de forma: `201 { "code": "string", "notificationPending": true }`, o `200` con el mismo
`code` si `submissionId` ya existía (idempotencia, sin cambios).

**409** `{ "error": "modelo_no_disponible" }` — ahora también cubre el caso "el tipo del modelo no
coincide con el `kind` del pedido".

Los demás códigos de error (`cantidad_invalida`, `datos_contacto_invalidos`) se mantienen sin
cambios para ambos `kind`. `color_no_disponible` y `decoracion_invalida` solo pueden ocurrir para
`kind = "configurable"` (no se evalúan para `fixed_product`).
