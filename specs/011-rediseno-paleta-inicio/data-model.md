# Data Model: Nueva paleta y rediseño de la página de inicio

Esta funcionalidad **no cambia la base de datos**: no hay tablas, columnas ni migraciones nuevas.
Solo lee datos existentes y añade un estado del carrito que vive en el navegador.

## Datos existentes que se leen (servidor)

### Modelo publicado → `TarjetaColeccion`

Se arma en `app/[locale]/(site)/page.tsx` a partir de `capModelConNombreYPortada()` (existente)
filtrado por `status = 'published'`, más los colores con foto frontal de los modelos
configurables.

| Campo | Origen | Notas |
|-------|--------|-------|
| `id` | `cap_model.id` | |
| `name` | `cap_model_translation.name` del idioma activo | |
| `type` | `cap_model.type` | `configurable` \| `fixed_product` |
| `frontImageUrl` | `model_view.base_image_url` (vista `front`) | `null` → fondo arena |
| `price` | `cap_model.price` | solo `fixed_product`; se muestra con `formatUsd` |
| `href` | derivado | `/{locale}/configurador/{id}` o `/{locale}/producto/{id}` |
| `colores` | `color` + `color_translation` + `color_image` (vista `front`) | solo `configurable`; lista de `{ id, name, imageUrl }`; se omiten colores sin foto frontal |

Orden: `published_at` descendente (igual que hoy).

`modeloPersonalizableDestacado`: el `href` del primer `configurable` de esa lista (el publicado más
reciente), o `null`. Lo usa "Tu hierro. Tu gorra".

### Ajustes del sitio (existente, `obtenerAjustesSitio()`)

| Campo | Uso nuevo |
|-------|-----------|
| `logoUrl` | encabezado y pie (si es `null`, logotipo en texto) |
| `bannerUrl` | fondo del héroe (si es `null`, `/inicio/ranch-hero.jpg`) |
| `contactPhone` | respaldo del número de WhatsApp |
| `socialLinks[]` | pie de página; `whatsapp` → número; `youtube` → botón de comunidad y menú móvil |
| `siteNameEs/En` | texto alternativo del logotipo |

## Estado nuevo en el navegador

### `LineaCarrito`

| Campo | Tipo | Regla |
|-------|------|-------|
| `clave` | string | `{modelId}` + `:` + `{color o ""}`; única dentro del carrito |
| `modelId` | string | id del producto fijo |
| `nombre` | string | nombre en el idioma en que se añadió (se conserva aunque el modelo deje de publicarse) |
| `imagenUrl` | string \| null | foto de portada al añadir |
| `color` | string | vacío para productos fijos (no tienen colores) |
| `cantidad` | entero ≥ 1 | una línea con cantidad 0 se elimina |

### `Carrito`

Lista de `LineaCarrito`. Derivado: `totalUnidades = Σ cantidad` (contador del encabezado).

**Operaciones** (reductor puro, probado con Vitest):

| Operación | Efecto |
|-----------|--------|
| `agregar(linea)` | si existe la `clave`, `cantidad + 1`; si no, añade con `cantidad = 1` |
| `cambiarCantidad(clave, ±1)` | suma el delta; si queda en 0, elimina la línea |
| `eliminar(clave)` | quita la línea |
| `vaciar()` | no se expone en la UI; existe solo para pruebas |

**Persistencia**: `sessionStorage["bf-carrito-v1"]` = JSON de la lista. Se lee al montar el
proveedor y se escribe tras cada cambio. JSON inválido o almacenamiento bloqueado → carrito vacío
en memoria, sin error visible. No se envía nunca al servidor.

### Estado local de la interfaz (no persistente)

| Estado | Dónde | Valores |
|--------|-------|---------|
| panel del carrito abierto | proveedor del carrito | boolean (se abre al `agregar`) |
| menú móvil abierto | encabezado | boolean |
| pestaña de la colección | colección | `todos` \| `configurable` \| `fixed_product` |
| texto de búsqueda / buscador visible | colección | string / boolean (visible si la URL trae `buscar=1`) |
| color elegido por tarjeta | colección | `Record<modelId, colorId>` |
| estilo y color de la vitrina | "Tu hierro. Tu gorra" | 3 estilos × 4 colores fijos |
