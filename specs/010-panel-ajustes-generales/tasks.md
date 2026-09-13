# Tasks: Ajustes generales del sitio en el panel administrador

**Input**: Design documents from `/specs/010-panel-ajustes-generales/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: Se incluye una tarea de test unitario para la validación pura nueva
(`validarAjustesBasicos`, `validarUrlRedSocial`), siguiendo el patrón ya establecido en el repo
(`tests/design-rules.test.ts`). El resto de la verificación es manual en el navegador vía
`quickstart.md` (Principio IV de la constitution).

**Organization**: Las tareas están agrupadas por historia de usuario (spec.md) para poder
implementar y probar cada una por separado.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Se puede hacer en paralelo (archivos distintos, sin dependencias pendientes)
- **[Story]**: A qué historia de usuario pertenece (US1, US2, US3, US4)

---

## Phase 1: Setup

**Purpose**: Cambio de esquema del que dependen todas las historias.

- [X] T001 Agregar el enum `social_platform` (`instagram | facebook | tiktok | whatsapp | x |
  youtube | linkedin`), la tabla `site_settings` (columnas de `data-model.md`, id fijo exportado
  como `SITE_SETTINGS_ID`) y la tabla `site_social_link` en `lib/db/schema.ts`; correr
  `npm run db:generate` y editar la migración generada en `drizzle/` para agregar el `INSERT` que
  siembra la única fila de `site_settings` con `site_name_es = 'Brahman Friends'` y
  `site_name_en = 'Brahman Friends'` (research.md #1, #2); correr `npm run db:migrate`.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Consulta, validación, navegación y endpoint compartidos que todas las historias
necesitan.

**⚠️ CRITICAL**: Ninguna historia de usuario puede empezar hasta que esta fase esté completa.

- [X] T002 [P] Crear `lib/ajustes/consultas.ts` con `obtenerAjustesSitio()`, envuelta en `cache()`
  de `react`, que trae la fila de `site_settings` (por `SITE_SETTINGS_ID`) junto con sus
  `site_social_link` ordenados por `created_at` ascendente (research.md #3).
- [X] T003 [P] Crear `lib/ajustes/validacion.ts` con `validarAjustesBasicos(input: { siteNameEs,
  siteNameEn })`: devuelve error si alguno de los dos es un string vacío o falta (FR-003).
- [X] T004 [P] Agregar la entrada "Ajustes" (icono `settings`) a `PANEL_NAV_LINKS` en
  `app/[locale]/panel/(protected)/_PanelNav.tsx`, apuntando a `${base}/ajustes` (esta lista la
  reutiliza también `_MobilePanelNav.tsx`, así que no hace falta tocar ese archivo para el enlace);
  agregar la clave `nav.settings` a `messages/es.json` y `messages/en.json`.
- [X] T005 Crear `app/api/panel/ajustes/route.ts` con `GET` (contracts/get-ajustes.md, usa T002) y
  `PUT` (contracts/put-ajustes.md, usa T003 para `siteName`; el resto de los campos —
  `contactEmail`, `contactPhone`, `logoUrl`, `bannerUrl`, `seo.title.*`, `seo.description.*`,
  `seo.imageUrl` — se aceptan como `string | null` sin validación adicional, según el contrato
  completo); ambos gateados por `getSession()` → `errors.noAutorizado()`.

**Checkpoint**: Con la consulta, la validación, el endpoint y el enlace de navegación listos, las
historias de usuario pueden empezar.

---

## Phase 3: User Story 1 - Editar la información básica del sitio (Priority: P1) 🎯 MVP

**Goal**: Una persona administradora edita nombre del sitio (ES/EN), correo y teléfono de
contacto desde `/panel/ajustes`, y el nuevo nombre se ve de inmediato en el sitio público y en el
panel (incluida su vista móvil).

**Independent Test**: Cambiar el nombre del sitio y guardar, y confirmar que aparece en la portada
pública y en el panel (escritorio y móvil) en el idioma correspondiente, sin depender de logo,
banner, SEO ni redes sociales (`quickstart.md` Escenarios 1-2).

### Implementation for User Story 1

- [X] T006 [US1] Crear `app/[locale]/panel/(protected)/ajustes/page.tsx`: `await
  obtenerAjustesSitio()` (T002) y pasa los valores a `AjustesForm`.
- [X] T007 [US1] Crear `app/[locale]/panel/(protected)/ajustes/_components/AjustesForm.tsx`
  (client component): campos de nombre del sitio (ES/EN), correo y teléfono de contacto; al
  guardar hace `PUT /api/panel/ajustes` (T005) con esos campos; muestra confirmación de éxito o un
  error claro sin perder lo que la persona administradora había escrito (FR-016, edge case de
  guardado con campo obligatorio vacío).
- [X] T008 [US1] En `app/[locale]/(site)/layout.tsx`, `await obtenerAjustesSitio()` (T002) y pasar
  `siteName` (nombre resuelto según `locale`) como prop a `NavBar`.
- [X] T009 [P] [US1] En `app/_components/landing/NavBar.tsx`, recibir `siteName` como prop y
  mostrarlo en vez de `t("common.siteName")`.
- [X] T010 [US1] En `app/[locale]/(site)/page.tsx`, `await obtenerAjustesSitio()` (T002) y pasar
  `siteName` como prop a `Footer`.
- [X] T011 [P] [US1] En `app/_components/landing/Footer.tsx`, recibir `siteName` como prop y
  mostrarlo en vez de `t("common.siteName")` (en el bloque de marca y en `landing.footer.copyright`).
- [X] T012 [US1] En `app/[locale]/panel/(protected)/layout.tsx`, `await obtenerAjustesSitio()`
  (T002) y pasar `siteName` como prop nueva a `PanelNav` (junto al `userName` que ya le pasa).
- [X] T013 [P] [US1] En `_PanelNav.tsx`, recibir `siteName` como prop y mostrarlo en vez de
  `t("common.siteName")`.
- [X] T014 [P] [US1] En `app/[locale]/panel/(protected)/_MobilePanelNav.tsx`, aceptar un prop
  `siteName: string` y mostrarlo en vez de `t("common.siteName")` (único lugar del código, además
  de `NavBar`/`Footer`/`_PanelNav`, que hoy usa esa clave); extender `layout.tsx` (T012) para
  pasarle ese mismo `siteName` además de a `PanelNav`.
- [X] T015 [P] [US1] Agregar las claves `panel.ajustes.title`, `panel.ajustes.basics.*` (labels de
  nombre ES/EN, correo, teléfono, guardar, éxito, error) a `messages/es.json` y `messages/en.json`;
  retirar la clave `common.siteName` de ambos archivos una vez confirmado que T009, T011, T013 y
  T014 ya no la usan (research.md #2).
- [X] T016 [P] [US1] Agregar test unitario de `validarAjustesBasicos` en
  `tests/ajustes-sitio.test.ts` (nombre requerido en ambos idiomas, rechaza vacío/falta).

**Checkpoint**: El nombre del sitio, el correo y el teléfono se editan desde el panel y se ven
reflejados de inmediato en el sitio público y en el propio panel (escritorio y móvil).

---

## Phase 4: User Story 2 - Subir y actualizar el logotipo y el banner del header (Priority: P2)

**Goal**: Una persona administradora sube, reemplaza y quita el logotipo y el banner del header de
la portada; el logo reemplaza el nombre en texto (en escritorio y móvil) y el banner llena el
recuadro destacado de la portada.

**Independent Test**: Subir un logo y un banner, guardarlos, y confirmar que aparecen en los
lugares correspondientes del sitio público, y que quitarlos vuelve al estado sin imagen
(`quickstart.md` Escenario 3).

### Implementation for User Story 2

- [X] T017 [US2] Extender `AjustesForm.tsx` (T007): agregar dos instancias de `SubidaArchivo`
  (`app/[locale]/panel/_components/SubidaArchivo.tsx`) para logo y banner —
  `presignEndpoint="/api/panel/subidas/presignar"`, `pathPrefix` `"ajustes/logo"` /
  `"ajustes/banner"`, `accept` = `["image/png", "image/jpeg", "image/svg+xml", "image/webp"]`,
  `maxSizeBytes` recibido como prop numérica (T018) — y un botón "Quitar" por cada una que pone
  `logoUrl`/`bannerUrl` en `null`; incluir ambos campos en el `PUT`.
- [X] T018 [US2] En `app/[locale]/panel/(protected)/ajustes/page.tsx` (T006), pasar
  `env.maxLogoMb * 1024 * 1024` como prop `maxImageBytes` a `AjustesForm` (research.md #7).
- [X] T019 [US2] Extender `app/api/panel/subidas/presignar/route.ts`: aceptar un `contentLength`
  opcional en el body (mismo campo que ya acepta `app/api/subidas/presignar/route.ts`) y, si
  supera `env.maxLogoMb * 1024 * 1024`, responder `errors.archivoDemasiadoGrande(env.maxLogoMb)`
  antes de llamar a `crearUrlPrefirmada` (research.md #7); extender el llamado a `subirDirecto`
  desde `SubidaArchivo` (usado por T017) para enviar `file.size` como `contentLength`.
- [X] T020 [US2] En `app/[locale]/(site)/layout.tsx` (T008), agregar `logoUrl` a los props que ya
  pasa a `NavBar`.
- [X] T021 [P] [US2] En `NavBar.tsx` (T009), si `logoUrl` existe mostrar una `<img>` con esa URL en
  vez del nombre en texto; si es `null`, seguir mostrando el nombre (FR-007).
- [X] T022 [US2] En `app/[locale]/panel/(protected)/layout.tsx` (T012), agregar `logoUrl` a los
  props que ya pasa a `PanelNav`.
- [X] T023 [P] [US2] En `_PanelNav.tsx` (T013), mismo tratamiento que T021.
- [X] T024 [P] [US2] En `_MobilePanelNav.tsx` (T014), aceptar también `logoUrl?: string | null` y,
  si existe, mostrar el logo en vez del nombre en texto — mismo tratamiento que T021/T023; extender
  `layout.tsx` (T022) para pasarle `logoUrl` también a `MobilePanelNav`.
- [X] T025 [US2] En `app/_components/landing/Hero.tsx`, agregar prop `bannerUrl?: string | null`;
  si existe, usarla como imagen de fondo del `div` que hoy es el marcador de posición vacío
  (`bg-surface-container`, dentro del bloque que también muestra "ARRASTRÁ PARA ROTAR", sin tocar
  ese indicador — research.md #8); si es `null`, se ve exactamente igual que hoy (FR-008).
- [X] T026 [US2] En `app/[locale]/(site)/page.tsx` (T010), pasar `bannerUrl` (de
  `obtenerAjustesSitio()`) como prop a `Hero`.
- [X] T027 [P] [US2] Agregar las claves `panel.ajustes.logo.*` y `panel.ajustes.banner.*` (select,
  upload, uploading, success, error, retry, quitar) a `messages/es.json` y `messages/en.json`.

**Checkpoint**: Logo y banner se administran de punta a punta desde el panel y se reflejan en el
sitio público y en el panel mismo (escritorio y móvil), con el tamaño máximo exigido también en el
servidor.

---

## Phase 5: User Story 3 - Configurar el SEO del sitio (Priority: P3)

**Goal**: Una persona administradora configura título, descripción e imagen de vista previa de SEO
(ES/EN) para la página de inicio.

**Independent Test**: Completar título, descripción e imagen de SEO, guardar, y confirmar que
aparecen como metadatos de la portada en el idioma correspondiente; con los campos vacíos, la
portada sigue teniendo título y descripción por defecto (`quickstart.md` Escenario 4).

### Implementation for User Story 3

- [X] T028 [US3] Extender `AjustesForm.tsx` (T007/T017): agregar campos de título y descripción de
  SEO (ES/EN) y una tercera instancia de `SubidaArchivo` (`pathPrefix="ajustes/seo"`, mismas reglas
  de formato/tamaño que T017/T019) para la imagen de vista previa; incluir los tres en el `PUT`.
- [X] T029 [US3] En `app/[locale]/(site)/page.tsx` (T010/T026), exportar `generateMetadata({
  params }: { params: Promise<{ locale: Locale }> })`: lee `obtenerAjustesSitio()` y arma `{
  title, description, openGraph: { title, description, images } }` según `locale`; si el título o
  la descripción de SEO no están configurados, usa como valor por defecto respectivamente el
  nombre del sitio (`siteName`) y la clave ya existente `landing.hero.subtitle` (research.md #9,
  FR-011).
- [X] T030 [P] [US3] Agregar las claves `panel.ajustes.seo.*` (título ES/EN, descripción ES/EN,
  imagen de vista previa) a `messages/es.json` y `messages/en.json`.

**Checkpoint**: La portada expone título, descripción e imagen de SEO configurables, con
valores por defecto razonables cuando no se configuran.

---

## Phase 6: User Story 4 - Agregar y administrar redes sociales (Priority: P4)

**Goal**: Una persona administradora agrega, edita y quita enlaces de redes sociales (de una lista
fija de 7 plataformas), visibles con su icono en el pie de página del sitio público.

**Independent Test**: Agregar una red social eligiendo una plataforma de la lista, guardar, y
confirmar que aparece con su icono en el pie de página, apuntando al enlace correcto; editarla y
quitarla y confirmar que el pie de página refleja el cambio (`quickstart.md` Escenario 5).

### Implementation for User Story 4

- [X] T031 [P] [US4] Extender `lib/ajustes/validacion.ts` (T003): agregar `validarUrlRedSocial(url:
  string)`, que confirma formato de dirección web válida (`http://` o `https://`).
