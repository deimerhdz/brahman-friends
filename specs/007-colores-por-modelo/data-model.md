# Fase 1 — Modelo de datos

**Feature**: Colores propios por modelo | **Fecha**: 2026-09-06

Extiende el modelo de datos de [`001-configurador-gorras`](../001-configurador-gorras/data-model.md):
cambia el dueño de `color`, de "ninguno / compartido" a "un `cap_model` exacto". No cambia la forma
de `component_color`, `component_image` ni del motor del configurador — solo de dónde pueden venir
los colores que esas tablas referencian.

---

## Tabla existente extendida

### `color` — ahora propiedad de un modelo (FR-001, FR-002, FR-003, FR-010)

> **Enmienda 2026-09-06 (post-implementación, parte 1)**: `supplier_ref`, `material` y `status` se
> retiraron por completo (columna y tipo `color_status`) — el usuario pidió simplificar el
> formulario tras probarlo; un color de un modelo es solo su nombre y su muestra. La validación de
> `component_color` que exigía que el material del color coincidiera con el del componente (RN6 de
> `001-configurador-gorras`) se retiró junto con la columna. Migración: `drizzle/0006_cuddly_toad_men.sql`.
>
> **Enmienda 2026-09-06 (post-implementación, parte 2)**: `sample_image_url` también se retiró —
> un color es solo su nombre. Esa imagen también alimentaba el patrón de relleno del texto
> personalizado con color (`lib/design/compose.ts#renderTextSource`); se consultó al usuario antes
> de quitarla, confirmó seguir adelante, y el texto con color ahora se dibuja siempre con un color
> de reserva fijo (`#111827`), sin importar el color elegido para él. Migración:
> `drizzle/0007_round_hawkeye.sql`.

| Campo | Tipo | Notas |
|-------|------|-------|
| `id` | uuid PK | sin cambios |
| `model_id` | uuid FK → `cap_model.id`, `onDelete: cascade` | Reemplaza el estado "sin dueño" de hoy. `NOT NULL` tras el backfill (research.md#2). |
| `created_at` | timestamptz | sin cambios |

- **Borrado de un color individual**: sin cambios de comportamiento — sigue bloqueado por FK
  mientras algún `component_color` lo referencie dentro de su propio modelo (RN8 de
  `001-configurador-gorras`); la diferencia es que ya no puede haber un `component_color` de *otro*
  modelo bloqueando el borrado, porque eso ya no es posible (FR-002).
- **Borrado de un modelo completo**: ahora también borra en cascada sus propios colores (y sus
  `color_translation`, que ya cascadean desde `color`) — FR-010. Antes era imposible que borrar un
  modelo afectara la tabla `color`, porque ningún color le pertenecía.

### `color_translation` — sin cambios

Sigue igual: `color_id` + `locale` + `name`, cascada desde `color`. Nada de esto depende de a qué
modelo pertenezca el color.

### `component_color` — sin cambios de forma; nueva regla de validación (FR-002, FR-007)

Clave primaria sin cambios (`component_id`, `color_id`, `view`).

**Regla nueva al insertar** (además de la ya existente "`color.material` debe igualar
`component.material`", RN6): `color.model_id` DEBE igualar `component.model_id`, o se rechaza. Es la
regla que hace imposible, incluso a nivel de API, habilitar en un modelo un color que pertenece a
otro — hoy eso ya no puede pasar desde la interfaz (solo se listan colores del propio modelo), pero
la validación de servidor lo cierra también por API directa, igual que ya hace la validación de
material.

### `component_image`, `component.default_color_id` — sin cambios de forma

Siguen apuntando a `color.id`. Como `component_color` ya garantiza que solo se habilitan colores del
mismo modelo, y `default_color_id` solo se fija desde la interfaz sobre colores ya habilitados
(`_ComponentesManager.tsx`), ambos quedan correctamente acotados por modelo sin necesitar su propia
columna `model_id` ni su propia validación adicional.

---

## Migración de datos existentes (backfill, research.md#2)

No es un cambio de esquema adicional: es el contenido del script
`scripts/migrar-colores-por-modelo.ts` que puebla la columna nueva antes de volverla `NOT NULL`.

| Situación del color hoy | Resultado tras el script |
|--------------------------|---------------------------|
| Habilitado en componentes de un solo modelo | Se le asigna ese `model_id`; misma fila, mismo `id` |
| Habilitado en componentes de N modelos (N>1) | La fila original se queda con el modelo más antiguo (por `cap_model.created_at` — `component` no tiene su propia fecha de creación); se crean N-1 copias nuevas (color + traducciones), una por cada modelo restante, y se reapuntan hacia cada copia sus propios `component_color`, `component_image` y `component.default_color_id` |
| No habilitado en ningún componente de ningún modelo | Se descarta (color y sus traducciones) — FR-009 |

Ninguna fila de `request` ni `request_image` se toca (research.md#5): ya guardan una copia
congelada del color elegido, no una referencia viva.

---

## Manifiesto del modelo (`loadModelManifest`, `lib/catalogo/model-manifest.ts`)

Sin cambios de forma en el payload que consume el configurador público — sigue siendo
`components[].colors[]` con los mismos campos. Cambia únicamente la consulta interna: en vez de
traer *todo* `color` y cruzarlo con los enlaces de este modelo, la consulta de colores se acota
desde el principio con `where(eq(color.modelId, model.id))`. El resultado observable para el cliente
final es idéntico; el cambio es de dónde se filtra, no de qué se muestra.

## Ficha de publicación (`checkPublicacion`, `lib/catalogo/publicacion.ts`)

Sin cambios: sigue siendo una función pura que recibe `colors: PublicacionColor[]` ya armados por el
llamador (`app/api/panel/modelos/[id]/publicar/route.ts`). Ese llamador acota su consulta de colores
de la misma forma que `model-manifest.ts`, por consistencia y para no traer filas de otros modelos
que ya no pueden ser relevantes.

---

## Trazabilidad requisito → tabla/campo

| Requisito | Tabla/Campo |
|-----------|-------------|
| FR-001, FR-005 | Panel: sección `/panel/modelos/:id/colores` (ver [contracts/api.md](./contracts/api.md)) |
| FR-002, FR-007 | `color.model_id`, validación nueva en `component_color` (arriba) |
| FR-003 | `color_translation.name` (único campo propio de un color tras las enmiendas del 2026-09-06) |
| FR-004 | `component_color`, `component_image` — sin cambios de forma |
| FR-006 | Script de backfill, tabla "Migración de datos existentes" arriba |
| FR-008 | Ausencia deliberada de un endpoint o campo "copiar desde otro modelo" |
| FR-009 | Script de backfill: caso "no habilitado en ningún modelo" |
| FR-010 | `color.model_id` FK `onDelete: cascade` |
| FR-011 | Ningún cambio en `request`/`request_image` (research.md#5) |
