# Tasks: Colores propios por modelo

**Input**: Design documents from `/specs/007-colores-por-modelo/`
**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/api.md](./contracts/api.md), [quickstart.md](./quickstart.md)

**Tests**: este feature no introduce ninguna función pura nueva (`lib/catalogo/publicacion.ts` no
cambia — plan.md#Testing) y el proyecto no tiene arnés de pruebas de integración con base de datos
(todas las de `tests/` son funciones puras). Por eso no hay tareas de Vitest nuevas; la migración de
datos y el aislamiento por modelo se verifican con consultas directas (T018) y recorriendo la app
según [quickstart.md](./quickstart.md) (Principio IV), incluidas abajo como tareas explícitas dentro
de cada historia — no solo como pulido final.

**Organization**: Tareas agrupadas por historia de usuario de
[spec.md](./spec.md#user-scenarios--testing-mandatory). Todos los paths son relativos a la raíz del
repo, en la app Next.js única ya existente.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: se puede ejecutar en paralelo con otras tareas [P] de la misma fase (archivos distintos, sin dependencia entre sí)
- **[Story]**: US1, US2, US3 — mapea a las historias de spec.md
- Cada tarea trae su ruta de archivo exacta

---

## Phase 1: Setup

**Purpose**: confirmar que no hace falta ninguna dependencia ni configuración nueva antes de tocar código.

- [X] T001 Ejecutar `npm install` y `npm run dev` para confirmar que el entorno arranca sin cambios de dependencias (research.md#Justificación de dependencias: ninguna dependencia nueva). `npm install` confirma "up to date, audited 520 packages", sin dependencias nuevas.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: la columna nueva de propiedad del color y el error compartido que todas las historias necesitan antes de empezar.

**⚠️ CRITICAL**: ninguna historia de usuario puede empezar hasta que esta fase esté completa.

- [X] T002 Agregar `color.modelId` (uuid, FK a `cap_model.id`, `onDelete: cascade`, **nullable por ahora**) a `lib/db/schema.ts` (data-model.md#tabla-existente-extendida)
- [X] T003 Generar la migración 1 (`npm run db:generate`) a partir de T002 → `drizzle/0004_fresh_violations.sql` (columna nullable + FK, revisado). **Pendiente**: `npm run db:migrate` para aplicarla — este entorno no tiene `DATABASE_URL` configurado, así que la aplicación real queda para quien despliegue con acceso a la base.
- [X] T004 ~~Agregar el atajo `modeloNoCoincide` a `lib/http/errors.ts`~~ — se descartó: `material_no_coincide` (la validación hermana ya existente) no usa un atajo en `errors`, llama `apiError(422, "material_no_coincide", ...)` directo en la ruta. Para no introducir un patrón nuevo donde ya hay uno establecido, T008 hace lo mismo con `apiError(422, "modelo_no_coincide", ...)`.
- [X] T005 [P] Agregar `modelId` a la proyección de `colorConNombre()` en `lib/catalogo/consultas-traducidas.ts` para que las páginas del panel puedan filtrar/mostrar el dueño de cada color (data-model.md)

**Checkpoint**: esquema y utilidades listos. Las historias de usuario pueden empezar.

---

## Phase 3: User Story 1 - Crear colores propios de un modelo (Priority: P1) 🎯 MVP

**Goal**: crear, editar y eliminar colores solo dentro de la ficha de un modelo; la sección global
`/panel/colores` desaparece; la pestaña de componentes de cada modelo solo ofrece los colores de ese
mismo modelo.

**Independent Test**: crear un color nuevo dentro del Modelo A y confirmar que no aparece al editar
el Modelo B; confirmar que ya no existe ningún enlace de nivel superior "Colores" en el panel
(spec.md, US1 Acceptance Scenarios 1-3).

### Implementation for User Story 1

- [X] T006 [P] [US1] Crear `POST /api/panel/modelos/[id]/colores/route.ts`: crea un color con `modelId` tomado de la URL, misma validación que la ruta que reemplaza (nombre en ambos idiomas, `supplierRef`, `material` de la lista fija, `sampleImageUrl`) (contracts/api.md)
- [X] T007 [US1] Eliminar `app/api/panel/colores/route.ts` (el `POST` se reemplazó por T006; `PATCH`/`DELETE` de `app/api/panel/colores/[id]/route.ts` no se tocan) (contracts/api.md)
- [X] T008 [P] [US1] Agregar la validación `color.modelId === component.modelId` (`apiError(422, "modelo_no_coincide")`, mismo estilo directo que `material_no_coincide` — ver nota en T004) en `POST /api/panel/componentes/[id]/colores/route.ts`, junto a la comprobación de material ya existente (contracts/api.md, data-model.md#component_color)
- [X] T009 [P] [US1] Crear `app/[locale]/panel/(protected)/modelos/[id]/colores/[colorId]/_ColorForm.tsx`, adaptando el formulario existente hoy en `colores/[id]/_ColorForm.tsx` (nombre es/en, referencia de proveedor, material, muestra, estado), publicando contra la ruta de T006 al crear (`colorId === "nuevo"`) y contra `PATCH /api/panel/colores/:id` al editar (sin cambios en esa ruta). De paso, homologa el prefijo de subida de la muestra a `modelos/{modelId}/colores` (antes `colores`), igual que ya hace `ColorVariante.tsx` con las imágenes de componente.
- [X] T010 [US1] Crear `app/[locale]/panel/(protected)/modelos/[id]/colores/[colorId]/page.tsx` (mismo patrón que `colores/[id]/page.tsx` de hoy: crea si `colorId === "nuevo"`, edita si existe y pertenece a este modelo) renderizando `_ColorForm.tsx` de T009 — depende de T009
- [X] T011 [P] [US1] Crear `app/[locale]/panel/(protected)/modelos/[id]/colores/page.tsx`: lista los colores de este modelo (`colorConNombre().where(eq(color.modelId, id))`), con acción "Nuevo color" hacia T010 y encabezado con vuelta al hub del modelo (mismo layout que `colores/page.tsx` de hoy)
- [X] T012 [P] [US1] Agregar la tarjeta "Colores" al hub del modelo en `app/[locale]/panel/(protected)/modelos/[id]/page.tsx` (`SECTION_ICONS.colores = "palette"`, nueva entrada en `sections`, antes de "Componentes")
- [X] T013 [P] [US1] Acotar la consulta de colores en `app/[locale]/panel/(protected)/modelos/[id]/componentes/page.tsx` a `eq(color.modelId, id)` en vez de traer el catálogo completo (data-model.md#manifiesto-del-modelo — mismo criterio de acotar por modelo)
- [X] T014 [P] [US1] Eliminar la sección global de colores: `app/[locale]/panel/(protected)/colores/page.tsx`, `app/[locale]/panel/(protected)/colores/[id]/page.tsx`, `app/[locale]/panel/(protected)/colores/[id]/_ColorForm.tsx`
- [X] T015 [P] [US1] Quitar la entrada `{ href: "/colores", label: t("nav.colors") }` de `PANEL_NAV_LINKS` en `app/[locale]/panel/(protected)/_PanelNav.tsx`
- [X] T016 [P] [US1] Agregar la clave `panel.modelos.colors` (nombre de la tarjeta/pestaña) a `messages/es.json` y `messages/en.json`; `nav.colors` quedó sin ningún uso tras T015 (confirmado por grep) y se retiró de ambos archivos

**Verificación de fase**: `rm -rf .next && npm run typecheck && npm run lint` → sin errores (2 warnings preexistentes en `app/layout.tsx`, no relacionados con este feature).

**Checkpoint**: en este punto, crear/editar/eliminar colores dentro de un modelo funciona de punta a
punta, la sección global ya no existe, y ningún color de un modelo se ofrece en otro.

---

## Phase 4: User Story 2 - Migración segura de colores existentes (Priority: P2)

**Goal**: los colores hoy compartidos entre varios modelos se reparten automáticamente (o se
duplican) por modelo sin cambiar la apariencia de ningún modelo ya publicado, y los colores
huérfanos se descartan.

**Independent Test**: tomar un color hoy compartido por dos o más modelos, correr la migración, y
confirmar que cada modelo termina con su propia copia idéntica en apariencia y que el configurador
público de cada uno se ve exactamente igual que antes (spec.md, US2 Acceptance Scenarios 1-3).

### Implementation for User Story 2

- [X] T017 [US2] Escribir `scripts/migrar-colores-por-modelo.ts`: por cada color, calcular los modelos que lo usan hoy vía `component_color` → `component.modelId`; sin modelos que lo usen, descartarlo (color + traducciones); un solo modelo, asignarle `modelId` directo; varios modelos, quedarse con el más antiguo (por `cap_model.createdAt` — corregido en data-model.md/research.md durante la implementación: `component` no tiene su propia fecha de creación) en la fila original y crear una copia (color + traducciones) por cada modelo restante, reapuntando sus propios `component_color`, `component_image` y `component.defaultColorId` hacia la copia — agrupando las escrituras de cada color en un único `db.batch(...)` (research.md#2, data-model.md#migración-de-datos-existentes). Es re-ejecutable sin duplicar: salta los colores que ya tienen `modelId`.
- [X] T018 [US2] Correr el script contra la base real del usuario (`.env.local` sí tenía `DATABASE_URL`, disponible una vez el usuario abrió su propio `npm run dev`) y confirmar por consulta directa que todo `color` quedó con `modelId` — depende de T017, T003. **Encontrado al correr T003 por primera vez**: `npm run db:migrate` falló en la migración `0003_young_blue_marvel` ("column moq already exists") por un desfase de bookkeeping *previo a este feature*: el historial real de esta base (`drizzle.__drizzle_migrations`) tiene 2 filas cuyo hash no corresponde a ningún archivo hoy en `drizzle/` — coincide con la nota de `006-configurador-stepper` sobre un catálogo de telas que se construyó, se aplicó a esta misma base, y se borró sin migración de reversión; `0003_young_blue_marvel.sql` es una regeneración con otro hash del mismo cambio neto (agregar `moq`), que esta base nunca corrió realmente porque la columna ya existía por otra vía. Se consultó al usuario (AskUserQuestion) antes de tocar la tabla de bookkeeping; eligió "registrar 0003 como aplicada". Se corrigió insertando la fila con el `created_at` correcto (el `when` real de 0003 en `_journal.json`, no `Date.now()` — el migrador de Drizzle solo mira la fila con el `created_at` más alto y corre todo archivo con timestamp de carpeta mayor a ese, así que un valor "de hoy" habría hecho que se saltara también 0004 y 0005 sin avisar, como pasó en el primer intento). Para no correr 0005 (`NOT NULL`) antes del backfill, se retiró temporalmente la entrada de 0005 de `drizzle/meta/_journal.json`, se corrió `npm run db:migrate` (solo aplicó 0004), se corrió el backfill, se restauró la entrada de 0005, y se corrió `npm run db:migrate` de nuevo (aplicó 0005). Verificado por consulta directa: 1 color existente, ya asignado a su modelo (`cae574c3-...`, el mismo que reportó el error original del usuario), 0 huérfanos, 0 duplicados (no estaba compartido).
- [X] T019 [US2] Volver `color.modelId` `notNull()` en `lib/db/schema.ts`
- [X] T020 [US2] Generar y aplicar la migración 2 (`npm run db:generate` → `drizzle/0005_lush_gambit.sql`, luego `npm run db:migrate`) — aplicada contra la base real tras T018 (ver nota ahí); verificado por `information_schema.columns`: `color.model_id` es `uuid NOT NULL`.
- [X] T021 [US2] Verificado con `loadModelManifest("cae574c3-...")` (el modelo del error original del usuario): ya no lanza el error de columna faltante, devuelve el manifiesto completo con el color "Negro" correctamente escopeado a ese modelo. **Recorrido manual completo de quickstart.md Parte 1 (comparación visual antes/después en el navegador, PDF de solicitud)**: no se hizo — solo había un color en la base real y no estaba compartido entre modelos, así que no hay un caso de "antes/después de duplicar" que recorrer visualmente; queda para cuando exista un caso real de colores compartidos.

**Checkpoint**: los datos existentes quedan completamente migrados, `color.model_id` es obligatorio
en la base, y se confirmó que nada visual cambió para modelos ni solicitudes previas.

---

## Phase 5: User Story 3 - Edición aislada por modelo (Priority: P3)

**Goal**: editar, cambiar el estado o eliminar un color (o eliminar un modelo entero) nunca afecta a
otro modelo, ni siquiera a uno que comparta el mismo color de origen antes de la migración.

**Independent Test**: editar o eliminar un color dentro del Modelo A y confirmar que el color
equivalente del Modelo B no cambia; eliminar un modelo de prueba y confirmar que solo desaparecen sus
propios colores (spec.md, US3 Acceptance Scenarios 1-2).

### Implementation for User Story 3

- [X] T022 [P] [US3] Acotar la consulta de colores en `app/api/panel/modelos/[id]/publicar/route.ts` a `eq(color.modelId, id)` en vez de traer el catálogo completo (data-model.md#ficha-de-publicación — sin cambio de contrato, solo deja de traer filas de otros modelos)
- [X] T022b [P] [US3] **Tarea agregada durante la implementación** (omitida al generar tasks.md, aunque ya estaba en plan.md#Project-Structure y data-model.md#manifiesto-del-modelo): acotar la consulta de colores en `loadModelManifest()` (`lib/catalogo/model-manifest.ts`) a `eq(color.modelId, modelId)` — sin este cambio, el configurador **público** seguiría recibiendo el catálogo completo aunque el panel ya estuviera aislado por modelo; es el mismo bug original del usuario visto desde el lado del cliente, no solo del panel.
- [ ] T023 [US3] Recorrer la Parte 3 de [quickstart.md](./quickstart.md): editar/descontinuar un color en un modelo y confirmar que su equivalente en otro modelo no cambia; quitar las vistas habilitadas de un color propio de un modelo de prueba, eliminarlo, y confirmar que solo desaparece de ese modelo; eliminar el modelo de prueba completo y confirmar que solo se van sus propios colores sin afectar a otros (FR-007, FR-010) — depende de T013, T021 (necesita colores ya migrados para comparar equivalentes reales). **Pendiente**: la base real ya está migrada (T018), pero solo tiene 1 modelo con colores propios — no hay todavía un segundo modelo con un color "equivalente" para comparar en el navegador. Queda para cuando el usuario cree un segundo modelo con colores, o lo pruebe él mismo en `/es/panel`.

**Checkpoint**: el aislamiento por modelo queda verificado en los tres frentes — editar, borrar un
color, y borrar un modelo completo.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: verificación final que atraviesa las tres historias.

- [X] T024 [P] Ejecutar `npm run typecheck` y `npm run lint` y corregir lo que señalen en los archivos nuevos/modificados — ambos en verde (solo 2 warnings preexistentes de `@next/next/no-page-custom-font` en `app/layout.tsx`, no relacionados)
- [X] T025 [P] Ejecutar `npm test` y confirmar que `tests/traducciones.test.ts` (paridad es/en) sigue en verde con la clave `panel.modelos.colors` nueva y sin `nav.colors` huérfana, y que `tests/publicacion.test.ts` sigue en verde sin cambios — 8 archivos, 51 pruebas, todas en verde
- [X] T026 Buscar con `grep -rn "panel/colores\|nav.colors"` en el repo (fuera de `specs/`) tras T007/T014/T015/T016 y limpiar cualquier referencia colgante a la sección global eliminada — las dos únicas coincidencias son intencionales (`PATCH /api/panel/colores/:id`, que no se movió, y un comentario que menciona la ruta vieja por contexto histórico)
- [ ] T027 Recorrer [quickstart.md](./quickstart.md) completo (Partes 1 a 3) de punta a punta en una sola pasada final, confirmando que las tres historias siguen funcionando juntas. **Parcialmente verificado**: la base real ya está migrada y `loadModelManifest()` del modelo que daba el error original del usuario ya responde bien (T021); falta el recorrido en navegador (crear un color en el panel, confirmar que no aparece en otro modelo, etc. — este entorno no tiene navegador) y el caso de dos modelos con colores equivalentes (T023, bloqueado por lo mismo que ahí). Queda para que el usuario lo prueba en su propio `npm run dev`.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sin dependencias — puede empezar de inmediato.
- **Foundational (Phase 2)**: depende de Setup. Bloquea las tres historias.
- **User Stories (Phase 3-5)**: todas dependen de Foundational. Entre ellas:
  - **US1 es la base de las otras dos**: US2 necesita que `color.modelId` ya se pueda poblar (Foundational alcanza para eso), pero comparar "equivalentes" en US3 solo tiene sentido después de que US2 migró los datos existentes.
  - **US2 depende de Foundational únicamente en código** (T017 se puede escribir sin que US1 exista), pero en la práctica se corre después de que US1 ya está construida, para no migrar datos contra un esquema/UI a medio construir.
  - **US3 depende de US1 (T013) y de US2 (T021)** para tener datos ya migrados que comparar entre dos modelos.
- **Polish (Phase 6)**: depende de que las tres historias estén completas.

### Orden recomendado de construcción

`Foundational → US1 (crear colores por modelo) → US2 (migrar lo existente) → US3 (verificar aislamiento) → Polish`

### Parallel Opportunities

- Dentro de Foundational: T004 y T005 en paralelo entre sí, ambos después de T002-T003.
- Dentro de US1: T006, T008, T009, T011, T012, T013, T014, T015, T016 tocan archivos distintos y
  pueden avanzar en paralelo; T010 depende de T009; T007 conviene hacerlo junto con T006 (misma
  ruta reemplazada).
- Dentro de US3: T022 puede ir en paralelo con cualquier otra tarea, ya que es un archivo aparte.
- US2 (T017-T021) puede escribirse en paralelo con US1 por un segundo desarrollador, aunque conviene
  correr el script (T018) después de que la UI de US1 exista, para poder verificar visualmente el
  resultado en el panel además de por consulta directa.

---

## Parallel Example: User Story 1

```bash
Task: "Crear POST /api/panel/modelos/[id]/colores/route.ts"
Task: "Agregar la validación color.modelId === component.modelId en /api/panel/componentes/[id]/colores/route.ts"
Task: "Crear app/[locale]/panel/(protected)/modelos/[id]/colores/[colorId]/_ColorForm.tsx"
Task: "Agregar la tarjeta 'Colores' al hub del modelo en app/[locale]/panel/(protected)/modelos/[id]/page.tsx"
Task: "Acotar la consulta de colores en app/[locale]/panel/(protected)/modelos/[id]/componentes/page.tsx"
Task: "Eliminar la sección global app/[locale]/panel/(protected)/colores/"
Task: "Quitar el enlace 'Colores' de app/[locale]/panel/(protected)/_PanelNav.tsx"
```

---

## Implementation Strategy

### MVP (User Story 1)

1. Completar Phase 1 (Setup) y Phase 2 (Foundational) — bloquean todo lo demás.
2. Completar Phase 3 (US1): crear/editar/eliminar colores dentro de un modelo, sección global
   retirada.
3. **DETENER y VALIDAR**: recorrer la Parte 2 de quickstart.md. Ya es una demo completa del cambio
   central que pidió el usuario, aunque los datos existentes todavía no se hayan migrado.

### Incremento siguiente (User Story 2, luego User Story 3)

4. Completar Phase 4 (US2): migrar los datos existentes, imponer `NOT NULL`.
5. Recorrer la Parte 1 de quickstart.md (con datos previos a la migración, si el ambiente los
   tiene).
6. Completar Phase 5 (US3): acotar la consulta de publicación, verificar aislamiento.
7. Recorrer la Parte 3 de quickstart.md.
8. Completar Phase 6 (Polish): typecheck, lint, pruebas, búsqueda de referencias colgantes,
   recorrido final completo.

### Entrega incremental

Cada fase de historia de usuario es un incremento demostrable por separado: Foundational no se ve
(es esquema), US1 ya es demostrable en el panel sola (con modelos nuevos o vacíos de color), US2
cierra la migración de lo que ya existía, y US3 confirma que el aislamiento se sostiene en el día a
día.

---

## Post-implementación (2026-09-06): simplificación del formulario de color

Al probar T027 en el navegador real, el usuario encontró el formulario de "Nuevo color" (T009/T010)
demasiado cargado y pidió retirar `supplierRef`, `material` y `status` por completo — del
formulario y de la base de datos; solo nombre e imagen de muestra. Ver la Enmienda 2026-09-06 en
spec.md y data-model.md. Cambios aplicados (mismo ciclo typecheck/lint/test que el resto de este
feature, todo en verde):

- `lib/db/schema.ts`: `color` pierde `supplierRef`, `material`, `status`; se retira `colorStatusEnum`.
- Migración `drizzle/0006_cuddly_toad_men.sql` (DROP COLUMN ×3 + DROP TYPE), generada y **aplicada
  contra la base real** del usuario (verificado por `information_schema.columns`: solo quedan `id`,
  `model_id`, `sample_image_url`, `created_at`).
- `POST /api/panel/modelos/[id]/colores`, `PATCH /api/panel/colores/[id]`: ya no piden ni validan
  esos 3 campos.
- `POST /api/panel/componentes/[id]/colores`: se retira la validación `material_no_coincide` (RN6
  de `001-configurador-gorras`) — sin `color.material` no hay nada que comparar; cualquier color del
  modelo puede habilitarse en cualquier componente personalizable de ese modelo.
- `_ColorForm.tsx`, la página de creación/edición y la lista de colores: solo nombre + imagen.
- `lib/catalogo/{consultas-traducidas,model-manifest,publicacion}.ts`,
  `app/api/panel/modelos/[id]/publicar/route.ts`: dejan de proyectar/usar `supplierRef`/`status`.
- `SelectorColor.tsx`, `ConfiguradorApp.tsx`, `app/api/solicitudes/route.ts`: ya no filtran/validan
  por `status === "available"` (todo color habilitado se considera disponible).
- `lib/solicitud/snapshot.ts`, la ficha de solicitud del panel y el PDF de producción: dejan de
  copiar/imprimir `supplierRef` en el diseño congelado de solicitudes **nuevas** (las ya enviadas
  antes de este cambio conservan su `supplierRef` en el JSON guardado, simplemente ya no se
  muestra).
- `scripts/migrar-colores-por-modelo.ts` se eliminó: ya cumplió su propósito (T018) y sus
  referencias a las columnas retiradas dejaron de tener sentido.
- `tests/publicacion.test.ts`: el caso de "color por defecto agotado" se reescribió como "color por
  defecto no habilitado", ya que el estado ya no existe.
- `messages/es.json` / `messages/en.json`: se retiraron `panel.colores.supplierRef`,
  `.selectMaterial`, `.status.*`, `.deleteConfirm`, `.discontinueInstead` (huérfanas); se conserva
  `panel.colores.material` porque el formulario de **componente** (no el de color) sigue
  reutilizando esa misma clave para su propio campo de material.

## Post-implementación (2026-09-06), parte 2: también se retira la imagen de muestra

El usuario pidió, en un mensaje aparte, dejar el formulario de color con *solo* el nombre —
también la imagen de muestra. Antes de tocar nada se le consultó (AskUserQuestion): esa imagen no
era solo cosmética, alimentaba el patrón de relleno del texto personalizado con color en
`lib/design/compose.ts` (sin ella, todo texto se dibuja en un color de reserva fijo sin importar
qué color se elige). El usuario confirmó seguir adelante sabiendo esto. Cambios (mismo ciclo
typecheck/lint/test, todo en verde; migración generada y **aplicada contra la base real**):

- `lib/db/schema.ts`: `color` pierde `sampleImageUrl`; solo quedan `id`, `modelId`, `createdAt`
  (el nombre sigue viviendo en `color_translation`).
- Migración `drizzle/0007_round_hawkeye.sql` (`DROP COLUMN sample_image_url`), aplicada y
  verificada por `information_schema.columns`.
- `POST /api/panel/modelos/[id]/colores`, `PATCH /api/panel/colores/[id]`: ya no piden ni validan
  `sampleImageUrl`; el PATCH se simplificó porque `color` ya no tiene ningún campo propio editable
  además del nombre (que vive en `color_translation`).
- `_ColorForm.tsx`: se retira `SubidaArchivo` por completo; el formulario queda con un solo campo
  (`CampoTraducible` de nombre) y un botón Guardar que solo depende de `saving`.
- La lista de colores del modelo deja de mostrar la miniatura.
- `lib/catalogo/{consultas-traducidas,model-manifest}.ts`, `lib/solicitud/snapshot.ts`: dejan de
  proyectar/copiar `sampleImageUrl`.
- `SelectorColor.tsx` (selector de color del configurador público): el botón de cada color deja de
  mostrar una miniatura de imagen; queda como una pastilla con el nombre del color como texto.
- `lib/design/compose.ts#renderTextSource`: pierde el parámetro `swatch`; el texto personalizado
  siempre se rellena con `#111827`. `Decoracion.tsx` pierde `findSwatchUrl()` y la prop
  `textSwatchUrl`, que ya no tenían de dónde sacar una imagen.
- `messages/es.json` / `messages/en.json`: se retiró `panel.colores.sampleImage` (huérfana).