- [X] T032 [P] [US4] Crear `lib/ajustes/iconos-redes.tsx` con `SOCIAL_PLATFORM_ICONS`: un SVG en
  línea por cada una de las 7 plataformas (`instagram`, `facebook`, `tiktok`, `whatsapp`, `x`,
  `youtube`, `linkedin`) (research.md #6).
- [X] T033 [US4] Crear `app/api/panel/ajustes/redes/route.ts` con `POST`
  (contracts/post-ajustes-redes.md): valida `platform` contra el enum y `url` con
  `validarUrlRedSocial` (T031), gateado por `getSession()`.
- [X] T034 [US4] Crear `app/api/panel/ajustes/redes/[id]/route.ts` con `PATCH` y `DELETE`
  (contracts/patch-delete-ajustes-red.md), mismas validaciones que T033 para `PATCH`, gateados por
  `getSession()`.
- [X] T035 [US4] Crear `app/[locale]/panel/(protected)/ajustes/_components/RedesSociales.tsx`
  (client component): lista las redes ya guardadas con su icono (T032); formulario para agregar
  (selector de las 7 plataformas fijas + campo URL) que llama a `POST` (T033); edición y borrado
  por fila que llaman a `PATCH`/`DELETE` (T034).
- [X] T036 [US4] Incluir `RedesSociales` en `app/[locale]/panel/(protected)/ajustes/page.tsx`
  (T006), pasándole las `socialLinks` que ya trae `obtenerAjustesSitio()`.
- [X] T037 [US4] En `app/_components/landing/Footer.tsx` (T011), agregar una fila de iconos de
  redes sociales a partir de una prop `socialLinks`, cada uno como `<a href={url}>` con el icono de
  su plataforma (T032).
- [X] T038 [US4] En `app/[locale]/(site)/page.tsx` (T010), pasar `socialLinks` (de
  `obtenerAjustesSitio()`) como prop a `Footer`.
- [X] T039 [P] [US4] Agregar las claves `panel.ajustes.redes.*` (nombre de cada plataforma, agregar,
  editar, quitar, error de url inválida) a `messages/es.json` y `messages/en.json`.

**Checkpoint**: Todas las historias de usuario (P1 a P4) están completas y probables de forma
independiente.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Verificación final de que nada quedó a medias y de que no hay regresiones.

- [X] T040 [P] Confirmar con `grep -r "common.siteName" app messages` que la clave retirada en T015
  no queda referenciada en ningún archivo.
- [ ] T041 Recorrer los 6 escenarios de `quickstart.md` de punta a punta en el navegador, en
  español e inglés (incluyendo la vista móvil del panel).
- [X] T042 Correr `npm run typecheck` y `npm run test` sobre todo el repo para confirmar que no hay
  regresiones.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sin dependencias — empieza de inmediato.
- **Foundational (Phase 2)**: Depende de Setup (necesita las tablas). Bloquea todas las historias.
- **User Story 1 (Phase 3)**: Depende de Foundational. Sin dependencias de otras historias.
- **User Story 2 (Phase 4)**: Depende de Foundational y de que `AjustesForm.tsx`/`page.tsx` de US1
  ya existan (T007, T006) para extenderlos, y de que `NavBar`/`PanelNav`/`MobilePanelNav` ya
  reciban `siteName` (T009, T013, T014) antes de sumarles `logoUrl`; no depende de que US1 esté
  "terminada" en el sentido de probada, solo de que esos archivos existan.
- **User Story 3 (Phase 5)**: Depende de Foundational y de US1/US2 (extiende `AjustesForm.tsx` y
  `page.tsx` una vez más).
- **User Story 4 (Phase 6)**: Depende de Foundational y de US1 (`page.tsx`, T006) y de que
  `Footer.tsx` ya reciba `siteName` como prop (T011) antes de sumarle `socialLinks`. Sus endpoints
  (T033-T034) son independientes de US2/US3.
- **Polish (Phase 7)**: Depende de que todas las historias deseadas estén completas.

### Dentro de cada historia

- US1: T006 antes que T007; T008 antes que T009; T010 antes que T011; T012 antes que T013 y T014
  (ambas leen el `siteName` que T012 ya trae); T015 depende de que T009, T011, T013 y T014 ya no
  usen `common.siteName`; T016 en paralelo con todo.
- US2: T017 y T018 se retroalimentan (mismo formulario/página); T019 es independiente de T017/T018
  en archivo (toca el endpoint de presign, no el formulario) pero se prueba junto con ellos; T020
  antes que T021; T022 antes que T023 y T024; T025 y T026 en paralelo con lo anterior; T027 en
  paralelo con todo.
- US3: T028 antes que T029 (la página ya debe tener el campo de SEO guardable para poder
  mostrarlo, aunque técnicamente `generateMetadata` solo lee, no escribe); T030 en paralelo.
- US4: T031 y T032 en paralelo; T033 depende de T031; T034 depende de T031; T035 depende de T032,
  T033, T034; T036 depende de T035; T037 depende de T032; T038 depende de T037; T039 en paralelo
  con todo.
- Polish: T040-T042 en orden, al final.

### Parallel Opportunities

- Todas las tareas [P] de Foundational (T002-T004) se pueden hacer en paralelo.
- Dentro de US1: T009, T011, T013, T014, T015, T016 se pueden hacer en paralelo entre sí (una vez
  hechas sus tareas de "layout"/"page" respectivas).
- Dentro de US2: T021, T023, T024, T027 en paralelo (T019 es independiente de archivo pero
  conviene secuenciarla junto a T017/T018 al probarla).
- Dentro de US3: T030 en paralelo con T028/T029.
- Dentro de US4: T031, T032, T039 en paralelo entre sí.
- Una vez completa Foundational, distintas personas podrían repartirse US1, US2, US3 y US4, aunque
  en la práctica US2-US4 extienden archivos que US1 crea primero (`AjustesForm.tsx`, `page.tsx`,
  `_MobilePanelNav.tsx`), así que conviene completar US1 antes de repartir el resto.

---

## Parallel Example: Foundational

```bash
Task: "Crear obtenerAjustesSitio() en lib/ajustes/consultas.ts"
Task: "Crear validarAjustesBasicos en lib/ajustes/validacion.ts"
Task: "Agregar entrada 'Ajustes' a PANEL_NAV_LINKS en _PanelNav.tsx"
```

## Parallel Example: User Story 1

```bash
Task: "Reemplazar t('common.siteName') por prop siteName en NavBar.tsx"
Task: "Reemplazar t('common.siteName') por prop siteName en Footer.tsx"
Task: "Reemplazar t('common.siteName') por prop siteName en _PanelNav.tsx"
Task: "Reemplazar t('common.siteName') por prop siteName en _MobilePanelNav.tsx"
Task: "Agregar labels panel.ajustes.* y retirar common.siteName de messages/es.json y en.json"
Task: "Agregar test unitario de validarAjustesBasicos en tests/ajustes-sitio.test.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1: Setup (T001).
2. Phase 2: Foundational (T002-T005) — bloqueante.
3. Phase 3: User Story 1 (T006-T016).
4. **Parar y validar**: recorrer `quickstart.md` Escenarios 1-2.
5. En este punto ya se puede editar el nombre del sitio, correo y teléfono, y verlo reflejado en
   todo el sitio (escritorio y móvil) — aunque logo, banner, SEO y redes sociales todavía no
   existen.

### Incremental Delivery

1. Setup + Foundational → base lista.
2. + User Story 1 → nombre/contacto editables (MVP de la sección Ajustes).
3. + User Story 2 → identidad visual real (logo, banner) en vez de solo texto/recuadro vacío, con
   el límite de tamaño exigido también en el servidor.
4. + User Story 3 → SEO configurable de la portada.
5. + User Story 4 → redes sociales visibles en el pie de página.
6. + Polish → confirmar que no quedó ninguna referencia a la clave de traducción retirada y que no
   hay regresiones.

## Notes

- [P] = archivos distintos, sin dependencias pendientes entre sí.
- [Story] mapea cada tarea a su historia de usuario para trazabilidad.
- `AjustesForm.tsx` y `app/[locale]/(site)/page.tsx` se extienden en varias fases (US1 → US2 → US3
  → US4): no es una tarea repetida, es la misma pantalla/archivo creciendo con cada historia,
  siguiendo el orden de prioridad de la spec. Lo mismo aplica a `_MobilePanelNav.tsx` (US1 → US2).
- T014, T019 y T024 se agregaron tras `/speckit-analyze` (hallazgos E1 y C1): el análisis encontró
  que `_MobilePanelNav.tsx` usa `t("common.siteName")` de forma independiente a `NavBar`/`Footer`/
  `_PanelNav`, y que `research.md #7` había decidido validar el tamaño máximo de archivo también en
  el servidor sin que ninguna tarea lo implementara.
- Durante `/speckit-implement` (T008/T020) apareció un cuarto consumidor de `NavBar` que ni la spec
  ni las tareas habían listado: `app/[locale]/panel/login/layout.tsx` (la portada pública se
  renderiza también en `/panel/login`, fuera del layout protegido). Se corrigió igual que
  `app/[locale]/(site)/layout.tsx` (pasa `siteName`/`logoUrl`), sin lo cual el build hubiera fallado
  y la página de login habría quedado mostrando `t("common.siteName")` roto tras retirar esa clave.
- T019 se implementó extendiendo `lib/media/subir-directo.ts` (agrega `contentLength: file.size` al
  cuerpo del pedido de presign) en vez de tocar cada llamador por separado: como todos los flujos de
  subida directa pasan por esa única función, la ruta de presign del panel recibe el tamaño real sin
  que `AjustesForm`/`SubidaArchivo` necesiten pasarlo a mano.
- No se marcó T041 (recorrido manual de `quickstart.md` en el navegador): este entorno no tiene una
  herramienta de automatización de navegador, y `DATABASE_URL` apunta a la base de datos real de
  desarrollo del proyecto (no una de pruebas descartable), así que no se creó una cuenta de
  administrador nueva solo para iniciar sesión y probarlo. En su lugar se verificó por HTTP
  (`curl`) contra `npm run dev`: la portada responde 200 y muestra el nombre del sitio desde
  `site_settings` (no el texto fijo de antes), `/panel/ajustes` redirige a `/panel/login` sin
  sesión, `GET /api/panel/ajustes` devuelve 401 sin sesión, y el `<title>`/`<meta description>` de
  la portada muestran los valores por defecto esperados (FR-011) cuando el SEO no está configurado.
  Falta que una persona con una cuenta de panel real recorra `quickstart.md` en el navegador
  (Principio IV de la constitution) para confirmar los flujos interactivos: subir logo/banner/imagen
  de SEO, y agregar/editar/quitar una red social.
- Rediseño visual posterior de `AjustesForm.tsx`/`RedesSociales.tsx` (a pedido del usuario, con una
  captura de referencia): se agregó `SeccionAjustes.tsx` (tarjeta compartida por cada bloque), un
  encabezado con eyebrow + botón "Guardar" y una barra inferior fija ("Guardar"/"Descartar"), cajas
  de subida con recuadro punteado, contadores de caracteres para título/descripción de SEO, una
  vista previa tipo tarjeta Open Graph, y la lista de redes sociales con badge "Activo" e íconos de
  editar/quitar — sin tocar `SubidaArchivo.tsx` (se reutiliza tal cual dentro de las cajas nuevas,
  para no afectar otras pantallas del panel que también la usan). Verificado con `tsc`, `eslint`,
  `vitest` y `next build`, más un `renderToStaticMarkup` puntual de ambos componentes con datos
  reales (imágenes vacías/con URL, lista de redes vacía/con filas) para confirmar que ninguna rama
  nueva de JSX lanza en tiempo de ejecución — sigue pendiente el mismo recorrido manual de T041.
