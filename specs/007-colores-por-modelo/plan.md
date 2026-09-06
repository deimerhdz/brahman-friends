# Implementation Plan: Colores propios por modelo

**Branch**: `007-colores-por-modelo` | **Date**: 2026-09-06 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/007-colores-por-modelo/spec.md`

## Summary

Los colores dejan de ser un catálogo compartido entre todos los modelos (`color` sin dueño) y pasan
a pertenecer exactamente a un modelo de gorra (`color.model_id`). La sección independiente del panel
(`/panel/colores`) se retira; crear, editar y eliminar colores solo se hace dentro de la ficha del
modelo, en una pestaña nueva junto a vistas/componentes/zonas/tallas. Los colores hoy compartidos
entre varios modelos se migran automáticamente: cada modelo que los usa recibe su propia copia
independiente (mismo nombre, material, muestra, estado, imágenes), y los que no están habilitados en
ningún modelo se descartan. La habilitación por componente/vista (`component_color`,
`component_image`) y el motor del configurador no cambian de forma; solo cambia de dónde vienen los
colores que se les ofrece.

**Enfoque técnico en una frase**: es una reasignación de dueño de una entidad existente, no un motor
nuevo — se reutiliza exactamente el mismo patrón de "recurso dentro de un modelo" que ya usan
`componentes`, `zonas` y `tallas` (research.md#4).

## Technical Context

**Language/Version**: TypeScript 5.x sobre Node.js 22 LTS (sin cambios).

**Primary Dependencies**: Next.js 15 (App Router) + React 19, Drizzle ORM, `@aws-sdk/client-s3`
(Cloudflare R2, vía `SubidaArchivo.tsx`), Tailwind CSS v4. **Ninguna dependencia nueva**
(research.md#Justificación de dependencias).

**Storage**: mismo Postgres gestionado (Neon). Cambio de esquema: columna nueva `color.model_id`
(FK a `cap_model`, `onDelete: cascade`) — ver [data-model.md](./data-model.md). Mismo bucket R2 para
las muestras de color, sin cambios de contrato de subida.

**Testing**: Vitest para lo que ya es lógica pura y no cambia (`publicacion.ts`, sin cambios de
comportamiento). La migración de datos y el aislamiento por modelo se verifican recorriendo la app
según [quickstart.md](./quickstart.md) (Principio IV) — no hay arnés de pruebas de integración con
base de datos en este proyecto (`tests/` son todas funciones puras).

**Target Platform**: mismo panel de administración de escritorio. Sin cambios en el configurador
público más allá de qué colores llegan en el manifiesto (mismo componente, mismos datos).

**Project Type**: misma aplicación web única (cliente + panel + API en un solo despliegue).

**Performance Goals**: sin objetivo nuevo; el volumen de colores por modelo es menor que el
catálogo global actual (research.md#3), así que ninguna consulta se vuelve más pesada.

**Constraints**:

- Bilingüe español/inglés en toda etiqueta nueva del panel (pestaña "Colores" del modelo), sin texto
  fijo en el código (Principio II); las claves de traducción del formulario de color ya existen
  (`panel.colores.*`) y se reutilizan tal cual.
- Sin secretos nuevos en el repositorio (Principio V); no hace falta ninguna variable de entorno
  nueva.
- La migración de datos debe dejar cada modelo publicado exactamente igual a como se veía antes
  (FR-006, SC-002) — no es una constraint de rendimiento, es de integridad visual.

**Scale/Scope**: alcance de pantallas: 1 sección del panel eliminada (`/panel/colores` y sus dos
subpáginas), 1 sección nueva del panel (`/panel/modelos/:id/colores`, misma forma que
`componentes`/`zonas`/`tallas`), 3 rutas de API modificadas o reubicadas, 1 script de migración de
datos de un solo uso, 3 puntos de lectura de colores re-alcanzados a su modelo
(`model-manifest.ts`, `componentes/page.tsx`, `publicar/route.ts`).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Constitution v2.0.0.

### I. Simplicidad ante todo — PASA

| Regla | Cómo se cumple |
|-------|-----------------|
| Toda dependencia nueva se justifica por escrito | No hay ninguna dependencia nueva. |
| Sin abstracciones para casos que la spec no pide | No se construye un mecanismo de "compartir/copiar color entre modelos" (FR-008 lo excluye explícitamente); la relación es la más simple posible: 1 color → 1 modelo, igual que `component.model_id` ya existente. |
| Los límites conocidos se documentan y se avanza | El script de migración es de un solo uso, no un mecanismo permanente (research.md#2); una vez corrido y verificado, se puede borrar del repo en una limpieza posterior — se documenta esa naturaleza temporal, no se generaliza en un "runner de migraciones de datos". |

### II. Idioma y mercado — PASA

- La pestaña nueva del modelo reutiliza las claves `panel.colores.*` ya bilingües; solo se agrega
  una etiqueta de navegación nueva (el nombre de la pestaña), en `es.json` y `en.json`.
- **Moneda: sigue sin aplicar.** Este feature no toca precios.

### III. Cero alcance fantasma — PASA

Cada requisito de la spec queda trazado a una tabla/columna o ruta concreta en
[data-model.md](./data-model.md#trazabilidad-requisito--tablacampo) y
[contracts/api.md](./contracts/api.md). No se planifica: función de copiar/reutilizar un color entre
modelos (FR-008, explícitamente fuera), cambios al motor de composición de imágenes, ni un tablero de
migraciones reutilizable — todo fuera de alcance en la spec.

### IV. Verificable por una persona no técnica — PASA

[quickstart.md](./quickstart.md) cubre las tres historias de usuario (crear un color propio,
migración sin regresión visual, edición aislada) como recorridos observables por el panel y el
configurador público, sin mirar la base de datos.

### V. Datos del usuario con respeto — PASA

- No se pide ningún dato personal nuevo; los colores son atributos de catálogo, no del cliente.
- Las solicitudes de cliente ya enviadas no se tocan: guardan una copia congelada del color, no una
  referencia viva (research.md#5, verificado en `lib/solicitud/snapshot.ts`).
- Sin variables de entorno ni secretos nuevos.

**Resultado del gate inicial: PASA.** Sin violaciones que justificar.

**Re-evaluación tras el diseño de Fase 1: PASA.** El diseño de datos (una columna FK nueva más un
script de backfill de un solo uso) no introdujo ninguna pieza que requiera justificación en
Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/007-colores-por-modelo/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── api.md            # Phase 1 output
└── tasks.md              # Phase 2 output (/speckit-tasks command — NOT created by /speckit-plan)
```

