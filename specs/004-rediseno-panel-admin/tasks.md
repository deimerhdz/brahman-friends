---

description: "Task list template for feature implementation"
---

# Tasks: Rediseño del panel de administración

**Input**: Design documents from `/specs/004-rediseno-panel-admin/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md),
[data-model.md](./data-model.md), [contracts/panel-administrativo.md](./contracts/panel-administrativo.md),
[quickstart.md](./quickstart.md)

**Tests**: No se solicitaron tests en la spec ni en el plan. El proyecto no tiene infraestructura de
test de componentes/UI (ver Testing en `plan.md`); la verificación de esta feature es manual, vía los
escenarios de `quickstart.md`, más `npm run typecheck` / `npm run lint` / `npm test` como red de
seguridad de regresión.

**Organization**: Las tareas están agrupadas por historia de usuario (US1, US2, US3) para poder
implementar y probar cada una de forma independiente.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Se puede ejecutar en paralelo (archivo/carpeta distinta, sin dependencias pendientes)
- **[Story]**: A qué historia de usuario pertenece (US1, US2, US3)
- Cada tarea incluye la ruta exacta del archivo o carpeta

## Path Conventions

Proyecto único Next.js (App Router) — ver "Project Structure" en `plan.md`. Todas las rutas son
relativas a la raíz del repo.

---

## Phase 1: Setup

**Purpose**: Preparar la carpeta que agrupará las páginas públicas existentes, previo a moverlas.

- [X] T001 Crear la carpeta `app/[locale]/(site)/` (grupo de rutas nuevo, vacío por ahora — no cambia
  ninguna URL existente)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Separar la barra pública (`NavBar`, con `ControlCuenta` y `SelectorIdioma`) del árbol de
layouts del panel, y añadir los tokens de diseño que faltan. Esta fase es la causa raíz que resuelve
FR-006 a FR-009 (User Story 3) y es requisito para que cualquier página del panel se vea como el
mockup sin la barra pública superpuesta (User Story 1 y 2).

**⚠️ CRITICAL**: Ninguna historia de usuario puede darse por completa/correcta sin esta fase, aunque
el código específico de cada historia pueda escribirse en paralelo.

- [X] T002 [P] Agregar los tokens `--radius-*` (`DEFAULT: 0.125rem`, `lg: 0.25rem`, `xl: 0.5rem`,
  `full: 0.75rem`) al bloque `@theme` ya existente en `app/globals.css`, siguiendo la sintaxis
  CSS-first de Tailwind v4 ya usada ahí para color/tipografía/espaciado (research.md #2)
- [X] T003 [P] Mover `app/[locale]/page.tsx` a `app/[locale]/(site)/page.tsx`, sin cambios de
  contenido (depende de T001)
- [X] T004 [P] Mover la carpeta `app/[locale]/cuenta/` a `app/[locale]/(site)/cuenta/`, sin cambios de
  contenido (depende de T001)
- [X] T005 [P] Mover la carpeta `app/[locale]/configurador/` a `app/[locale]/(site)/configurador/`,
  sin cambios de contenido (depende de T001)
- [X] T006 [P] Mover la carpeta `app/[locale]/politica-privacidad/` a
  `app/[locale]/(site)/politica-privacidad/`, sin cambios de contenido (depende de T001)
- [X] T007 [P] Mover la carpeta `app/[locale]/solicitud/` a `app/[locale]/(site)/solicitud/`, sin
  cambios de contenido (depende de T001)
- [X] T008 [P] Crear `app/[locale]/(site)/layout.tsx`: renderiza `<NavBar locale={locale} />` (importada
  de `app/_components/landing/NavBar.tsx`, sin cambios) y `<main className="pt-20">{children}</main>`,
  igual que el `<header>`/`<main>` que hoy están en `app/[locale]/layout.tsx` (depende de T001,
  research.md #1)
- [X] T009 [P] Crear `app/[locale]/panel/login/layout.tsx`: renderiza `<NavBar locale={locale} />` +
  `<main className="pt-20">{children}</main>`, igual que T008, para que `/panel/login` conserve
  exactamente su apariencia y comportamiento actuales (FR-009, FR-012; no depende de T008 — archivo
  distinto)
- [X] T010 Simplificar `app/[locale]/layout.tsx`: quitar `<NavBar/>` y el `<main className="pt-20">`
  que envolvían `{children}`; dejar solo `<SetHtmlLang lang={locale} />` + `{children}` (depende de
  T008 y T009 — solo debe simplificarse una vez que las páginas públicas y el login del panel ya
  tengan su propia `NavBar` vía sus nuevos layouts, para no dejar ninguna ruta sin ella)

**Checkpoint**: con T002-T010 completas, `npm run dev` sirve el sitio público exactamente igual que
antes (con `NavBar`), el login del panel exactamente igual que antes (con `NavBar`), y cualquier
página protegida del panel (`/panel/modelos`, etc.) ya NO renderiza `NavBar` en ningún caso — User
Story 3 (FR-006 a FR-009) queda satisfecha estructuralmente en este punto, sin necesitar más código.

---

## Phase 3: User Story 1 - Un administrador ve el panel con el nuevo diseño visual de referencia (Priority: P1) 🎯 MVP

**Goal**: Rediseñar la barra lateral, el encabezado y el contenido de las páginas protegidas del
panel (Modelos, Colores, Técnicas, Solicitudes) con el lenguaje visual de `dashboard/code.html`, en
escritorio.

**Independent Test**: Iniciar sesión en el panel, abrir cada sección protegida en un navegador de
escritorio (≥1280px) y comparar visualmente contra `dashboard/code.html`: barra lateral, encabezado,
tablas/tarjetas, tipografía y color. Se puede probar sin esperar a US2 (responsive) ni a US3 (ya
resuelta en Foundational).

### Implementation for User Story 1

- [X] T011 [P] [US1] Crear `app/[locale]/panel/(protected)/_PanelHeader.tsx`: encabezado de página
  reutilizable (título, buscador opcional, botón de acción principal opcional), con las clases del
  mockup (`text-headline-md`, `border-b border-outline-variant/30`, etc. — FR-001)
- [X] T012 [US1] Rediseñar `app/[locale]/panel/(protected)/_PanelNav.tsx`: barra lateral con marca del
  panel, enlaces a Modelos/Colores/Técnicas/Solicitudes con ícono Material Symbols cada uno, sección
  activa resaltada (comparando `usePathname()` con cada `href`), bloque inferior con `session.name` y
  el botón de cerrar sesión (`_LogoutButton.tsx`, sin cambios de comportamiento) — estilo fijo de
  escritorio por ahora, sin lógica de colapso móvil todavía (FR-001, FR-002; depende de T002)
- [X] T013 [US1] Actualizar `app/[locale]/panel/(protected)/layout.tsx` para montar el `_PanelNav`
  rediseñado (T012) y envolver `{children}` en el contenedor visual del mockup (fondo
  `bg-surface-bright`, padding `px-margin-desktop py-margin-desktop`) en vez del `<div className="p-4">`
  actual (depende de T012)
- [X] T014 [P] [US1] Restyle `app/[locale]/panel/(protected)/modelos/page.tsx`: tabla con columna de
  miniatura, nombre/SKU, insignia de estado, stock de componentes y acción de editar, usando
  `_PanelHeader` (T011) con buscador y botón "Agregar nuevo modelo" — mismos datos y acciones que hoy
  (FR-001, FR-003, FR-010; depende de T011)
- [X] T015 [P] [US1] Restyle el detalle principal de un modelo:
  `app/[locale]/panel/(protected)/modelos/[id]/page.tsx`,
  `app/[locale]/panel/(protected)/modelos/[id]/_components/EstadoPublicacion.tsx`,
  `app/[locale]/panel/(protected)/modelos/[id]/_components/TecnicasModelo.tsx`,
  `app/[locale]/panel/(protected)/modelos/nuevo/page.tsx` y
  `app/[locale]/panel/(protected)/modelos/nuevo/_NuevoModeloForm.tsx`, reutilizando `_PanelHeader`
  (T011) y las clases de tarjeta/formulario del mockup (`ghost-border`, `ambient-shadow`,
  `rounded-lg`) — mismos campos y validaciones que hoy (FR-001, FR-003, FR-010; depende de T011)
- [X] T016 [P] [US1] Restyle las subpáginas de gestión de un modelo:
  `app/[locale]/panel/(protected)/modelos/[id]/componentes/page.tsx` +
  `.../componentes/_ComponentesManager.tsx`,
  `app/[locale]/panel/(protected)/modelos/[id]/imagenes/page.tsx` + `.../imagenes/_CargaMasiva.tsx`,
  `app/[locale]/panel/(protected)/modelos/[id]/tallas/page.tsx` + `.../tallas/_TallasForm.tsx`,
  `app/[locale]/panel/(protected)/modelos/[id]/vistas/page.tsx` + `.../vistas/_VistasForm.tsx`, y
  `app/[locale]/panel/(protected)/modelos/[id]/zonas/page.tsx` + `.../zonas/_ZonasEditor.tsx` +
  `.../zonas/_components/PreviaCurvatura.tsx`, reutilizando `_PanelHeader` (T011) y el mismo lenguaje
  visual — mismos campos, editores y validaciones que hoy (FR-001, FR-003, FR-010; depende de T011)
- [X] T017 [P] [US1] Restyle Colores: `app/[locale]/panel/(protected)/colores/page.tsx` (tabla/tarjeta
  con muestra de color, disponibilidad, acción editar) y
  `app/[locale]/panel/(protected)/colores/[id]/page.tsx` +
  `app/[locale]/panel/(protected)/colores/[id]/_ColorForm.tsx`, reutilizando `_PanelHeader` (T011) —
  mismos datos y acciones que hoy (FR-001, FR-003, FR-010; depende de T011)
- [X] T018 [P] [US1] Restyle Técnicas: `app/[locale]/panel/(protected)/tecnicas/page.tsx` y
  `app/[locale]/panel/(protected)/tecnicas/_TecnicasForm.tsx`, reutilizando `_PanelHeader` (T011) —
  mismos datos y acciones que hoy (FR-001, FR-003, FR-010; depende de T011)
- [X] T019 [P] [US1] Restyle Solicitudes: `app/[locale]/panel/(protected)/solicitudes/page.tsx`
  (tabla con estado e insignia), `app/[locale]/panel/(protected)/solicitudes/[id]/page.tsx`,
  `.../[id]/_components/Historial.tsx` y `.../[id]/_components/Anonimizar.tsx`, reutilizando
  `_PanelHeader` (T011) — mismos datos, historial y acciones que hoy (FR-001, FR-003, FR-010; depende
  de T011)

**Checkpoint**: en escritorio, todas las páginas protegidas del panel se ven con el lenguaje visual de
`dashboard/code.html`, con las secciones reales del panel resaltadas en la barra lateral. Historia
entregable por sí sola.

---

## Phase 4: User Story 2 - El panel se adapta a cualquier tamaño de pantalla (Priority: P1)

**Goal**: Hacer que la barra lateral colapse a un menú móvil por debajo de 1024px y que el contenido
de cada página se reacomode sin overflow horizontal ni controles inaccesibles.

**Independent Test**: Abrir el panel autenticado con el ancho del navegador en ~360-414px, ~768px y
~1000px: la barra lateral colapsa a un menú accesible con las mismas secciones, y el contenido no
desborda horizontalmente. Depende de que existan la barra lateral y las páginas rediseñadas (US1)
para poder recorrer el panel completo.

### Implementation for User Story 2

- [X] T020 [US2] Crear `app/[locale]/panel/(protected)/_MobilePanelNav.tsx` (componente cliente,
  `"use client"`, `useState`): botón de menú (íconos `menu`/`close` de Material Symbols,
  `aria-expanded`) que despliega un panel con las mismas secciones que `_PanelNav` (Modelos, Colores,
  Técnicas, Solicitudes) y el botón de cerrar sesión (research.md #4; depende de T012, mismo listado
  de secciones)
- [X] T021 [US2] Actualizar `app/[locale]/panel/(protected)/layout.tsx` para mostrar `_PanelNav`
  (T012) solo en escritorio (`hidden lg:flex`) y `_MobilePanelNav` (T020) solo por debajo de 1024px
  (`lg:hidden`) — mismo punto de quiebre que el mockup (FR-005; depende de T013, T020)
- [X] T022 [US2] Ajustar las clases responsive de las páginas rediseñadas en US1 (Modelos, Colores,
  Técnicas, Solicitudes — listados y formularios, T014-T019) para que las tablas usen su propio
  `overflow-x-auto` contenido o se conviertan en tarjetas apiladas por debajo de 1024px, sin
  desbordamiento horizontal de la página completa entre 360px y 1920px (SC-002; depende de T014-T019)
- [X] T023 [P] [US2] Verificar y ajustar en `_MobilePanelNav.tsx` (T020) que el botón de menú tenga
  `aria-label` accesible de abrir/cerrar (mismo patrón que `MobileNavPanel.tsx` del sitio público,
  FR-011)

**Checkpoint**: US1 + US2 completas — el panel se ve como el mockup en escritorio y se adapta sin
overflow ni controles inaccesibles entre 360px y 1920px.

---

## Phase 5: User Story 3 - Un administrador con sesión iniciada ya no ve enlaces de ingresar/registrarme ni el selector de idioma dentro del panel (Priority: P2)

**Goal**: Confirmar que ninguna página protegida del panel renderiza los enlaces
"Ingresar"/"Registrarme" ni el selector de idioma. El mecanismo que lo garantiza (T001-T010) ya se
implementó en Foundational porque es compartido con US1; esta fase se dedica a verificarlo
explícitamente, ya que es un requisito pedido por el usuario con su propio criterio de aceptación.

**Independent Test**: Iniciar sesión en el panel con credenciales válidas y recorrer cada página
protegida verificando que no aparecen esos enlaces ni el selector, incluso con una sesión de cliente
activa en paralelo. Se puede probar apenas Foundational esté completo, sin esperar a US1 ni US2.

### Implementation for User Story 3

- [X] T024 [US3] Verificar con `grep -r "NavBar\|ControlCuenta\|SelectorIdioma" app/[locale]/panel/(protected)/`
  que ningún archivo bajo las páginas protegidas del panel importe esos componentes (solo
  `app/[locale]/panel/login/layout.tsx`, de T009, debe importar `NavBar`), confirmando que FR-006,
  FR-007 y FR-008 se cumplen estructuralmente y no por una condición en tiempo de ejecución que pueda
  fallar (depende de T001-T010, T012, T013)
- [X] T025 [US3] Recorrer manualmente el Escenario 2 de `quickstart.md`: sin enlaces de
  ingresar/registrarme ni selector de idioma en ninguna página protegida, incluso con sesión de
  cliente activa en paralelo (FR-008), y confirmando que `/panel/login` no cambió (FR-009, FR-012)

**Checkpoint**: las tres historias funcionan juntas — el panel se ve como el mockup, es responsive, y
nunca muestra los enlaces públicos de ingresar/registrarme ni el selector de idioma.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Verificaciones finales que cruzan las tres historias.

- [X] T026 [P] Revisar que los íconos y elementos gráficos nuevos del panel (barra lateral, menú
  móvil, acciones de tabla como "Editar") tengan texto alternativo o `aria-label` cuando transmitan
  información (FR-011)
- [X] T027 Ejecutar `npm run typecheck`, `npm run lint` y `npm test`
- [ ] T028 Recorrer manualmente los Escenarios 1, 3, 4 y 5 de `quickstart.md` (fidelidad visual con el
  mockup, panel responsive, interfaz del panel en español con el catálogo siguiendo bilingüe, y
  funcionalidad de negocio intacta)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sin dependencias — puede iniciar de inmediato
- **Foundational (Phase 2)**: depende de Setup (T001) — bloquea el resultado visual correcto de US1 y
  US2, y por sí sola ya satisface US3 estructuralmente (FR-006 a FR-009)
- **User Stories (Phase 3-5)**: todas dependen de Foundational completo
  - US1 (Phase 3) no depende de otra historia
  - US2 (Phase 4) depende de que existan la barra lateral y las páginas de US1 para poder ajustar su
    responsive (T020 depende de T012; T022 depende de T014-T019)
  - US3 (Phase 5) no depende de US1 ni US2 en el código (su mecanismo ya está en Foundational), pero
    sus tareas de verificación (T024) esperan a que T012/T013 existan para revisar los archivos
    finales de la barra lateral
- **Polish (Phase 6)**: depende de que las historias que se vayan a entregar estén completas

### Within Each User Story

- US1: T011 (`_PanelHeader`) en paralelo a T012 (`_PanelNav`) → T013 (integrar en el layout, depende
  de T012) → T014-T019 (restyle de cada sección, en paralelo entre sí, todas dependen de T011)
- US2: T020 (`_MobilePanelNav`, depende de T012) → T021 (integrar en el layout, depende de T013 y
  T020) → T022 (ajustes responsive de contenido, depende de T014-T019); T023 en paralelo a T021/T022
- US3: T024 (grep de verificación) → T025 (recorrido manual); ambas pueden hacerse apenas Foundational
  esté completo, sin esperar a US1/US2

### Parallel Opportunities

- T002 (tokens de radio) en paralelo a T003-T007 (movimientos de carpetas) y a T008/T009 (layouts
  nuevos) — archivos distintos
- T003, T004, T005, T006, T007 (movimientos de carpetas de Foundational) en paralelo entre sí
- T008 y T009 (los dos layouts nuevos con `NavBar`) en paralelo entre sí
- T011 y T012 (piezas compartidas de US1) en paralelo entre sí
- T014, T015, T016, T017, T018, T019 (restyle de Modelos/Colores/Técnicas/Solicitudes en US1) en
  paralelo entre sí — archivos distintos, todas dependen solo de T011
- T023 (accesibilidad del menú móvil) en paralelo a T021/T022 dentro de US2

---

## Parallel Example: User Story 1

```bash
# Lanzar juntas las piezas compartidas de US1:
Task: "Crear _PanelHeader.tsx"
Task: "Rediseñar _PanelNav.tsx"

