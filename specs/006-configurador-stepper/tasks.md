# Tasks: Configurador en pasos

**Input**: Design documents from `/specs/006-configurador-stepper/`
**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/api.md](./contracts/api.md), [quickstart.md](./quickstart.md)

**Tests**: research.md#6 comprometió pruebas Vitest para las dos reglas puras nuevas
(`puedeAvanzarPaso`, `moqEfectivo`); están incluidas. El resto del feature se verifica con
[quickstart.md](./quickstart.md) (Principio IV de la constitution), no con pruebas automáticas.

**Organization**: Tareas agrupadas por historia de usuario de [spec.md](./spec.md#user-scenarios--testing-mandatory).
Todos los paths son relativos a la raíz del repo, en la app Next.js única ya existente.

> **Nota (Enmienda 2026-09-06 (3) de spec.md)**: esta lista tuvo originalmente una Historia de
> Usuario 2 completa ("Elegir la tela del modelo") más tareas de catálogo de telas dentro de lo que
> hoy es la Historia 2 (MOQ) y de lo que hoy es la Historia 3 (solicitud). Todo ese trabajo se
> construyó, se probó y se eliminó por completo — código, migraciones y claves de traducción — junto
> con la decisión de retirar la selección de tela del alcance. Las tareas que sobreviven abajo están
> renumeradas como US1/US2/US3 para que coincidan con las historias vigentes de spec.md.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: se puede ejecutar en paralelo con otras tareas [P] de la misma fase (archivos distintos, sin dependencia entre sí)
- **[Story]**: US1, US2, US3 — mapea a las historias de spec.md
- Cada tarea trae su ruta de archivo exacta

---

## Phase 1: Setup

**Purpose**: confirmar que no hace falta ninguna dependencia ni configuración nueva antes de tocar código.

- [X] T001 Ejecutar `npm install` y `npm run dev` para confirmar que el entorno arranca sin cambios de dependencias (research.md#Justificación de dependencias: ninguna dependencia nueva)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: esquema de datos y manifiesto del cliente extendidos — todo lo que las tres historias
necesitan antes de empezar.

**⚠️ CRITICAL**: ninguna historia de usuario puede empezar hasta que esta fase esté completa.

- [X] T002 Agregar columna `moq` en `cap_model` a `lib/db/schema.ts` (data-model.md#tabla-existente-extendida)
- [X] T003 Generar y aplicar la migración de Drizzle (`npm run db:generate` seguido de `npm run db:migrate`) a partir de T002, revisando el SQL generado en `drizzle/`. Generada en `drizzle/0003_young_blue_marvel.sql`, aplicada y verificada por consulta directa: `cap_model.moq` ya existe en la base de datos.
- [X] T005 Extender `loadModelManifest()` en `lib/catalogo/model-manifest.ts` para incluir `moq` (`cap_model.moq ?? 1`) (data-model.md#manifiesto-del-modelo, contracts/api.md)

**Checkpoint**: esquema y manifiesto listos. Las historias de usuario pueden empezar.

---

## Phase 3: User Story 1 - Recorrer el configurador paso a paso (Priority: P1) 🎯 MVP (junto con US2)

**Goal**: el panel de personalización del configurador se recorre como un stepper de tres pasos
(colores, logo, resumen) con indicador de progreso, salto a paso visitado y navegación
Atrás/Siguiente, reutilizando sin cambios el motor de color y decoración de `001-configurador-gorras`.

**Independent Test**: abrir el configurador de un modelo publicado, confirmar que solo el paso 1
está activo y el resto atenuado, avanzar hasta el paso 3 con "Siguiente", retroceder con "Atrás" y
saltar al paso 2 haciendo clic en su indicador; en todos los casos el contenido corresponde al paso
seleccionado y no se pierde nada ya elegido (spec.md, US1 Acceptance Scenarios 1-5).

### Implementation for User Story 1

- [X] T007 [P] [US1] Crear `Stepper.tsx` (indicador de progreso: número de paso, check al completar, línea vertical, clic para saltar a un paso visitado, botones Atrás/Siguiente que cambian a "Solicitar cotización" en el último paso) en `app/[locale]/(site)/configurador/[modelId]/_components/Stepper.tsx` (FR-013, FR-014, FR-015, FR-017)
- [X] T008 [US1] Agregar `puedeAvanzarPaso(paso, draft, customizableComponentIds)` a `lib/design/rules.ts` implementando FR-018 (al menos un color por componente personalizable en el paso 1; el paso 2 —logo— nunca bloquea)
- [X] T009 [P] [US1] Agregar casos Vitest para `puedeAvanzarPaso()` en `tests/design-rules.test.ts` (research.md#6)
- [X] T010 [P] [US1] Crear `PasoColores.tsx`, envolviendo el `SelectorColor.tsx` existente para mostrar una paleta en cuadrícula de swatches por cada componente personalizable (no una paleta global) en `app/[locale]/(site)/configurador/[modelId]/_components/PasoColores.tsx` (spec.md Clarifications: paso "Personalizar colores")
- [X] T011 [P] [US1] Crear `PasoLogo.tsx`, envolviendo `PanelDecoracion.tsx` y `SelectorTecnica.tsx` existentes más los botones de atajo de posición (Front Center/Left/Right/Back) que solo fijan la zona activa antes del arrastre/resize libre ya construido en `app/[locale]/(site)/configurador/[modelId]/_components/PasoLogo.tsx` (spec.md Clarifications: paso "Colocación de logo")
- [X] T012 [P] [US1] Crear el cascarón de `PasoResumen.tsx` mostrando color por componente y logo/texto elegidos, o "sin decoración" si no hay ninguno, en `app/[locale]/(site)/configurador/[modelId]/_components/PasoResumen.tsx` (FR-019) — la cantidad/MOQ y el botón final se agregan en US3 (T033)
- [X] T013 [US1] Refactorizar `ConfiguradorApp.tsx` para mantener `currentStep` en estado (inicial 1), renderizar `Stepper` junto al `PasoX` activo, adoptar la disposición de dos regiones del mockup (visor a la izquierda con `CapasGorra`/`Decoracion`/`Vistas`/`AvisoDisponibilidad` sin cambios, panel de personalización a la derecha con el stepper) y reubicar el control `Restablecer.tsx` existente en el pie del panel, preservando FR-030 de `001-configurador-gorras` (depende de T007, T008, T010, T011, T012)
- [X] T014 [P] [US1] Agregar las claves `configurador.step.*` (títulos de los 3 pasos, "sin decoración") a `messages/es.json` y `messages/en.json`

**Checkpoint**: el stepper es navegable de punta a punta.

---

## Phase 4: User Story 2 - Administrar el MOQ del modelo (Priority: P1) 🎯 MVP (junto con US1)

**Goal**: el administrador define, por modelo, la cantidad mínima de pedido (MOQ) que el cliente
verá como mínimo en el paso de resumen.

**Independent Test**: entrar al panel, definir el MOQ de un modelo existente, y verificar que ese
valor aparece en el configurador de ese modelo (spec.md, US2 Acceptance Scenario 1).

### Implementation for User Story 2

- [X] T022 [US2] Extender `PATCH /api/panel/modelos/:id` en `app/api/panel/modelos/[id]/route.ts` para aceptar `moq` opcional (entero ≥ 1, `400 datos_invalidos` si no) (FR-010, contracts/api.md)
- [X] T028 [US2] Añadir el campo MOQ a `app/[locale]/panel/(protected)/modelos/_ModeloForm.tsx` (FR-010)

**Checkpoint**: US1 + US2 completas — MVP: configurador en pasos administrable desde el panel, sin precio.

---

## Phase 5: User Story 3 - Pasar del resumen a la solicitud de cotización (Priority: P2)

**Goal**: el paso de resumen agrega el control de cantidad con el mínimo MOQ del modelo y el botón
"Solicitar cotización" lleva a la pantalla de solicitud existente con esa cantidad ya cargada.

**Independent Test**: con un diseño completo en el paso de resumen, ajustar la cantidad, pulsar
"Solicitar cotización", llegar a `/solicitud` con esa cantidad ya cargada, completar la distribución
por tallas y los datos de contacto, enviar y confirmar que aparece el código de solicitud (spec.md,
US3 Acceptance Scenarios 1-4).

### Implementation for User Story 3

- [X] T031 [US3] Agregar `moqEfectivo(moq)` a `lib/design/rules.ts` implementando FR-012 (`null` → 1) (research.md#6)
- [X] T032 [P] [US3] Agregar casos Vitest para `moqEfectivo()` en `tests/design-rules.test.ts` (research.md#6)
- [X] T033 [US3] Extender `PasoResumen.tsx` (T012) con el control de cantidad (mínimo `moqEfectivo(manifest.moq)`, botones +/-) y el botón "Solicitar cotización" que navega a `/{locale}/solicitud?qty=<cantidad>` (FR-011, FR-017, FR-021, contracts/api.md)

**Aviso de modelo despublicado en el resumen** (FR-022 — no existe hoy ningún mecanismo que revise esto dentro del propio configurador; `AvisoDisponibilidad` solo compara contra el manifiesto ya cargado, no vuelve a consultar el servidor):

- [X] T034 [US3] Al llegar al último paso en `ConfiguradorApp.tsx`, volver a pedir `GET /api/imagenes-modelo/:modelId`; si responde `404`, mostrar el aviso de no disponible y deshabilitar "Solicitar cotización" (mismo patrón de pedir-y-detectar-404 que ya usa el `useEffect` de `SolicitudApp.tsx`, aplicado aquí por primera vez dentro del configurador) (FR-022)
- [X] T035 [US3] Leer `qty` desde `useSearchParams()` en `app/[locale]/(site)/solicitud/_components/SolicitudApp.tsx` como valor inicial de `quantity` cuando es un entero ≥ 1 válido (FR-021, contracts/api.md)
- [X] T036 [P] [US3] Agregar/ajustar las claves de cantidad y "Solicitar cotización" (reutilizando `configurador.continueToQuote` si aplica) en `messages/es.json` y `messages/en.json`

**Checkpoint**: las tres historias funcionan juntas — el flujo completo, del stepper a la solicitud enviada, queda operativo.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: verificación final que atraviesa las tres historias.

- [X] T037 [P] Ejecutar `npm run typecheck` y `npm run lint` y corregir lo que señalen en los archivos nuevos/modificados
- [X] T038 [P] Ejecutar `npm test` y confirmar que `tests/traducciones.test.ts` (paridad es/en) sigue en verde con todas las claves nuevas
- [ ] T039 Recorrer manualmente las Partes 1, 2 y 3 de [quickstart.md](./quickstart.md) y registrar el resultado. **Pendiente**: la migración (T003) ya está aplicada; solo falta el recorrido manual en un navegador, que este entorno no puede hacer. Queda para quien pruebe la app.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sin dependencias — puede empezar de inmediato.
- **Foundational (Phase 2)**: depende de Setup. Bloquea las tres historias.
- **User Stories (Phase 3-5)**: todas dependen de Foundational. Entre ellas:
  - **US2 es independiente en código** de US1 (solo toca el panel de administración y la ruta PATCH).
  - **US3 depende de US1** (extiende `PasoResumen.tsx` creado en T012) y usa `manifest.moq`, que ya existe desde Foundational.
- **Polish (Phase 6)**: depende de que las historias que se vayan a entregar estén completas.

### Orden recomendado de construcción

`Foundational → US1 (stepper) → US2 (MOQ) → US3 (cantidad y envío) → Polish`

(US2 no depende de US1 en código y puede construirse en paralelo.)

### Parallel Opportunities

- Dentro de Foundational: T005 puede ir en paralelo con cualquier otra tarea de setup independiente tras T002-T003.
- Dentro de US1: T007, T010, T011, T012, T014 en paralelo (archivos distintos); T008 antes que T009.
- Dentro de US3: T032 y T036 en paralelo con el resto.
- US2 completa puede construirse en paralelo con US1 por un segundo desarrollador, ya que no comparte archivos con ella (salvo el manifiesto, ya cerrado en Foundational).

---

## Parallel Example: User Story 1

```bash
Task: "Crear Stepper.tsx en app/[locale]/(site)/configurador/[modelId]/_components/Stepper.tsx"
Task: "Crear PasoColores.tsx en app/[locale]/(site)/configurador/[modelId]/_components/PasoColores.tsx"
Task: "Crear PasoLogo.tsx en app/[locale]/(site)/configurador/[modelId]/_components/PasoLogo.tsx"
Task: "Crear el cascarón de PasoResumen.tsx en app/[locale]/(site)/configurador/[modelId]/_components/PasoResumen.tsx"
```

---

## Implementation Strategy

### MVP (User Stories 1 + 2, ambas P1)

1. Completar Phase 1 (Setup) y Phase 2 (Foundational) — bloquean todo lo demás.
2. Completar Phase 3 (US1): el stepper navegable.
3. Completar Phase 4 (US2): el MOQ administrable desde el panel.
4. **DETENER y VALIDAR**: recorrer la Parte 1 y la Parte 2 (pasos 1-7) de quickstart.md. El
   configurador en pasos ya es una demo completa, aunque el botón final del resumen aún no lleve a
   ningún lado nuevo (usa lo que ya existía).

### Incremento siguiente (User Story 3, P2)

5. Completar Phase 5 (US3): cantidad/MOQ en el resumen y navegación con cantidad sugerida hacia la
   solicitud existente.
6. Recorrer la Parte 2 completa (pasos 8-9) y la Parte 3 (casos límite) de quickstart.md.
7. Completar Phase 6 (Polish): typecheck, lint, paridad de traducciones, recorrido completo.

### Entrega incremental

Cada fase de historia de usuario es un incremento que se puede demostrar por separado: Foundational
no se ve (es infraestructura), US2 ya es demostrable en el panel sola, US1 da el configurador en
pasos funcional, y US3 cierra el ciclo hacia la cotización.