### Source Code (repository root)

Aplicación única existente, extendida y reorganizada en los mismos directorios que ya usan
`componentes`/`zonas`/`tallas` como patrón de "recurso dentro de un modelo":

```text
lib/
├── db/
│   └── schema.ts                          # color + model_id (FK a cap_model, cascade)
├── catalogo/
│   ├── consultas-traducidas.ts            # colorConNombre(): + modelId en la proyección
│   ├── model-manifest.ts                  # loadModelManifest(): colores acotados a este modelo
│   └── publicacion.ts                     # sin cambios (función pura, ya recibe la lista filtrada)
└── http/
    └── errors.ts                          # + modeloNoCoincide() (422), mismo patrón que material

scripts/
└── migrar-colores-por-modelo.ts           # nuevo — backfill de un solo uso (research.md#2)

drizzle/
├── 0004_<nombre-generado>.sql             # migración 1: color.model_id nullable + FK
└── 0005_<nombre-generado>.sql             # migración 2: color.model_id NOT NULL (tras el backfill)

app/api/panel/
├── colores/
│   └── [id]/route.ts                      # PATCH/DELETE sin cambios (color.id ya es único)
├── modelos/[id]/
│   ├── colores/route.ts                   # nuevo — POST crea color con model_id = :id
│   └── publicar/route.ts                  # colorConNombre() acotado a este modelo
└── componentes/[id]/
    └── colores/route.ts                   # POST: + validación color.modelId === component.modelId

app/[locale]/panel/(protected)/
├── _PanelNav.tsx                          # se retira el enlace de nivel superior "Colores"
├── colores/                               # se elimina por completo (page.tsx, [id]/page.tsx, [id]/_ColorForm.tsx)
└── modelos/[id]/
    ├── page.tsx                            # + tarjeta "Colores" en el hub del modelo
    ├── colores/
    │   ├── page.tsx                        # nuevo — lista de colores de este modelo
    │   └── [colorId]/
    │       ├── page.tsx                    # nuevo — crear/editar (mismo patrón que colores/[id] de hoy)
    │       └── _ColorForm.tsx              # nuevo — mismo formulario de hoy, sin campo de modelo (implícito en la URL)
    └── componentes/
        └── page.tsx                        # colorConNombre() acotado a este modelo

messages/
├── es.json                                # + panel.modelos.colors (nombre de pestaña); se retira nav.colors si queda sin uso
└── en.json                                # ídem
```

**Structure Decision**: una sola aplicación Next.js (App Router), sin proyectos nuevos. La gestión de
colores se mueve al mismo nivel que `componentes`, `zonas` y `tallas` dentro de la ficha del modelo,
seguiéndose el mismo patrón de carpetas que esas tres ya establecieron — no se inventa una
organización nueva.

## Complexity Tracking

*Sin violaciones que justificar — el gate de Constitution Check pasó sin excepciones.*