# Una vez que _PanelHeader existe, lanzar juntas todas las secciones:
Task: "Restyle modelos/page.tsx"
Task: "Restyle detalle principal de un modelo (page.tsx, EstadoPublicacion, TecnicasModelo, nuevo/)"
Task: "Restyle subpáginas de gestión de un modelo (componentes, imagenes, tallas, vistas, zonas)"
Task: "Restyle Colores (page.tsx, [id]/_ColorForm.tsx)"
Task: "Restyle Técnicas (page.tsx, _TecnicasForm.tsx)"
Task: "Restyle Solicitudes (page.tsx, [id]/page.tsx, Historial, Anonimizar)"
```

---

## Implementation Strategy

### MVP First (User Story 1 solamente)

1. Completar Phase 1: Setup
2. Completar Phase 2: Foundational (separar `NavBar` del panel + tokens de radio) — esto ya deja US3
   resuelta de forma estructural
3. Completar Phase 3: User Story 1
4. **Detenerse y validar**: iniciar sesión en el panel, recorrer cada sección en escritorio y comparar
   contra `dashboard/code.html` (Escenario 1 de `quickstart.md`), y confirmar que ya no aparecen los
   enlaces públicos (Escenario 2)
5. Esto ya es un entregable visible en escritorio, con US3 incluida "gratis"

### Incremental Delivery

1. Setup + Foundational → base lista, US3 ya satisfecha estructuralmente
2. + User Story 1 → panel con el diseño nuevo en escritorio (MVP visual)
3. + User Story 2 → panel adaptado a cualquier ancho de pantalla
4. + User Story 3 (verificación) → confirma explícitamente lo que Foundational ya resolvió
5. Cada historia agrega valor sin romper la anterior

---

## Notes

- `[P]` = archivo o carpeta distinta, sin dependencias pendientes
- La etiqueta de historia (`[US1]`/`[US2]`/`[US3]`) traza cada tarea a su criterio de aceptación en
  `spec.md`
- No se agrega ninguna dependencia nueva a `package.json` (research.md): Tailwind v4, Material
  Symbols Outlined ya cargado globalmente, y componentes cliente simples (`useState`), igual que en
  feature 003
- FR-013 (interfaz del panel en español, excepción documentada al Principio II): al restilizar cada
  página (T014-T019), reutilizar las claves `t()` que ya existen (`nav.models`, `panel.modelos.*`,
  etc. — no romperlas) y escribir en español, sin clave nueva, cualquier texto que el rediseño
  introduzca y no tenga hoy equivalente traducido (research.md #5, data-model.md)
- Confirmar que `npm test` sigue en verde después de T002-T010 (paridad es/en de las claves ya
  existentes, sin cambios) y después de cada sección restyled
