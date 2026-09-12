# Tasks: Modelos de producto fijo junto a modelos configurables

**Input**: Design documents from `/specs/009-modelos-producto-fijo/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: Se incluyen tareas de test unitario solo para la lógica pura nueva
(`checkPublicacionProductoFijo`, `buildFixedProductSnapshot`), siguiendo el patrón ya establecido en
el repo (`tests/publicacion.test.ts`, `tests/design-rules.test.ts`). El resto de la verificación es
manual en el navegador vía `quickstart.md` (Principio IV de la constitution).

**Organization**: Las tareas están agrupadas por historia de usuario (spec.md) para poder
implementar y probar cada una por separado.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Se puede hacer en paralelo (archivos distintos, sin dependencias pendientes)
- **[Story]**: A qué historia de usuario pertenece (US1, US2, US3, US4)

---

## Phase 1: Setup

**Purpose**: Cambio de esquema del que dependen todas las historias.

- [X] T001 Agregar el enum `model_type` (`"configurable" | "fixed_product"`) y la columna
  `cap_model.type` (`NOT NULL DEFAULT 'configurable'`) en `lib/db/schema.ts`; correr
  `npm run db:generate` para crear la migración en `drizzle/` (ver `data-model.md`).

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Lógica pura y datos compartidos que todas las historias necesitan.

**⚠️ CRITICAL**: Ninguna historia de usuario puede empezar hasta que esta fase esté completa.

- [X] T002 [P] Agregar `checkPublicacionProductoFijo(input: { price, viewsWithBaseImage })` en
  `lib/catalogo/publicacion.ts`: devuelve `{ missingPrice: boolean, missingPhoto: boolean }` según
  la tabla de "Reglas de publicación" de `data-model.md`.
- [X] T003 [P] Agregar tests unitarios de `checkPublicacionProductoFijo` en
  `tests/publicacion.test.ts` (mismo archivo que ya prueba `checkPublicacion`).
- [X] T004 [P] Agregar `buildFixedProductSnapshot(model, translations, photos)` en
  `lib/solicitud/snapshot.ts`, con la forma `{ kind: "fixed_product", modelId, nameEs, nameEn,
  descriptionEs, descriptionEn, price, photos }` de `data-model.md`; agregar `kind: "configurable"
  as const` al objeto que ya devuelve `buildDesignSnapshot`; cambiar
  `export type DesignSnapshot = ReturnType<typeof buildDesignSnapshot>` por la unión de los dos
  tipos de retorno, para que cualquier lector pueda discriminar por `snapshot.kind`.
- [X] T005 [P] Agregar tests unitarios de `buildFixedProductSnapshot` en `tests/snapshot.test.ts`
  (archivo nuevo).
- [X] T006 [P] Extender `capModelConNombre()` y `capModelConNombreYPortada()` en
  `lib/catalogo/consultas-traducidas.ts` para incluir la columna `type` (y agregar `price` a
  `capModelConNombreYPortada`, que hoy no lo trae).
- [X] T007 [P] Agregar a `messages/es.json` y `messages/en.json` las claves compartidas:
  `panel.modelos.type.label`, `panel.modelos.type.configurable`, `panel.modelos.type.fixed_product`,
  `panel.modelos.missingPrice`, `panel.modelos.missingPhoto`.

**Checkpoint**: Con la columna `type`, las dos funciones puras y las consultas extendidas listas,
las historias de usuario pueden empezar.

---

## Phase 3: User Story 1 - Crear un modelo de producto fijo con precio, descripción y fotos (Priority: P1) 🎯 MVP

**Goal**: Una persona administradora puede crear, configurar (solo fotos) y publicar un modelo
"Producto fijo" con precio y al menos una foto, sin ver pasos de colores/personalización.

**Independent Test**: Crear un modelo eligiendo "Producto fijo", completar precio y datos, subir
una foto, publicar — confirmar que no aparecieron los pasos de colores/personalización y que sin
precio o sin foto la publicación queda bloqueada (`quickstart.md` Escenarios 1-3, 7).

### Implementation for User Story 1

- [X] T008 [P] [US1] Extender `POST /api/panel/modelos` en `app/api/panel/modelos/route.ts`:
  aceptar `type` opcional (por defecto `"configurable"`), exigir `price` cuando
  `type = "fixed_product"`, devolver `type` en la respuesta — según
  `contracts/post-modelos.md`.
- [X] T009 [P] [US1] Extender `PATCH /api/panel/modelos/[id]` en
  `app/api/panel/modelos/[id]/route.ts`: leer el `type` actual del modelo antes de validar, y
  rechazar `price: null` cuando el modelo es `fixed_product` — según `contracts/patch-modelo.md`.
- [X] T010 [US1] Ramificar `POST /api/panel/modelos/[id]/publicar` en
  `app/api/panel/modelos/[id]/publicar/route.ts` según `model.type`: para `fixed_product`, llamar a
  `checkPublicacionProductoFijo` (T002) en vez de `checkPublicacion`, devolviendo
  `{ missingPrice, missingPhoto }` en el `detail` del 409 — según `contracts/post-modelos-publicar.md`.
- [X] T011 [P] [US1] Agregar un selector de tipo ("Configurable" / "Producto fijo", por defecto
  "Configurable") en `app/[locale]/panel/(protected)/modelos/_ModeloForm.tsx`: enviar `type` en el
  POST, exigir precio en el formulario cuando se elige "Producto fijo"; pasar las nuevas labels
  desde `app/[locale]/panel/(protected)/modelos/nuevo/page.tsx` (usando las claves de T007).
- [X] T012 [P] [US1] Mostrar el `type` del modelo como badge de solo lectura (labels de T007), junto
  al estado de publicación, en
  `app/[locale]/panel/(protected)/modelos/[id]/_components/EncabezadoModelo.tsx` — sin ningún
  control para cambiarlo (FR-010).
- [X] T013 [US1] Actualizar
  `app/[locale]/panel/(protected)/modelos/[id]/_components/EstadoPublicacion.tsx` para recibir el
  `type` del modelo y, cuando es `fixed_product`, mostrar el detalle `missingPrice`/`missingPhoto`
  que devuelve T010 en vez de asumir la forma de resultado de un modelo configurable.
- [X] T014 [US1] En `app/[locale]/panel/(protected)/modelos/[id]/page.tsx`, leer `model.type`
  (ahora disponible por T006) y pasarlo a `ModeloConfigurador`, `EncabezadoModelo` y
  `EstadoPublicacion`.
- [X] T015 [US1] En
  `app/[locale]/panel/(protected)/modelos/[id]/_components/ModeloConfigurador.tsx`, ocultar las
  pestañas "Colores" y "Personalización" (y su contenido) cuando `type = "fixed_product"`, dejando
  solo "Vistas" (depende de T014).

**Checkpoint**: Un modelo "Producto fijo" se puede crear, configurar (solo fotos) y publicar de
punta a punta desde el panel.

---

## Phase 4: User Story 2 - Un cliente ve y pide un producto fijo con su precio, sin configurador (Priority: P1)

**Goal**: Un modelo "Producto fijo" publicado aparece en el catálogo público con su precio; un
visitante lo abre, ve fotos/descripción/precio y lo pide (cantidad + contacto) sin configurador ni
cotización.

**Independent Test**: Publicar un modelo "Producto fijo" (requiere US1), verlo en el catálogo con su
precio, abrirlo, completar el pedido y recibir un código de seguimiento (`quickstart.md`
Escenario 5).

### Implementation for User Story 2

- [X] T016 [P] [US2] Extender el cargador de catálogo en `app/[locale]/(site)/page.tsx`: incluir
  `type`/`price` (T006) y armar `href` como `/${locale}/producto/${id}` cuando
  `type = "fixed_product"`, o `/${locale}/configurador/${id}` en caso contrario.
- [X] T017 [P] [US2] Extender `TarjetaModelo` y la tarjeta en
  `app/_components/landing/Collection.tsx` para aceptar `type`/`price` y mostrar el precio
  (formateado como USD, p. ej. `$35.00`) en la tarjeta cuando `type = "fixed_product"`.
- [X] T018 [US2] Crear `app/[locale]/(site)/producto/[modelId]/page.tsx`: cargar el modelo por id,
  `notFound()` si no está `published` o no es `type = "fixed_product"`, cargar sus vistas activas
  (`model_view.baseImageUrl`) y nombre/descripción/precio ES/EN.
- [X] T019 [US2] Crear `app/[locale]/(site)/producto/[modelId]/_components/ProductoApp.tsx`
  (componente cliente): galería de fotos, nombre/descripción/precio, campo de cantidad,
  `FormularioContacto` (reutilizado tal cual) y `BotonEnviar`; al enviar, `POST /api/solicitudes`
  con `design: { kind: "fixed_product", modelId }` (depende de T018).
- [X] T020 [US2] Extender `POST /api/solicitudes` en `app/api/solicitudes/route.ts`: ramificar por
  `design.kind`; para `"fixed_product"`, cargar el modelo de la base de datos y verificar que su
  `type` coincide (si no, `modelo_no_disponible`), omitir las validaciones de colores/decoraciones,
  armar el snapshot con `buildFixedProductSnapshot` (T004) y escribir `request_image` a partir de
  las vistas activas del modelo en vez de `body.viewImages` — según `contracts/post-solicitudes.md`.
- [X] T021 [P] [US2] Agregar las claves `producto.*` que necesite `ProductoApp` (reutilizando
  `solicitud.name`/`email`/`phone`/`comments`/`privacyPrefix`/`privacyLink`/`submit`/`submitting`/
  `retry` donde el texto ya es el mismo) a `messages/es.json` y `messages/en.json`.

**Checkpoint**: Un visitante puede encontrar, ver y pedir un producto fijo publicado de punta a
punta, y seguir su pedido con el código recibido.

---

## Phase 5: User Story 3 - Seguir creando modelos configurables sin precio obligatorio (Priority: P1)

**Goal**: Confirmar que el flujo de modelos configurables (creación, precio opcional, catálogo →
configurador) sigue funcionando exactamente igual después de los cambios anteriores.

**Independent Test**: Crear un modelo sin tocar el selector de tipo ni el precio y confirmar que se
comporta como hoy; abrir un modelo configurable preexistente y confirmar que no cambió
(`quickstart.md` Escenario 4).

### Implementation for User Story 3

- [X] T022 [US3] Pase de regresión: crear un modelo dejando el tipo por defecto ("Configurable") y
  el precio vacío, confirmar que se guarda sin error y que `ModeloConfigurador` (T015) sigue
  mostrando los tres pasos (Vistas, Colores, Personalización); abrir un modelo configurable
  creado antes de esta funcionalidad y confirmar que se ve igual; abrirlo desde el catálogo público
  y confirmar que sigue llevando al configurador (T016). Correr `npm run test` y
  `npm run typecheck`.

**Checkpoint**: Ningún modelo configurable, existente o nuevo, cambió su comportamiento.

---

## Phase 6: User Story 4 - Distinguir el tipo de modelo al verlo en el listado del panel (Priority: P2)

**Goal**: El listado de modelos del panel muestra el tipo de cada modelo a simple vista.

**Independent Test**: Con modelos de ambos tipos creados, abrir el listado y confirmar que cada uno
indica su tipo (`quickstart.md` Escenario 8).

### Implementation for User Story 4

- [X] T023 [US4] Agregar una columna "Tipo" a la tabla de
  `app/[locale]/panel/(protected)/modelos/page.tsx`, mostrando un badge con la label
  `panel.modelos.type.*` (T007) según el `type` de cada modelo (disponible por T006).

**Checkpoint**: Todas las historias de usuario (P1 y P2) están completas y probables de forma
independiente.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Que las pantallas existentes que leen `request.designSnapshot` no se rompan con la
nueva forma `fixed_product` (research.md #7), y verificación final end-to-end.

- [X] T024 [P] Ramificar por `req.designSnapshot.kind` en
  `app/[locale]/panel/(protected)/solicitudes/[id]/page.tsx`: mostrar fotos/nombre/precio en vez del
  resumen de colores/decoraciones/técnica cuando `kind = "fixed_product"`.
- [X] T025 [P] Misma rama por `kind` en `app/api/panel/solicitudes/[id]/ficha.pdf/route.ts`.
- [X] T026 [P] Misma rama por `kind` en `app/api/panel/solicitudes.csv/route.ts` (columnas/valores
  razonables para un pedido de producto fijo).
- [ ] T027 Recorrer los 8 escenarios de `quickstart.md` de punta a punta en el navegador.
- [X] T028 Correr `npm run typecheck` y `npm run test` sobre todo el repo para confirmar que no hay
  regresiones.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sin dependencias — empieza de inmediato.
- **Foundational (Phase 2)**: Depende de Setup (necesita la columna `type`). Bloquea todas las
  historias.
- **User Story 1 (Phase 3)**: Depende de Foundational. Sin dependencias de otras historias.
- **User Story 2 (Phase 4)**: Depende de Foundational (T004, T006). Para probarla de punta a punta
  conviene tener US1 completa (para poder crear/publicar un modelo "Producto fijo"), pero sus
  archivos no se superponen con los de US1.
- **User Story 3 (Phase 5)**: Depende de Foundational, US1 (T011, T015) y US2 (T016) — es una
  verificación de que esos cambios no rompieron el camino configurable.
- **User Story 4 (Phase 6)**: Depende de Foundational (T006, T007). Independiente de US1/US2/US3.
- **Polish (Phase 7)**: Depende de que Foundational (T004, para `DesignSnapshot.kind`) esté listo;
  en la práctica se hace al final, después de tener pedidos de ambos tipos para probar.

### Dentro de cada historia

- US1: T008-T010 (API) y T011-T012 (UI) se pueden hacer en paralelo entre sí; T013 depende de T010
  y T007; T014 depende de T006; T015 depende de T014.
- US2: T016-T017 (catálogo) y T021 (i18n) en paralelo; T018 antes que T019; T020 depende de T004 y
  es independiente de T018/T019 en archivos (pero se prueba junto con ellos).
- US3 y US4: una sola tarea cada una, sin sub-dependencias internas.
- Polish: T024-T026 en paralelo entre sí; T027 y T028 al final, después de todo lo anterior.

### Parallel Opportunities

- Todas las tareas [P] de Foundational (T002-T007) se pueden hacer en paralelo.
- Dentro de US1: T008, T009, T011, T012 en paralelo.
- Dentro de US2: T016, T017, T021 en paralelo.
- Dentro de Polish: T024, T025, T026 en paralelo.
- Una vez completa Foundational, US1, US2 y US4 se pueden repartir entre distintas personas en
  paralelo (US3 espera a que US1/US2 terminen, por ser una verificación de ambas).

---

## Parallel Example: Foundational

```bash
Task: "Agregar checkPublicacionProductoFijo en lib/catalogo/publicacion.ts"
Task: "Agregar tests de checkPublicacionProductoFijo en tests/publicacion.test.ts"
Task: "Agregar buildFixedProductSnapshot en lib/solicitud/snapshot.ts"
Task: "Agregar tests de buildFixedProductSnapshot en tests/snapshot.test.ts"
Task: "Extender capModelConNombre/capModelConNombreYPortada en lib/catalogo/consultas-traducidas.ts"
Task: "Agregar labels panel.modelos.type.* y missingPrice/missingPhoto a messages/es.json y en.json"
```

## Parallel Example: User Story 1

```bash
Task: "Extender POST /api/panel/modelos con type/price"
Task: "Extender PATCH /api/panel/modelos/[id] con price requerido si fixed_product"
Task: "Agregar selector de tipo a _ModeloForm.tsx"
Task: "Mostrar badge de tipo de solo lectura en EncabezadoModelo.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1: Setup (T001).
2. Phase 2: Foundational (T002-T007) — bloqueante.
3. Phase 3: User Story 1 (T008-T015).
4. **Parar y validar**: recorrer `quickstart.md` Escenarios 1-3 y 7.
5. En este punto ya se puede crear y publicar un "Producto fijo" desde el panel, aunque todavía no
   se vea en el sitio público.

### Incremental Delivery

1. Setup + Foundational → base lista.
2. + User Story 1 → crear/publicar productos fijos en el panel (MVP del panel).
3. + User Story 2 → el cliente los ve y los pide en el sitio (aquí la funcionalidad entrega valor de
   negocio completo).
4. + User Story 3 → confirma que nada configurable se rompió.
5. + User Story 4 → mejora de usabilidad del panel (listado).
6. + Polish → ninguna pantalla de solicitudes existente se rompe con el nuevo tipo de pedido.

## Notes

- [P] = archivos distintos, sin dependencias pendientes entre sí.
- [Story] mapea cada tarea a su historia de usuario para trazabilidad.
- Después de entregar esta funcionalidad, correr `/speckit-constitution` para actualizar la sección
  "Alcance del Producto (v1)" de la constitution (dice "la versión 1 no muestra precios", lo cual ya
  no es cierto para productos fijos) — señalado en el Constitution Check de `plan.md`. No es una
  tarea de código, por eso no tiene ID en esta lista.
