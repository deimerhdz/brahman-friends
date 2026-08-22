# Research: Migración de landing page de referencia a la página de inicio

Ningún ítem de Technical Context quedó como NEEDS CLARIFICATION (la spec y la exploración del
código existente resolvieron todo lo necesario para planificar). Este documento registra las
decisiones técnicas no triviales tomadas para la Fase 1.

## 1. Cómo replicar el tema visual del mockup (colores, tipografía, radios, espaciado) en Tailwind v4

**Decision**: Trasladar los tokens del `tailwind.config` (JS, usado por el mockup vía CDN) a un
bloque `@theme` en `app/globals.css`, que es como Tailwind v4 (ya instalado en el proyecto vía
`@tailwindcss/postcss`) define el tema en CSS-first: `--color-*` para la paleta, `--radius-*` para
`borderRadius`, `--spacing-*` para los espaciados nombrados (`margin-desktop`, `container-max`,
`gutter`, `section-gap`, `margin-mobile`), `--font-*` para las familias y `--text-*` (con
`--text-*--line-height`, `--text-*--letter-spacing`, `--text-*--font-weight`) para los tamaños
compuestos del mockup (p. ej. `display-lg`, `headline-md`, `label-caps`, `button`).

**Rationale**: El proyecto ya usa Tailwind v4 con configuración 100% en CSS (`app/globals.css`
importa `tailwindcss` y define `@theme` con `--color-brand`); no existe `tailwind.config.ts`. Añadir
un archivo de configuración JS solo para esta feature reintroduciría un mecanismo que el proyecto ya
abandonó, violando el Principio I (simplicidad: una sola forma de configurar el tema). Los nombres de
clase usados en el mockup (`text-primary`, `bg-surface`, `text-headline-md`, `rounded-xl`, etc.) siguen
funcionando igual una vez declarados como variables `@theme`, así que el marcado JSX puede copiar las
clases del mockup casi literalmente.

**Alternatives considered**:
- Reintroducir `tailwind.config.ts` solo para esta página → rechazado: Tailwind v4 prioriza CSS-first
  y mezclar los dos mecanismos en el mismo proyecto es más difícil de mantener y entender que uno
  solo.
- Usar clases arbitrarias de Tailwind (`bg-[#003ec7]`, `text-[64px]`) en cada elemento en vez de
  tokens con nombre → rechazado: duplica valores mágicos por todo el JSX en vez de una sola fuente de
  verdad, y se aleja de cómo el mockup fue diseñado (con nombres semánticos como `primary`,
  `on-surface`, `display-lg`).

## 2. Carga de fuentes (Inter, JetBrains Mono, Material Symbols Outlined)

**Decision**: Cargar las tres vía etiquetas `<link>` a Google Fonts en `app/layout.tsx` (el layout
raíz), igual que hace el mockup, en vez de `next/font/google`.

**Rationale**: El mockup necesita tres fuentes, una de las cuales es un ícono variable (Material
Symbols Outlined, con eje `FILL` y ligaduras de texto en vez de glifos con nombre de importación
está normal). `next/font/google` optimiza fuentes de texto estándar, pero mezclar `next/font` para
Inter/JetBrains Mono y un `<link>` manual solo para el ícono introduce dos mecanismos distintos para
resolver el mismo problema (Principio I). Usar `<link>` para las tres es la opción más simple, ya
probada por el propio mockup, y no agrega ninguna dependencia nueva.

**Alternatives considered**:
- `next/font/google` para Inter y JetBrains Mono + `<link>` solo para Material Symbols → rechazado
  por inconsistencia interna sin beneficio claro para una sola página.
- Autohospedar los archivos de fuente → rechazado: agrega mantenimiento de assets binarios sin
  necesidad, el proyecto no lo hace en ningún otro lado.

## 3. Íconos (flecha, check, ícono de rotación 360, etc.)

**Decision**: Usar la fuente de íconos "Material Symbols Outlined" tal como en el mockup (ligaduras
de texto, p. ej. `<span class="material-symbols-outlined">arrow_forward</span>`), sin librería de
íconos React.

**Rationale**: El proyecto no tiene ninguna librería de íconos instalada; agregar una (lucide-react,
heroicons, etc.) solo para esta página sería una dependencia nueva sin justificar (Principio I: toda
herramienta nueva debe justificarse por escrito, y "coincide con el mockup" no es un motivo suficiente
cuando la fuente de íconos ya cubre la necesidad sin costo adicional).

**Alternatives considered**: Instalar `lucide-react` (usa un símbolo similar en varios mockups
generados por IA) → rechazado por Principio I: no hay necesidad que la fuente de íconos ya cargada no
resuelva.

## 4. Patrón de navegación móvil

**Decision**: Componente cliente pequeño (`MobileNavPanel`, con `useState` para abierto/cerrado) que
muestra/oculta un panel debajo de la barra fija con las mismas opciones (inicio, selector de idioma,
control de cuenta), activado por un botón de menú (ícono `menu` / `close` de Material Symbols).

**Rationale**: Resuelve el edge case ya identificado en la spec ("¿Cómo se comporta la barra de
navegación en pantallas móviles donde no caben todos los enlaces?") sin agregar ninguna librería de UI
(no hay Radix/Headless UI en el proyecto). Es el mismo patrón que ya usa el proyecto para partes
interactivas simples (`SelectorIdioma` ya es un client component con `useState` implícito vía hooks de
navegación).

**Alternatives considered**: Menú siempre visible en una sola fila comprimida (iconos sin texto) →
rechazado: con tres opciones (inicio, selector de idioma con 2 botones, control de cuenta con 1-2
enlaces) no cabe de forma legible en ~360px sin recortar, y contradice a SC-003 (sin overflow ni
contenido cortado).

## 5. Origen de la imagen de portada por modelo en "The Collection"

**Decision**: Extender (o agregar junto a) `capModelConNombre()` en
`lib/catalogo/consultas-traducidas.ts` una consulta que además traiga `modelView.baseImageUrl` para
`view = 'front'` de cada modelo publicado (join opcional, ya que un modelo puede no tener esa vista
cargada aún). La página de inicio usa esa URL si existe; si es `null`, la tarjeta muestra un fondo
neutro (clase de Tailwind, sin imagen).

**Rationale**: Ya existe la tabla `modelView` con `baseImageUrl` por `(modelId, view)`
(`lib/db/schema.ts`), y el dominio de esas URLs (`*.public.blob.vercel-storage.com`) ya está
habilitado en `next.config.ts` para `next/image`. No hace falta ningún campo, tabla ni servicio
nuevo — es la resolución elegida en la clarificación de la spec (FR-009).

**Alternatives considered**: Reutilizar `loadModelManifest` (pensado para el configurador, trae
mucho más que la vista "front": componentes, colores, zonas de decoración) → rechazado por
Principio I: sería traer datos de sobra solo para mostrar una imagen de portada en una tarjeta.

## 6. Botones sin flujo funcional (Start Designing, Launch Configurator, Inquire for Wholesale)

**Decision**: Renderizarlos como `<button type="button" disabled={false}>` sin `onClick` ni `href`
funcional (o, si el mockup los marca visualmente como enlaces, un `<span>`/`<button>` con el mismo
estilo pero sin navegación), tal como quedó resuelto en la clarificación de la spec (FR-008).

**Rationale**: Implementación directa de la decisión ya tomada; no hay nada que investigar más allá
de qué elemento HTML preserva el estilo del mockup sin implicar navegación (evitar `<a href="#">`
para no generar un salto de scroll inesperado a la parte superior de la página).

**Alternatives considered**: N/A — decisión ya cerrada en la fase de clarificación.
