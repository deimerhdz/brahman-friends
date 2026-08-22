---

description: "Task list template for feature implementation"
---

# Tasks: Migración de landing page de referencia a la página de inicio

**Input**: Design documents from `/specs/003-pagina-inicio-landing/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md),
[data-model.md](./data-model.md), [contracts/pagina-inicio.md](./contracts/pagina-inicio.md),
[quickstart.md](./quickstart.md)

**Tests**: No se solicitaron tests en la spec. La feature es mayormente de presentación; la única
lógica nueva no trivial (URL de portada por modelo, con `null` si falta la vista "front") es un
campo nullable pasado directo desde una consulta, sin transformación que amerite una prueba unitaria
dedicada (ver Testing en `plan.md`). La paridad de claves `es.json`/`en.json` ya la cubre la prueba
existente `tests/traducciones.test.ts`, sin necesidad de una prueba nueva.

**Organization**: Las tareas están agrupadas por historia de usuario (US1, US2, US3) para poder
implementar y probar cada una de forma independiente.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Se puede ejecutar en paralelo (archivo distinto, sin dependencias pendientes)
- **[Story]**: A qué historia de usuario pertenece (US1, US2, US3)
- Cada tarea incluye la ruta exacta del archivo

## Path Conventions

Proyecto único Next.js (App Router) — ver "Project Structure" en `plan.md`. Todas las rutas son
relativas a la raíz del repo.

---

## Phase 1: Setup

**Purpose**: Preparar la carpeta donde vivirán los componentes nuevos de la página de inicio.

- [X] T001 Crear la carpeta `app/_components/landing/` para los componentes nuevos de la página de inicio

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Base visual compartida por las tres historias (tema de Tailwind y fuentes). Sin esto,
ningún componente nuevo se ve como el mockup.

**⚠️ CRITICAL**: Ninguna historia de usuario puede darse por terminada visualmente sin esta fase,
aunque el código de cada historia pueda escribirse en paralelo.

- [X] T002 [P] Agregar el bloque `@theme` en `app/globals.css` con los tokens de color, tipografía
  (`display-lg`, `display-lg-mobile`, `headline-md`, `label-caps`, `button`, `body-lg`, `body-md`),
  radios (`DEFAULT`, `lg`, `xl`, `full`) y espaciado (`margin-desktop`, `margin-mobile`, `gutter`,
  `section-gap`, `container-max`) que hoy vienen del `tailwind.config` del mockup
  (`landing-page/code.html`), siguiendo la sintaxis CSS-first de Tailwind v4 (research.md #1)
- [X] T003 [P] Agregar en `app/layout.tsx` los `<link>` de Google Fonts para Inter, JetBrains Mono y
  Material Symbols Outlined, igual que en `landing-page/code.html` (research.md #2, #3)

**Checkpoint**: con T002 y T003 completas, cualquier componente que use las clases del mockup
(`text-primary`, `bg-surface`, `text-headline-md`, íconos `material-symbols-outlined`, etc.) se ve
correctamente.

---

## Phase 3: User Story 1 - Un visitante ve la nueva página de inicio con el diseño de referencia (Priority: P1) 🎯 MVP

**Goal**: Reconstruir las secciones de contenido de la portada (héroe, "The Collection", "B2B
Services & Bulk Orders", "The Process", pie de página) según el mockup, con los modelos publicados
reales (sin precios) en vez de las siluetas de ejemplo.

**Independent Test**: Abrir `/es` (o `/en`) en un navegador de escritorio y comparar cada sección
visualmente contra `landing-page/code.html`: tipografía, colores, espaciados, textos e imágenes.
Se puede probar sin esperar a US2/US3 porque la barra de navegación actual (aunque todavía no tenga
el estilo nuevo) sigue funcionando debajo de estas secciones.

### Implementation for User Story 1

- [X] T004 [P] [US1] Agregar las claves nuevas del namespace `landing` (`landing.hero.*`,
  `landing.collection.*` sin ninguna clave de precio, `landing.b2b.*`, `landing.process.*`,
  `landing.footer.*`) en `messages/es.json`, con el contenido en español según el mockup (ver tabla
  de claves en `data-model.md`)
- [X] T005 [P] [US1] Agregar las mismas claves del namespace `landing` en `messages/en.json`, en
  inglés, con paridad exacta de nombres de clave respecto a `messages/es.json` (FR-005; verificado
  por `tests/traducciones.test.ts`)
- [X] T006 [P] [US1] Agregar en `lib/catalogo/consultas-traducidas.ts` una función que devuelva, para
  cada modelo publicado, `{ id, nameEs, nameEn, descriptionEs, descriptionEn, frontImageUrl }`
  uniendo `capModelConNombre()` con un `leftJoin` a `modelView` filtrado por `view = 'front'`
  (`frontImageUrl` queda en `null` si el modelo no tiene esa vista cargada) — ver `TarjetaModelo` en
  `data-model.md` y research.md #5
- [X] T007 [P] [US1] Crear `app/_components/landing/Hero.tsx`: título y subtítulo con las claves
  `landing.hero.*`, botón primario "Start Designing" sin navegación funcional (FR-008), botón
  secundario "View Collections" que hace scroll a la sección "The Collection" dentro de la misma
  página, y un bloque de marcador de posición visual neutro en vez de una foto real (FR-013)
- [X] T008 [P] [US1] Crear `app/_components/landing/Collection.tsx`: recibe la lista de
  `TarjetaModelo` (T006) y renderiza el grid de tarjetas con estilo del mockup (imagen de portada
  `frontImageUrl` o fondo neutro si es `null`, nombre, descripción, enlace a
  `/${locale}/configurador/${id}`, sin precio) y el estado vacío existente (`home.empty`) cuando la
  lista está vacía (FR-009, FR-010)
- [X] T009 [P] [US1] Crear `app/_components/landing/B2BSection.tsx`: sección "B2B Services & Bulk
  Orders" con las claves `landing.b2b.*` y el botón "Inquire for Wholesale" sin navegación funcional
  (FR-008)
- [X] T010 [P] [US1] Crear `app/_components/landing/ProcessSection.tsx`: sección "The Process" con
  los 3 pasos (`landing.process.*`) y el botón "Launch Configurator" sin navegación funcional
  (FR-008)
- [X] T011 [P] [US1] Crear `app/_components/landing/Footer.tsx`: pie de página con
  `t("common.siteName")`, los enlaces `landing.footer.*` y la línea de copyright
- [X] T012 [US1] Reescribir `app/[locale]/page.tsx` para renderizar, en orden, `Hero`, `Collection`
  (alimentada por la función de T006), `B2BSection`, `ProcessSection` y `Footer`, manteniendo
  `export const dynamic = "force-dynamic"` (depende de T004, T005, T006, T007, T008, T009, T010,
  T011)

**Checkpoint**: la portada muestra las cinco secciones del mockup con datos reales del catálogo, en
ambos idiomas, en escritorio. Historia entregable por sí sola.

---

## Phase 4: User Story 2 - El visitante conserva acceso a las funciones actuales del sitio desde la barra de navegación (Priority: P1)

**Goal**: Restilizar la barra de navegación con el diseño del mockup sin perder ninguna de las
funciones actuales (inicio, selector de idioma, control de cuenta).

**Independent Test**: Abrir la página de inicio y, desde la barra de navegación, cambiar de idioma y
acceder al control de cuenta (iniciar sesión / ver cuenta / cerrar sesión) — igual que en la barra
actual, ahora con el estilo del mockup, en escritorio.

### Implementation for User Story 2

- [X] T013 [P] [US2] Crear `app/_components/landing/NavBar.tsx`: barra fija con el estilo visual del
  mockup (nombre del sitio vía `t("common.siteName")`, enlace a `/${locale}`), que monta
  `ControlCuenta` y `SelectorIdioma` sin modificar su comportamiento interno — solo el contenedor y
  las clases visuales cambian (FR-003, FR-004; contrato en `contracts/pagina-inicio.md`)
- [X] T014 [US2] Actualizar `app/[locale]/layout.tsx` para reemplazar el `<header>` actual por
  `NavBar` (T013), pasándole `locale` (depende de T013)

**Checkpoint**: US1 + US2 completas — la portada se ve como el mockup y la barra de navegación
mantiene idioma y cuenta funcionando, en escritorio.

---

## Phase 5: User Story 3 - El visitante ve la página adaptada correctamente en su dispositivo móvil (Priority: P2)

**Goal**: Adaptar todas las secciones y la barra de navegación a anchos de pantalla móviles y de
tablet, con un patrón de navegación desplegable cuando la barra horizontal completa no cabe.

**Independent Test**: Abrir la página de inicio con el ancho del navegador en ~360-414px y en
~768px: todas las secciones se reacomodan sin scroll horizontal ni contenido cortado, y el menú de
navegación desplegable expone idioma y cuenta sin recortarlos. Depende de que existan las secciones
(US1) y la barra de navegación (US2) para poder recorrer la página completa.

### Implementation for User Story 3

- [X] T015 [P] [US3] Agregar las claves `nav.openMenu` y `nav.closeMenu` (etiqueta accesible del
  botón de menú móvil) en `messages/es.json`
- [X] T016 [P] [US3] Agregar las mismas claves `nav.openMenu` y `nav.closeMenu` en `messages/en.json`
  (paridad con `es.json`; verificado por `tests/traducciones.test.ts`)
- [X] T017 [US3] Crear `app/_components/landing/MobileNavPanel.tsx`: componente cliente
  (`"use client"`, `useState`) con un botón de menú (íconos `menu` / `close` de Material Symbols) que
  despliega un panel con el enlace de inicio, `SelectorIdioma` y `ControlCuenta` (research.md #4,
  FR-007) — depende de T015, T016
- [X] T018 [US3] Integrar `MobileNavPanel` (T017) en `NavBar.tsx`
  (`app/_components/landing/NavBar.tsx`): ocultar los enlaces horizontales completos y mostrar el
  botón de menú por debajo del punto de quiebre `md` (depende de T013, T017)
- [X] T019 [US3] Revisar y ajustar las clases responsive (`grid-cols-1 md:grid-cols-*`, paddings
  `px-margin-mobile md:px-margin-desktop`, tamaños de texto `display-lg-mobile` vs `display-lg`) en
  `Hero.tsx`, `Collection.tsx`, `B2BSection.tsx`, `ProcessSection.tsx` y `Footer.tsx` para que no
  haya overflow horizontal entre 360px y 1920px (SC-003) — depende de que exista la Fase 3 (US1)

**Checkpoint**: las tres historias funcionan juntas — el sitio se ve y funciona igual que el mockup
en cualquier ancho entre 360px y 1920px.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Verificaciones finales que cruzan las tres historias.

- [X] T020 [P] Revisar que todas las imágenes decorativas y de producto en `Hero.tsx` y
  `Collection.tsx` tengan `alt` descriptivo (FR-011)
- [X] T021 Ejecutar `npm run typecheck`, `npm run lint` y `npm test` (incluye
  `tests/traducciones.test.ts`, que confirma la paridad es/en de las claves nuevas de T004/T005/T015/T016)
- [X] T022 Recorrer manualmente los 5 escenarios de `quickstart.md` (fidelidad visual, navbar,
  responsive, catálogo vacío, modelo sin vista "front")

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sin dependencias — puede iniciar de inmediato
- **Foundational (Phase 2)**: depende de Setup — bloquea el resultado visual correcto de todas las
  historias (el código puede escribirse antes, pero no se verá como el mockup sin T002/T003)
- **User Stories (Phase 3-5)**: todas dependen de Foundational
  - US1 (Phase 3) no depende de otra historia
  - US2 (Phase 4) no depende de US1 en el código, pero para probar la portada completa conviene
    tener US1 ya armado
  - US3 (Phase 5) depende explícitamente de que existan las secciones de US1 (T019) y del `NavBar`
    de US2 (T018); es la única historia con esta dependencia (ya señalada en `spec.md`)
- **Polish (Phase 6)**: depende de que las historias que se vayan a entregar estén completas

### Within Each User Story

- US1: T004-T011 (contenido, datos, componentes) en paralelo entre sí → T012 (ensamblar `page.tsx`)
  al final
- US2: T013 (`NavBar`) → T014 (integrarlo en el layout)
- US3: T015-T016 (traducciones) en paralelo → T017 (`MobileNavPanel`) → T018 (integrarlo en
  `NavBar`); T019 (ajustes responsive) puede hacerse en paralelo a T015-T018, ya que toca archivos
  distintos de US1

### Parallel Opportunities

- T002 y T003 (Foundational) en paralelo
- T004, T005, T006, T007, T008, T009, T010, T011 (todas las tareas de contenido/datos/componentes
  de US1) en paralelo entre sí — archivos distintos, sin dependencias entre ellas
- T015 y T016 (traducciones de US3) en paralelo
- T013 (`NavBar` de US2) puede escribirse en paralelo a cualquier tarea de US1, ya que no comparte
  archivo con ninguna

---

## Parallel Example: User Story 1

```bash
# Lanzar juntas todas las tareas de contenido y componentes de US1:
Task: "Agregar landing.* en messages/es.json"
Task: "Agregar landing.* en messages/en.json"
Task: "Agregar consulta de vista front en lib/catalogo/consultas-traducidas.ts"
Task: "Crear app/_components/landing/Hero.tsx"
Task: "Crear app/_components/landing/Collection.tsx"
Task: "Crear app/_components/landing/B2BSection.tsx"
Task: "Crear app/_components/landing/ProcessSection.tsx"
Task: "Crear app/_components/landing/Footer.tsx"

