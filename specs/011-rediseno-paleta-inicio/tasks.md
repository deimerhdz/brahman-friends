# Tasks: Nueva paleta de colores y rediseño de la página de inicio

**Input**: Design documents from `/specs/011-rediseno-paleta-inicio/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/ui-contracts.md, quickstart.md

**Tests**: Solo pruebas unitarias de las funciones puras nuevas (research.md #13): WhatsApp y
carrito. La verificación visual se hace con quickstart.md.

**Referencia visual**: `../brahman-threads/src/routes/index.tsx` (JSX, clases y textos) y
`../brahman-threads/src/styles.css` (valores de color y clases auxiliares). Cada tarea de UI copia
la estructura y las clases de Tailwind de la sección indicada, cambiando:

- `lucide-react` → `<span className="material-symbols-outlined">nombre</span>` (research.md #3);
  WhatsApp/YouTube → `SOCIAL_PLATFORM_ICONS` de `lib/ajustes/iconos-redes.tsx`.
- `<Button>` de shadcn → `<button>`/`<a>`/`Link` nativos con las mismas clases.
- Clases de color shadcn → tokens del proyecto: `bg-background`→`bg-surface`,
  `text-foreground`→`text-on-surface`, `bg-card`→`bg-surface-container-lowest`,
  `text-muted-foreground`→`text-on-surface-variant`, `border-border`→`border-outline-variant`,
  `bg-action`/`text-action`→`bg-primary`/`text-primary`, `text-action-foreground`→`text-on-primary`,
  `text-primary-foreground`→`text-on-deep`, `bg-surface`(arena)→`bg-surface-container`;
  `bg-deep`, `text-gold`, `bg-preview`, `bg-whatsapp` se usan tal cual.
- Textos fijos → `t("inicio.…")` según contracts/ui-contracts.md §4, añadiendo la clave en
  `messages/es.json` (texto de la referencia) y `messages/en.json` (traducción) en la misma tarea.
- `<img>` → `next/image` con `src="/inicio/…"`.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)

## Path Conventions

Proyecto Next.js único en la raíz: `app/`, `lib/`, `messages/`, `public/`, `tests/`.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Fotos, fuentes y paleta disponibles para todo el sitio público.

- [X] T001 [P] Copiar de `../brahman-threads/src/assets/` a `public/inicio/` los archivos `ranch-hero.jpg`, `ranch-team.jpg`, `cap-navy.jpg`, `cap-sand.jpg`, `cap-black.jpg`, `cap-camo.jpg`, `community-pasture.jpg`, `community-auction.jpg`, `community-woman.jpg`, `community-saddle.jpg` (research.md #4)
- [X] T002 [P] Añadir `family=Barlow+Condensed:wght@700;800;900`, `family=DM+Sans:wght@400;500;700` y `family=Permanent+Marker` a la URL del `<link>` de Google Fonts existente (el de Inter/JetBrains Mono) en `app/layout.tsx` (research.md #2)
- [X] T003 Añadir la paleta a `app/globals.css` sin cambiar ningún valor existente de `@theme`: (a) en `@theme` registrar los tokens nuevos `--color-deep: oklch(0.19 0.035 254)`, `--color-on-deep: oklch(0.985 0.004 85)`, `--color-gold: oklch(0.77 0.11 76)`, `--color-preview: oklch(0.88 0.02 75)`, `--color-whatsapp: oklch(0.66 0.19 150)` y `--font-display: "Barlow Condensed", sans-serif`; (b) crear el bloque `.tema-campo { … }` que redefine los tokens existentes según la tabla de research.md #1 (surface/background/surface-bright, surface-container-lowest, surface-container/-low/-variant, on-surface/on-background/brand, on-surface-variant/on-secondary-container, outline-variant/outline, primary/brand-accent, on-primary/on-secondary) y las fuentes `--font-body-md`, `--font-body-lg`, `--font-button` → `"DM Sans", sans-serif` y `--font-display-lg`, `--font-display-lg-mobile`, `--font-headline-md` → `"Barlow Condensed", sans-serif`, más `font-family: "DM Sans", sans-serif`; (c) copiar de `../brahman-threads/src/styles.css` las clases `.brand`, `.brand-script`, `.hero-shade` (con su media query de 640px), `.eyebrow`, `.section-title`, `.step-number`, `.footer-heading`, `.swatch-navy/-sand/-black/-camo` anidadas bajo `.tema-campo`, cambiando `var(--color-action)`→`var(--color-primary)` y `var(--color-primary-foreground)`→`var(--color-on-deep)`; (d) dentro de `.tema-campo` redefinir `.electric-hover:hover` y `.text-electric-hover:hover` para usar `var(--color-primary)` en vez de `#003ec7`; (e) añadir `html:has(.tema-campo) { scroll-behavior: smooth; }` y la regla `prefers-reduced-motion` de la referencia limitada a `.tema-campo *, .tema-campo *::before, .tema-campo *::after` (más `html:has(.tema-campo) { scroll-behavior: auto; }` dentro de la media query), para que el panel no cambie de comportamiento (FR-001, FR-002, FR-003, FR-029)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Tema aplicado al grupo `(site)`, logotipo y enlaces de WhatsApp que usan varias historias.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T004 [P] Crear `lib/ajustes/whatsapp.ts` con `numeroWhatsApp(ajustes: Pick<AjustesSitio, "contactPhone" | "socialLinks">): string | null` (extrae los dígitos del enlace `whatsapp` de `socialLinks` desde `wa.me/<n>`, `?phone=<n>` de `api.whatsapp.com/send` o `whatsapp://send`; si no hay, usa `contactPhone` quitando todo lo que no sea dígito; devuelve `null` si queda con menos de 7 dígitos) y `enlaceWhatsApp(numero: string, texto: string): string` → `https://wa.me/${numero}?text=${encodeURIComponent(texto)}` (research.md #6, contracts §2)
- [X] T005 [P] Crear `tests/whatsapp.test.ts` con casos: `wa.me/573001234567`, `https://api.whatsapp.com/send?phone=57300…`, `whatsapp://send?phone=…`, sin red WhatsApp pero con `contactPhone: "+57 300 123 4567"`, red WhatsApp con URL sin número → cae a `contactPhone`, nada configurado → `null`, número de 5 dígitos → `null`, y `enlaceWhatsApp` codifica saltos de línea y tildes
- [X] T006 [P] Crear `app/_components/inicio/Marca.tsx` (componente de servidor) con props `{ logoUrl: string | null; siteName: string; claro?: boolean }`: si hay `logoUrl` muestra `<img>` `h-10 w-auto` con `alt={siteName}`; si no, reproduce `Brand` de la referencia con `t("inicio.marca.principal")` ("BRAHMAN", en `font-black`) y `t("inicio.marca.script")` ("friends.", con `brand-script text-primary`), usando `text-on-deep` cuando `claro`; recibe `t` como prop y añade ambas claves a `messages/es.json` y `messages/en.json` (FR-009, Principio II: ningún texto visible fijo en el código)
- [X] T007 Envolver el contenido de `app/[locale]/(site)/layout.tsx` en `<div className="tema-campo min-h-screen bg-surface text-on-surface">` (research.md #1). No tocar `app/[locale]/panel/**`. Calcular `const whatsapp = numeroWhatsApp(ajustes)` para pasarlo a los componentes de las fases siguientes

**Checkpoint**: Todas las páginas públicas ya usan crema, azul marino, rojo y las letras nuevas; `/panel` y `/panel/login` siguen igual.

---

## Phase 3: User Story 1 - El visitante ve la portada con el diseño de Brahman Threads (Priority: P1) 🎯 MVP

**Goal**: Estructura de la portada con franja de anuncios, encabezado, héroe, beneficios, pie de página y botón flotante de WhatsApp, en español e inglés.

**Independent Test**: Abrir `/es` y `/en` a 1440 px junto a la referencia y comparar franja, encabezado, héroe, beneficios y pie; subir un banner en Ajustes y comprobar que reemplaza la foto (quickstart pasos 1, 3 y 4). Los botones del héroe apuntan a `#personaliza` y `#colecciones`, secciones que aparecen en US4 y US2: en US1 solo se comprueba que los enlaces existen; el paso 2 de quickstart se verifica en el checkpoint de US4.

- [X] T008 [P] [US1] Crear `app/_components/inicio/FranjaAnuncio.tsx` copiando la franja superior de la referencia (`bg-deep`, `✦` y `/` en `text-gold`) con `inicio.anuncio.envios` e `inicio.anuncio.bordado`
- [X] T009 [P] [US1] Crear `app/_components/inicio/Heroe.tsx` (props `t`, `bannerUrl: string | null`) copiando la sección `#inicio` de la referencia: `next/image` con `fill`, `priority`, `src={bannerUrl ?? "/inicio/ranch-hero.jpg"}` y `object-[61%_center]`, capa `hero-shade`, eyebrow dorado, `h1` en `font-display` con punto `text-primary`, subtítulo, botón rojo "Personalizar con mi hierro" → `#personaliza`, botón contorneado "Ver colección oficial" → `#colecciones`, enlace inferior "Explora la colección" → `#colecciones`. Claves `inicio.hero.*` (FR-006)
- [X] T010 [P] [US1] Crear `app/_components/inicio/Beneficios.tsx` copiando la franja de beneficios de la referencia (`grid-cols-2 md:grid-cols-4 divide-x`, fondo `bg-surface-container`) con íconos Material `star`, `wb_sunny`, `local_shipping`, `verified_user` en `text-primary` y claves `inicio.beneficios.*`
- [X] T011 [P] [US1] Crear `app/_components/inicio/BotonWhatsApp.tsx` (props `numero: string | null`, `texto: string`, `etiqueta: string`): si `numero` es `null` no renderiza nada; si no, `<a>` fijo `bottom-5 right-5 z-30 h-14 w-14 rounded-full bg-whatsapp text-white shadow-xl` con el ícono de WhatsApp de `SOCIAL_PLATFORM_ICONS` y `href={enlaceWhatsApp(numero, texto)}` (FR-027)
- [X] T012 [P] [US1] Crear `app/_components/inicio/PieSitio.tsx` (props `t`, `locale`, `siteName`, `logoUrl`, `socialLinks`, `whatsapp: string | null`) copiando el `<footer>` de la referencia: `<Marca claro />` y `inicio.pie.proposito`; columna "Explora" con enlaces `/{locale}#colecciones`, `#personaliza`, `#mayor`; columna "Contacto" con "Hablar por WhatsApp ↗" (solo si hay número) y "Ver en YouTube ↗" (solo si hay red `youtube`); columna "Tu pedido" con texto y `verified_user` dorado; debajo, íconos de todas las redes de `socialLinks`; barra inferior con `inicio.pie.derechos` (año y nombre) y "Volver arriba ↑" → `/{locale}#inicio` (FR-026)
- [X] T013 [US1] Crear `app/_components/inicio/EncabezadoSitio.tsx` (servidor; props `locale`, `siteName`, `logoUrl`, `whatsapp`, `youtubeUrl: string | null`) copiando el `<header>` sticky de la referencia (`sticky top-0 z-40 h-[76px] lg:h-[88px] bg-surface/95 backdrop-blur-md border-b`): `Link` a `/{locale}` con `<Marca>`, `<nav>` `hidden xl:flex` con los 4 enlaces `/{locale}#colecciones|#personaliza|#mayor|#comunidad` (`inicio.nav.*`), y a la derecha: acceso a WhatsApp (si hay número) con `enlaceWhatsApp(numero, t("inicio.whatsapp.general", { siteName }))`, `<SelectorIdioma>` y `<ControlCuenta>` existentes dentro de un contenedor `hidden xl:flex` (por debajo de `xl` solo aparecen en el menú, T014), y `<AccionesEncabezado>` (T014) (FR-009 a FR-011)
- [X] T014 [US1] Crear `app/_components/inicio/AccionesEncabezado.tsx` (cliente) con el botón de menú `xl:hidden` (`menu`/`close`, `aria-label` `inicio.nav.abrirMenu`/`cerrarMenu`) y el panel móvil desplegable de la referencia con los 4 enlaces de sección, "Comunidad YouTube ↗" (si `youtubeUrl`), y los `children` recibidos (selector de idioma y control de cuenta, que `EncabezadoSitio` pasa también aquí); se cierra al pulsar un enlace o Escape (FR-012). Dejar un hueco `extra?: React.ReactNode` antes del botón de menú para la lupa (US2) y el carrito (US3)
- [X] T015 [US1] En `app/[locale]/(site)/layout.tsx` reemplazar `<NavBar>` por `<FranjaAnuncio>` + `<EncabezadoSitio>`, quitar `pt-20` del `<main>`, y renderizar `<PieSitio>` después de `<main>` y `<BotonWhatsApp texto={t("inicio.whatsapp.flotante", { siteName })}>` al final, todo dentro de `.tema-campo`. `youtubeUrl` = URL de la red `youtube` de `ajustes.socialLinks` o `null`
- [X] T016 [US1] Reescribir `app/[locale]/(site)/page.tsx`: renderizar `<Heroe>` y `<Beneficios>` (las secciones de US2 y US4 se añaden en sus fases); quitar los imports y usos de `Hero`, `Collection`, `B2BSection`, `ProcessSection` y `Footer`; el pie ahora lo pone el layout; cambiar en `generateMetadata` `t("landing.hero.subtitle")` por `t("inicio.hero.subtitulo")`
- [X] T017 [US1] Borrar `app/_components/landing/Hero.tsx`, `Collection.tsx`, `B2BSection.tsx`, `ProcessSection.tsx` y `Footer.tsx` (conservar `NavBar.tsx`, `MobileNavPanel.tsx` y `TarjetaModeloCard.tsx`), y quitar de `messages/es.json` y `messages/en.json` las claves `landing.hero.*`, `landing.b2b.*`, `landing.process.*`, `landing.footer.*` y las de `landing.collection.*` que no sean `eyebrow`, `viewDetails` y `customize`, comprobando antes con búsqueda en el repositorio que ninguna otra ruta las usa (contracts §4)
- [X] T018 [US1] Ejecutar `yarn test` (paridad de traducciones en `tests/traducciones.test.ts`) y `yarn typecheck`, y completar las claves `inicio.anuncio.*`, `inicio.nav.*`, `inicio.hero.*`, `inicio.beneficios.*`, `inicio.pie.*` e `inicio.whatsapp.*` que falten en `messages/es.json` y `messages/en.json`

**Checkpoint**: La portada muestra franja, encabezado, héroe, beneficios y pie con el diseño de la referencia en ambos idiomas.

---

## Phase 4: User Story 2 - El visitante explora la colección real y la filtra (Priority: P1)

**Goal**: "Nuestra colección" con modelos publicados, pestañas, buscador y muestras de color.

**Independent Test**: Con un configurable (dos colores con foto frontal) y un producto fijo publicados, usar las pestañas, la lupa y las muestras, y pulsar "Personalizar" (quickstart pasos 5–7).

- [X] T019 [US2] En `app/[locale]/(site)/page.tsx` construir la lista `TarjetaColeccion[]` de data-model.md: los modelos publicados de `capModelConNombreYPortada()` (orden `publishedAt` desc) y, para los `configurable`, sus colores con nombre del idioma activo (`colorConNombre()`) unidos a `color_image` de vista `front` (omitir colores sin foto frontal); calcular también `hrefPersonalizableDestacado` (primer configurable o `null`) para US4
- [X] T020 [US2] Crear `app/_components/inicio/Coleccion.tsx` (cliente; props `locale`, `modelos: TarjetaColeccion[]`, textos ya traducidos en un objeto `textos`) copiando la sección `#colecciones` de la referencia: encabezado con eyebrow, `section-title` y contador; pestañas `Todos | Personalizables | Productos listos` con borde inferior `border-primary` en la activa (`role="tablist"`, `aria-selected`); rejilla `sm:grid-cols-2 lg:grid-cols-4`; tarjetas con `next/image` (`aspect-[1/1.08]`, zoom al pasar, fondo `bg-surface-container` si no hay foto), etiqueta `bg-deep` en la esquina (`etiquetaPersonalizable`/`etiquetaListo`), nombre `font-display`, a la derecha precio con `formatUsd` (producto fijo) o `cotizar` (configurable), muestras de color como miniaturas circulares `h-7 w-7` de la foto frontal de cada color con `aria-pressed` que cambian la foto de la tarjeta, y botón rojo de ancho completo: `Link` "Personalizar" a `href` para configurables; para productos fijos un botón "Añadir al carrito" que por ahora navega a `href` (US3 lo conecta al carrito); mensajes `vacia` (sin modelos) y `sinResultados` (FR-013, FR-014, FR-016 a FR-018)
- [X] T021 [US2] Añadir el buscador en `app/_components/inicio/Coleccion.tsx`: se muestra cuando `useSearchParams().get("buscar") === "1"`, con la fila de la referencia (ícono `search`, input con `autoFocus`, botón cerrar que limpia el texto y quita `buscar` de la URL con `router.replace`); filtra por nombre sin distinguir mayúsculas ni tildes (`normalize("NFD")`) combinado con la pestaña (FR-015, research.md #11)
- [X] T022 [US2] Crear en `app/_components/inicio/AccionesEncabezado.tsx` el botón de lupa (ícono `search`, `aria-label` `inicio.nav.buscar`) que hace `router.push("/{locale}?buscar=1#colecciones")`, en el hueco `extra`
- [X] T023 [US2] Renderizar `<Coleccion>` después de `<Beneficios>` en `app/[locale]/(site)/page.tsx`, envuelto en `<Suspense>` (por `useSearchParams`), y añadir las claves `inicio.coleccion.*` y `inicio.nav.buscar` a ambos `messages/*.json`

**Checkpoint**: La colección muestra los modelos reales con el diseño de la referencia; pestañas, buscador y muestras funcionan.

---

## Phase 5: User Story 3 - El visitante arma un carrito y lo consulta por WhatsApp (Priority: P1)

**Goal**: Carrito lateral para productos fijos, conservado durante la visita, enviado por WhatsApp.

**Independent Test**: Añadir productos fijos, cambiar cantidades, navegar a `/es/catalogo` y volver, recargar, y enviar por WhatsApp (quickstart pasos 8–11).

### Tests for User Story 3

- [X] T024 [P] [US3] Crear `tests/carrito.test.ts` que pruebe `agregar` (línea nueva con cantidad 1; misma `clave` suma 1; mismo modelo con otro color crea otra línea), `cambiarCantidad` (+1, −1, y −1 con cantidad 1 elimina), `eliminar`, `totalUnidades`, y `mensajeCarrito` (encabezado con `siteName`, una línea `• 2 × Nombre` sin color y `• 1 × Nombre — Negro` con color)

### Implementation for User Story 3

- [X] T025 [P] [US3] Crear `lib/carrito/carrito.ts` con el tipo `LineaCarrito` de data-model.md, el reductor puro `reducirCarrito(lineas, accion)` con las acciones `agregar`, `cambiarCantidad`, `eliminar`, `vaciar`, `totalUnidades(lineas)` y `mensajeCarrito(encabezado: string, lineas)` según contracts §2
- [X] T026 [US3] Crear `app/_components/inicio/CarritoProvider.tsx` (cliente): Context con `lineas`, `abierto`, `abrir()`, `cerrar()`, `agregar(linea)` (que además abre el panel), `cambiarCantidad`, `eliminar`; al montar lee `sessionStorage["bf-carrito-v1"]` y tras cada cambio lo escribe, ambas en `try/catch` (JSON inválido o almacenamiento bloqueado → vacío en memoria); exportar `useCarrito()` (FR-021, research.md #5)
- [X] T027 [US3] Crear `app/_components/inicio/PanelCarrito.tsx` (cliente; props `numero: string | null`, `siteName`, `locale`, textos traducidos) copiando el `<aside role="dialog" aria-modal="true">` de la referencia: fondo `bg-deep/65` que cierra al pulsar, encabezado con eyebrow y "Mi carrito (n)", botón cerrar, estado vacío con botón "Ver colección" → `/{locale}#colecciones` que cierra el panel, líneas con foto, nombre, color (si hay), `precioPorConfirmar`, botones `remove`/`add`/`delete` con `aria-label`, y pie con `aviso` y botón rojo "Consultar pedido por WhatsApp" → `enlaceWhatsApp(numero, mensajeCarrito(...))`; si `numero` es `null` en lugar del botón muestra `sinWhatsapp`. Cierra con Escape (FR-019, FR-020, FR-022)
- [X] T028 [US3] Añadir en `app/_components/inicio/AccionesEncabezado.tsx` el botón del carrito (ícono `shopping_bag`, contador rojo `bg-primary text-on-primary` con `totalUnidades` si es mayor que 0, `aria-label` `inicio.nav.abrirCarrito` con el número) que llama `abrir()` de `useCarrito()`
- [X] T029 [US3] En `app/[locale]/(site)/layout.tsx` envolver encabezado, `<main>`, pie y botón flotante en `<CarritoProvider>` (dentro de `.tema-campo`) y renderizar `<PanelCarrito>` al final
- [X] T030 [US3] En `app/_components/inicio/Coleccion.tsx` conectar el botón "Añadir al carrito" de los productos fijos a `agregar({ modelId, nombre, imagenUrl, color: "" })`
- [X] T031 [US3] Añadir las claves `inicio.carrito.*` y `inicio.nav.abrirCarrito` a ambos `messages/*.json` y ejecutar `yarn test`

**Checkpoint**: Se pueden añadir productos fijos, ajustar el carrito, conservarlo al navegar y enviarlo por WhatsApp.

---

## Phase 6: User Story 4 - El visitante conoce la personalización, los pedidos por mayor y la comunidad (Priority: P2)

**Goal**: Secciones "Tu hierro. Tu gorra", pedidos por mayor y "Somos de campo".

**Independent Test**: Recorrer las tres secciones y pulsar sus botones (quickstart pasos 12–13, 19–20).

- [X] T032 [P] [US4] Crear `app/_components/inicio/VitrinaPersonaliza.tsx` (cliente; props `hrefPersonalizar: string`, textos traducidos) copiando la sección `#personaliza` de la referencia: vista previa `bg-preview` con la foto `/inicio/cap-*.jpg` del color elegido y etiquetas "Vista previa · color" y estilo; paso 01 con los 3 estilos y paso 02 con los 4 colores (`swatch-*`) como botones con `aria-pressed` que actualizan la vista previa; paso 03 con las tarjetas "Sube tu hierro" y "Diseño de la casa" solo informativas (sin acción) y el texto `enConfigurador`; un solo botón rojo "Personalizar mi gorra" → `hrefPersonalizar`. Sin subida de archivo ni "Añadir al carrito" (FR-023)
- [X] T033 [P] [US4] Crear `app/_components/inicio/PedidosMayor.tsx` (props `t`, `whatsapp: string | null`) copiando la sección `#mayor` de la referencia: fondo `bg-deep text-on-deep`, eyebrow dorado, `section-title` con "?" rojo, texto, bloque "12+" con borde dorado, botón rojo "Cotizar pedido para mi finca" → `enlaceWhatsApp(numero, t("inicio.mayor.mensaje"))` (oculto si no hay número), y foto `/inicio/ranch-team.jpg` con la etiqueta dorada "Orgullo que se lleva puesto" (FR-024)
- [X] T034 [P] [US4] Crear `app/_components/inicio/Comunidad.tsx` (props `t`, `youtubeUrl: string | null`) copiando la sección `#comunidad` de la referencia: encabezado, botón contorneado de YouTube → `youtubeUrl` en otra pestaña (oculto si es `null`), rejilla de 4 fotos `/inicio/community-*.jpg` con `alt` traducido, y lema "Hechos de la misma tierra. / Unidos por la misma pasión." con firma (FR-025)
- [X] T035 [US4] En `app/[locale]/(site)/page.tsx` renderizar, después de `<Coleccion>`, `<VitrinaPersonaliza hrefPersonalizar={hrefPersonalizableDestacado ?? "#colecciones"}>`, `<PedidosMayor>` y `<Comunidad>` (orden de FR-004), pasando `numeroWhatsApp(ajustes)` y la URL de YouTube; añadir las claves `inicio.personaliza.*`, `inicio.mayor.*`, `inicio.comunidad.*` a ambos `messages/*.json`

**Checkpoint**: La portada tiene todas las secciones de la referencia en su orden. Repetir el paso 2 de quickstart: "Personalizar con mi hierro" baja a "Tu hierro. Tu gorra" y "Ver colección oficial" baja a "Nuestra colección".

---

## Phase 7: User Story 5 - El resto del sitio público adopta la nueva paleta y navegación (Priority: P2)

**Goal**: Catálogo, producto, configurador, cuenta, solicitud y política de privacidad coherentes con la nueva identidad.

**Independent Test**: Recorrer las 7 páginas públicas en ES y EN y `/panel` + `/panel/login` (quickstart pasos 14–16).

- [X] T036 [P] [US5] En `lib/catalogo/precio.ts` cambiar `formatUsd` para que devuelva `US$ 120.00` (prefijo `US$ ` en vez de `$`, mismo separador de miles y 2 decimales) y actualizar su comentario; lo usan `app/_components/landing/TarjetaModeloCard.tsx` y `app/[locale]/(site)/producto/[modelId]/_components/ProductoApp.tsx`, que no necesitan cambios. Añadir `tests/precio.test.ts` con `"120"` → `"US$ 120.00"` y `"1500.5"` → `"US$ 1,500.50"` (FR-018, Principio II)
- [X] T037 [P] [US5] En `app/[locale]/(site)/producto/[modelId]/_components/*.tsx` reemplazar solo `bg-/text-/border-/ring-blue-*`, los hex `#003ec7`, `#0052ff`, `#0038b6` y la clase `electric-hover` por tokens (`bg-primary`, `text-primary`, `border-primary`, `text-on-primary`); conservar blanco, negro, grises y los rojos de error
- [X] T038 [P] [US5] Igual que T037 en `app/[locale]/(site)/configurador/[modelId]/_components/*.tsx`
- [X] T039 [P] [US5] Igual que T037 en `app/[locale]/(site)/solicitud/**/*.tsx` y `app/[locale]/(site)/cuenta/**/*.tsx`
- [X] T040 [US5] Aplicar al encabezado de `app/[locale]/(site)/catalogo/page.tsx` las clases `eyebrow` y `section-title` de la referencia para que coincida con la portada, sin cambiar sus textos ni su lógica (FR-002)

**Checkpoint**: Todas las páginas públicas comparten encabezado, pie y paleta; el panel no cambió.

---

## Phase 8: User Story 6 - El visitante usa la portada en el teléfono (Priority: P2)

**Goal**: Portada y encabezado correctos a 360 px y 768 px.

**Independent Test**: Portada a 360, 768 y 1440 px (quickstart paso 17).

- [X] T041 [US6] Recorrer la portada a 360 px y 768 px y corregir en los componentes de `app/_components/inicio/` cualquier desbordamiento horizontal (p. ej. pestañas de la colección con `overflow-x-auto`, textos largos con `break-words`), comparando cada breakpoint con la referencia
- [X] T042 [US6] Comprobar que el menú móvil de `app/_components/inicio/AccionesEncabezado.tsx` muestra selector de idioma y control de cuenta en pantallas menores a `xl` (donde el encabezado los oculta) y que el botón flotante de `BotonWhatsApp.tsx` no tapa el pie del panel del carrito (el panel usa `z-50`, por encima del botón `z-30`)
- [X] T043 [US6] Recorrer a 360 px `/{locale}/catalogo`, `/{locale}/producto/[id]`, `/{locale}/configurador/[id]`, `/{locale}/cuenta/ingresar`, `/{locale}/cuenta/registro`, `/{locale}/solicitud` y `/{locale}/politica-privacidad`, y corregir en `app/_components/inicio/EncabezadoSitio.tsx`, `FranjaAnuncio.tsx` o `PieSitio.tsx` cualquier desbordamiento horizontal que causen el encabezado o el pie nuevos (SC-005)

**Checkpoint**: Sin desplazamiento horizontal en teléfono y tablet en ninguna página pública; navegación completa en el menú móvil.

---

## Phase 9: Polish & Cross-Cutting Concerns

- [X] T044 [P] Revisar `aria-label` traducidos en todos los botones de solo ícono de `app/_components/inicio/` y que las imágenes tengan `alt` traducido; `loading="lazy"` en todas las fotos salvo el héroe (FR-029)
- [X] T045 Ejecutar `yarn lint`, `yarn typecheck` y `yarn test` y corregir los errores en los archivos de `app/_components/inicio/`, `lib/carrito/`, `lib/ajustes/whatsapp.ts` y `app/[locale]/(site)/`
- [ ] T046 Recorrer los 21 pasos de `specs/011-rediseno-paleta-inicio/quickstart.md` en ES y EN y anotar cualquier diferencia con la referencia

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sin dependencias.
- **Foundational (Phase 2)**: depende de T003 (tokens) para T006/T007.
- **US1 (Phase 3)**: depende de Foundational. Es la base de las demás historias (layout y `page.tsx`).
- **US2 (Phase 4)**: depende de US1 (T014 hueco `extra`, T016 `page.tsx`).
- **US3 (Phase 5)**: depende de US1; T030 depende de US2 (T020).
- **US4 (Phase 6)**: depende de US1; T035 usa `hrefPersonalizableDestacado` de T019 (US2).
- **US5 (Phase 7)**: depende de Foundational (T007); se puede hacer en paralelo con US1–US4.
- **US6 (Phase 8)**: depende de US1–US4.
- **Polish (Phase 9)**: al final.

### Within Each User Story

- Componentes nuevos [P] primero; luego la integración en `layout.tsx`/`page.tsx`; luego claves de traducción y pruebas.
- `app/[locale]/(site)/page.tsx`, `layout.tsx`, `AccionesEncabezado.tsx`, `Coleccion.tsx` y `messages/*.json` se editan en varias fases: esas tareas nunca van en paralelo entre sí.

### Parallel Opportunities

- T001, T002 en paralelo; T004, T005, T006 en paralelo.
- US1: T008–T012 en paralelo.
- US3: T024 y T025 en paralelo.
- US4: T032–T034 en paralelo.
- US5: T036–T039 en paralelo, y toda la fase en paralelo con US2–US4.

---

## Parallel Example: User Story 1

```text
T008 FranjaAnuncio.tsx
T009 Heroe.tsx
T010 Beneficios.tsx
T011 BotonWhatsApp.tsx
T012 PieSitio.tsx
→ luego T013, T014, T015, T016, T017, T018 en orden
```

## Parallel Example: User Story 4

```text
T032 VitrinaPersonaliza.tsx
T033 PedidosMayor.tsx
T034 Comunidad.tsx
→ luego T035
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1 + Phase 2 → todo el sitio público ya tiene la paleta nueva.
2. Phase 3 (US1) → portada con franja, encabezado, héroe, beneficios y pie.
3. **Parar y validar** con los pasos 1–4 de quickstart.md.

### Incremental Delivery

1. US1 → portada base.
2. US2 → colección real (la portada vuelve a enlazar al configurador y a los productos).
3. US3 → carrito.
4. US4 → secciones de marca: la portada queda completa como la referencia.
5. US5 y US6 → coherencia del resto del sitio y ajuste móvil.

Nota: entre US1 y US2 la portada no muestra modelos; conviene no desplegar a producción hasta
terminar al menos US2.
