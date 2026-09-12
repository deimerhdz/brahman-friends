---

description: "Task list template for feature implementation"
---

# Tasks: Formulario de creación de modelo alineado con edición

**Input**: Design documents from `/specs/008-formulario-creacion-modelo/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/post-modelos.md](./contracts/post-modelos.md), [quickstart.md](./quickstart.md)

**Tests**: La spec no pide pruebas automatizadas; la verificación es manual siguiendo
`quickstart.md` (Principio IV de la constitución: verificable por una persona no técnica). No se
generan tareas de tests.

**Organization**: Las tareas se agrupan por user story de `spec.md` para poder implementarlas y
probarlas de forma independiente.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Puede ejecutarse en paralelo (archivos distintos, sin dependencias)
- **[Story]**: A qué user story pertenece (US1, US2)
- Cada tarea incluye la ruta exacta de archivo

## Path Conventions

Proyecto Next.js de un solo repositorio (frontend + rutas API en `app/`). No hay tareas de "Setup"
(Phase 1 del template estándar): no se agregan dependencias ni infraestructura nueva, todo el
trabajo modifica archivos ya existentes del panel.

---

## Phase 1: Foundational (Blocking Prerequisites)

**Purpose**: Cambios compartidos que ambas user stories necesitan antes de poder implementarse.

**⚠️ CRITICAL**: Ninguna user story puede darse por terminada sin esta fase.

- [X] T001 Extender `EncabezadoModelo` en `app/[locale]/panel/(protected)/modelos/[id]/_components/EncabezadoModelo.tsx`: hacer `modelId` y `status` opcionales; agregar una prop opcional (p. ej. `onCodeChange?: (code: string) => void`) que, cuando venga, muestra el campo de código como `<input>` editable en vez de solo lectura; renderizar `<EstadoPublicacion>` únicamente cuando `modelId` y `status` estén definidos (research.md Decisiones 2 y 3).
- [X] T002 [P] Agregar manejo opcional de `price` a `POST /api/panel/modelos` en `app/api/panel/modelos/route.ts`: validar igual que `PATCH` en `app/api/panel/modelos/[id]/route.ts` (número finito ≥ 0, o ausente/`null` → sin precio), guardarlo en la fila `capModel` insertada (`price: body.price != null ? body.price.toFixed(2) : null`) e incluirlo en la respuesta 201 (ver contracts/post-modelos.md).

**Checkpoint**: Con T001 y T002 listos, las dos user stories pueden implementarse.

---

## Phase 2: User Story 1 - Crear modelo con el mismo formulario que se usa para editar (Priority: P1) 🎯 MVP

**Goal**: La pantalla "Nuevo modelo" se ve y se comporta igual que el encabezado de la pantalla de
edición (código, nombre ES/EN, descripción ES/EN, precio), y al guardar crea el modelo y lleva al
configurador existente.

**Independent Test**: Abrir `/panel/modelos/nuevo`, llenar código/nombre/descripción/precio,
guardar, y confirmar que el modelo se crea con esos datos y que la pantalla se ve como la de
edición (Escenarios 1 y 2 de `quickstart.md`).

### Implementation for User Story 1

- [X] T003 [US1] Reescribir `app/[locale]/panel/(protected)/modelos/_ModeloForm.tsx` para renderizar sus campos con `EncabezadoModelo` (pasando `onCodeChange` para que el código sea editable, sin `modelId` ni `status`) en vez de su marcado propio; agregar estado y control para `price`; mantener el botón "Guardar" y el mensaje de error debajo del encabezado, igual estilo que usa el resto del panel. Eliminar la rama muerta de MOQ (`!isNew`) que ya no aplica porque este formulario solo se usa para crear.
- [X] T004 [US1] Actualizar `app/[locale]/panel/(protected)/modelos/nuevo/page.tsx`: agregar `price: ""` al `initial` que se pasa a `ModeloForm` y agregar `labels.price = t("panel.modelos.price")` (la traducción ya existe en `messages/es.json` / `messages/en.json`, reutilizada de la pantalla de edición). *(El valor inicial de `price` quedó como estado por defecto dentro de `ModeloForm` en vez de en `initial`, ya que `ModeloFormValue` dejó de incluir `price`; el efecto es el mismo.)*
- [X] T005 [US1] Actualizar el envío en `_ModeloForm.tsx` (mismo archivo de T003) para incluir `price` en el `body` del `POST /api/panel/modelos` cuando el usuario lo llene (número o ausente si está vacío), consistente con el contrato de `contracts/post-modelos.md`.
- [ ] T006 [US1] Verificación manual: ejecutar los Escenarios 1, 2 y 4 de `specs/008-formulario-creacion-modelo/quickstart.md` (comparación visual del encabezado, creación completa con precio, y creación sin precio). **Pendiente**: requiere sesión de panel real; no se ejecutó para evitar crear datos de prueba en la base de datos configurada en `.env.local` sin confirmación. Typecheck, lint y tests automatizados sí se corrieron (ver T010/T011) y la ruta respondió sin error 500 al probarse sin sesión.

**Checkpoint**: User Story 1 funciona de punta a punta y es demostrable por sí sola.

---

## Phase 3: User Story 2 - No ver controles que todavía no aplican a un modelo nuevo (Priority: P2)

**Goal**: El formulario de creación nunca muestra el campo de cantidad mínima de pedido (MOQ) ni el
control de publicar/despublicar; la pantalla de edición los sigue mostrando sin cambios.

**Independent Test**: Abrir `/panel/modelos/nuevo` y confirmar que no aparecen ni MOQ ni el control
de publicación; abrir un modelo existente y confirmar que ahí sí aparecen, igual que hoy
(Escenario 1, punto 4, de `quickstart.md`).

### Implementation for User Story 2

- [X] T007 [US2] Confirmar en `app/[locale]/panel/(protected)/modelos/_ModeloForm.tsx` (resultado de T003) que no se declara ningún input de MOQ y que `EncabezadoModelo` se invoca sin `modelId` ni `status`, de modo que `EstadoPublicacion` no se renderiza (consecuencia directa de T001); ajustar si algún resto del formulario anterior quedó mostrando alguno de los dos.
- [X] T008 [US2] Verificar en `app/[locale]/panel/(protected)/modelos/[id]/_components/EncabezadoModelo.tsx` (resultado de T001) que, cuando se le pasan `modelId` y `status` (caso de edición, sin cambios), `EstadoPublicacion` se sigue mostrando exactamente igual que antes de esta funcionalidad.
- [ ] T009 [US2] Verificación manual: ejecutar el Escenario 1 completo de `specs/008-formulario-creacion-modelo/quickstart.md`, comparando explícitamente creación vs. edición para MOQ y estado de publicación. **Pendiente** por la misma razón que T006 (requiere sesión real de panel); confirmado por lectura de código en T007/T008 que ninguno de los dos controles se renderiza en creación.

**Checkpoint**: Ambas user stories quedan verificadas de forma independiente.

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Verificación final antes de dar la funcionalidad por terminada.

- [X] T010 [P] Ejecutar `npm run lint` y `npm run typecheck` desde la raíz del repo y corregir cualquier error introducido por los cambios de T001-T009. *(Ambos pasan limpio; los 2 warnings de lint reportados en `app/layout.tsx` son preexistentes y no están relacionados con esta funcionalidad.)*
- [X] T011 [P] Ejecutar `npm run test` (Vitest) para confirmar que no se rompió ninguna prueba existente (p. ej. `tests/warp.test.ts`). *(7 archivos, 46 tests, todos pasan.)*
- [ ] T012 Ejecutar de punta a punta los 5 escenarios de `specs/008-formulario-creacion-modelo/quickstart.md` (incluyendo el Escenario 3 de validación de campos requeridos y el Escenario 5 de continuar armando el modelo tras crearlo) como aceptación final. **Pendiente**: recomendado correr `npm run dev` e iniciar sesión en el panel para el pase visual final; no se hizo en automático por la misma razón que T006/T009.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 1)**: Sin dependencias externas — puede empezar de inmediato. Bloquea las
  dos user stories.
- **User Story 1 (Phase 2)**: Depende de Phase 1 completa (T001, T002).
- **User Story 2 (Phase 3)**: Depende de Phase 1 completa (T001) y de que T003 (US1) ya haya
  reescrito `_ModeloForm.tsx`, porque su verificación se apoya en ese archivo. No requiere que T004,
  T005 o T006 de US1 estén terminadas.
- **Polish (Phase 4)**: Depende de que Phase 2 y Phase 3 estén completas.

### Within Each User Story

- T003 (rescribir el formulario) antes de T004/T005 (que ajustan ese mismo archivo y la página que
  lo usa).
- Las verificaciones manuales (T006, T009, T012) van al final de cada fase, después de que el
  código correspondiente esté implementado.

### Parallel Opportunities

- T001 y T002 (Phase 1) pueden hacerse en paralelo: tocan archivos distintos (`EncabezadoModelo.tsx`
  vs. `route.ts`) y no dependen entre sí.
- T010 y T011 (Phase 4) pueden correrse en paralelo entre sí.
- T007 y T008 (Phase 3) pueden revisarse en paralelo: verifican archivos distintos.

---

## Parallel Example: Foundational Phase

```bash
# Lanzar juntas las dos tareas fundacionales (archivos distintos):
Task: "Extender EncabezadoModelo para modo creación en app/[locale]/panel/(protected)/modelos/[id]/_components/EncabezadoModelo.tsx"
Task: "Agregar manejo opcional de price a POST /api/panel/modelos en app/api/panel/modelos/route.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 solamente)

1. Completar Phase 1: Foundational (T001, T002).
2. Completar Phase 2: User Story 1 (T003-T006).
3. **Detenerse y validar**: correr Escenarios 1, 2 y 4 de `quickstart.md`.
4. Esto ya es demostrable: el formulario de creación se ve igual al de edición y guarda precio.

### Incremental Delivery

1. Foundational → base compartida lista.
2. User Story 1 → formulario de creación con los mismos campos que edición (MVP).
3. User Story 2 → confirma y deja asegurado que MOQ/publicación no aparecen en creación.
4. Polish → lint, typecheck, test y verificación completa de `quickstart.md`.

## Notes

- No hay tareas de test automatizado porque la spec no las pide; la verificación es manual vía
  `quickstart.md`, alineado con el Principio IV de la constitución.
- `_ModeloForm.tsx` hoy solo se usa desde `nuevo/page.tsx` (confirmado por búsqueda en el repo), así
  que reescribirlo no afecta ninguna otra pantalla.
- El campo de traducción `panel.modelos.price` ya existe en `messages/es.json` y `messages/en.json`;
  no se agregan claves de traducción nuevas.