# Solo al final, cuando todas terminaron:
Task: "Reescribir app/[locale]/page.tsx para ensamblar las secciones"
```

---

## Implementation Strategy

### MVP First (User Story 1 solamente)

1. Completar Phase 1: Setup
2. Completar Phase 2: Foundational (tema + fuentes)
3. Completar Phase 3: User Story 1
4. **Detenerse y validar**: abrir `/es` y `/en` en escritorio y comparar contra el mockup
   (Escenario 1 de `quickstart.md`)
5. Esto ya es un entregable visible, aunque la barra de navegación todavía tenga el estilo anterior

### Incremental Delivery

1. Setup + Foundational → base lista
2. + User Story 1 → portada con el diseño nuevo (MVP visual)
3. + User Story 2 → barra de navegación restilizada, funciones intactas
4. + User Story 3 → adaptado a cualquier ancho de pantalla, con menú móvil
5. Cada historia agrega valor sin romper la anterior

---

## Notes

- `[P]` = archivo distinto, sin dependencias pendientes
- La etiqueta de historia (`[US1]`/`[US2]`/`[US3]`) traza cada tarea a su criterio de aceptación en
  `spec.md`
- No se agregó ninguna dependencia nueva a `package.json` (research.md): todo se resuelve con
  Tailwind v4, la fuente de íconos Material Symbols y componentes cliente simples
- Confirmar que `npm test` sigue en verde después de T004/T005 y de T015/T016 (paridad es/en)
