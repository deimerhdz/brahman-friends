# Research: Rediseño del panel de administración

Ningún ítem de Technical Context quedó como NEEDS CLARIFICATION (la spec, su sesión de
`/speckit-clarify` y la exploración del código existente resolvieron todo lo necesario para
planificar). Este documento registra las decisiones técnicas no triviales tomadas para la Fase 1.

## 1. Cómo dejar de mostrar la barra pública (`NavBar`) dentro del panel

**Decision**: Mover el renderizado de `<NavBar/>` desde `app/[locale]/layout.tsx` (que hoy envuelve
*todo* el árbol de rutas, incluido `/panel/**`) a un nuevo grupo de rutas `app/[locale]/(site)/`
que agrupa únicamente las páginas públicas ya existentes (`page.tsx`, `cuenta/`, `configurador/`,
`politica-privacidad/`, `solicitud/`). El layout raíz de `[locale]` queda mínimo (`<SetHtmlLang/>` +
`{children}`, sin `NavBar` ni el `pt-20` que compensaba su altura fija). La página de login del panel
(`panel/login/`, fuera del grupo `(protected)`) recibe su propio `layout.tsx` nuevo que sí renderiza
`<NavBar/>` + el mismo `pt-20`, preservando exactamente su apariencia y comportamiento actuales
(FR-009, FR-012). El grupo `panel/(protected)/` no necesita ningún cambio para "excluirse": al dejar
de estar envuelto por `NavBar` en el layout raíz, simplemente nunca la recibe.

**Rationale**: Next.js anida los layouts jerárquicamente — un layout hijo no puede "quitar" lo que un
layout padre ya renderizó, así que la única forma de que el panel deje de heredar la `NavBar` es que
esta se monte más abajo en el árbol, no en la raíz. El proyecto ya resuelve exactamente este tipo de
problema ("esta rama de rutas necesita un layout distinto al resto, sin cambiar la URL") con un route
group: `panel/(protected)/` ya existe para separar la protección por sesión sin afectar la URL. Usar
el mismo mecanismo para separar la barra pública es la solución más simple y consistente con el
Principio I: una sola forma de resolver "esta parte del árbol de rutas se comporta distinto", en vez
de introducir una segunda (por ejemplo, leer el pathname en middleware o en el layout raíz).

**Alternatives considered**:
- Leer el pathname en `app/[locale]/layout.tsx` (vía un header inyectado por `middleware.ts`) y
  renderizar `<NavBar/>` condicionalmente → rechazado: obliga a tocar `middleware.ts` (hoy solo
  redirige `/` a un locale) para inyectar un header en *cada* request, agrega una fuente de verdad
  adicional (el pathname del header) al lado del árbol de layouts que Next.js ya provee para este
  problema exacto, y es más frágil ante cambios de versión de Next.js.
- Dejar `NavBar` donde está y hacer que `ControlCuenta`/`SelectorIdioma` se auto-oculten cuando
  detecten sesión de panel activa (en vez de sesión de cliente) → rechazado: mezclaría en un mismo
  componente dos conceptos de sesión que la constitution del feature 002 mantiene deliberadamente
  separados ("las dos cuentas nunca comparten cookie, tabla ni verificación"), y seguiría mostrando la
  `NavBar` completa (con su propio `ControlCuenta`) en vez de resolver la causa raíz de que el panel
  no debería depender en absoluto de ese componente público.

## 2. Tokens visuales que faltan para reproducir el mockup con fidelidad

**Decision**: Extender el bloque `@theme` de `app/globals.css` (ya usado por la página de inicio) con
los tokens `--radius-*` del `tailwind.config` del mockup (`DEFAULT: 0.125rem`, `lg: 0.25rem`,
`xl: 0.5rem`, `full: 0.75rem`), que hoy no existen en el proyecto (Tailwind v4 usa su escala de radio
por defecto, distinta a la del mockup). El resto de los tokens que usa `dashboard/code.html` (colores,
espaciado `margin-desktop`/`gutter`/`container-max`, tipografías `display-lg`/`headline-md`/
`label-caps`/`body-lg`/`body-md`/`button`) ya están definidos en `app/globals.css` porque
`dashboard/code.html` reutiliza literalmente la misma paleta "Atelier Precise" que
`landing-page/code.html` (feature 003).

**Rationale**: Sin estos tokens, clases como `rounded-lg` o `rounded-xl` copiadas del mockup se
verían con la escala de radio por defecto de Tailwind (más redondeada que el mockup), rompiendo la
fidelidad visual pedida en SC-001. Agregarlos al mismo bloque `@theme` ya existente es la extensión
más simple: mismo mecanismo, sin archivo de configuración nuevo.

**Alternatives considered**:
- Usar clases arbitrarias (`rounded-[0.25rem]`) en cada elemento → rechazado: repite el mismo valor
  mágico en decenas de lugares del panel en vez de una sola fuente de verdad, igual que se rechazó
  para la landing page en feature 003.

## 3. Íconos y fuentes del mockup

**Decision**: Ninguno nuevo. `app/layout.tsx` (layout raíz real, fuera de `[locale]`) ya carga
Material Symbols Outlined, Inter y JetBrains Mono vía `<link>` para *todo* el sitio, y
`app/globals.css` ya define `.material-symbols-outlined`. El panel puede usar
`<span className="material-symbols-outlined">dashboard</span>` etc. tal como lo hace el mockup, sin
ningún cambio en la carga de fuentes/íconos.

**Rationale**: Estas dependencias ya se resolvieron en feature 003 para toda la aplicación (no solo
para la landing); no hay nada que instalar ni configurar de nuevo (Principio I).

**Alternatives considered**: N/A — ya resuelto por trabajo previo, sin decisión nueva que tomar.

## 4. Patrón de navegación del panel por debajo de 1024px

**Decision**: Un componente cliente nuevo (`_MobilePanelNav.tsx`, con `useState` para abierto/cerrado)
que reemplaza la barra lateral fija por un botón de menú (ícono `menu`/`close`) y un panel desplegable
con las mismas secciones (Modelos, Colores, Técnicas, Solicitudes) y el botón de cerrar sesión,
activo entre 0 y 1023px de ancho (clarificación de la spec: mismo punto de quiebre que el mockup,
`hidden lg:flex`, no el `md:` de 768px que usa el resto del sitio).

**Rationale**: Mismo patrón que `MobileNavPanel.tsx` (sitio público, feature 003): un componente
cliente pequeño con estado local, sin librería de UI. Se ajusta el breakpoint a 1024px porque así lo
decidió explícitamente la clarificación de la spec para el panel (distinto del resto del sitio, que
usa 768px) — el layout `(protected)/layout.tsx` decide qué patrón mostrar con clases responsive
(`hidden lg:flex` para la barra fija, `lg:hidden` para el botón de menú), sin lógica de detección de
ancho en JavaScript.

**Alternatives considered**: Reutilizar `MobileNavPanel.tsx` del sitio público tal cual → rechazado:
ese componente está acoplado a las opciones del sitio público (inicio, idioma, cuenta) y a su propio
breakpoint (768px); adaptarlo requeriría tantas condiciones internas que sería más simple un
componente propio del panel con las secciones y el breakpoint que la spec pide.

## 5. Alcance de la excepción de idioma (FR-013) sobre el código ya traducido

**Decision**: El panel ya usa el sistema de traducciones para varios textos existentes (por ejemplo
`t("nav.models")`, `t("panel.modelos.new")`, `t("panel.modelos.status.published")` en
`messages/es.json` / `en.json`). FR-013 es un permiso ("MAY"), no una obligación: donde ya existe una
clave de traducción para un texto que se sigue mostrando, se reutiliza tal cual (no se rompe nada que
ya funciona). El texto nuevo que introduce este rediseño y que no tiene hoy equivalente en el mockup
de datos reales (por ejemplo el placeholder del buscador, el contador de paginación "Mostrando X de
Y", las etiquetas nuevas de la barra lateral) se escribe directamente en español en el JSX, sin
agregar claves nuevas a `messages/*.json`.

**Rationale**: Aplica el principio de menor esfuerzo compatible con la decisión ya tomada en la
clarificación: no hay que agregar trabajo de traducción nuevo (eso es lo que la excepción evita), pero
tampoco hay que borrar traducciones que ya existen y siguen siendo correctas — eso sería trabajo
innecesario que además podría romper otras pantallas que comparten esas mismas claves (p. ej.
`nav.models` no es exclusiva de esta feature).

**Alternatives considered**: Quitar todas las llamadas a `t()` del panel y reemplazarlas por texto
fijo → rechazado: contradice el Principio I (cambiar código que funciona sin necesidad) y el alcance
de FR-013, que solo exime de *agregar* traducciones nuevas, no exige eliminar las existentes.

## 6. Cómo extender el lenguaje visual a páginas sin captura exacta en el mockup

**Decision**: Definir dos piezas de layout reutilizables en `panel/(protected)/`: `_PanelNav.tsx`
(barra lateral / menú móvil) y `_PanelHeader.tsx` (encabezado de página: título + acción principal),
más las clases utilitarias ya usadas por el mockup (`ghost-border`, `ambient-shadow`,
`rounded-lg`/`rounded-xl` con los tokens del punto 2) para envolver listados y formularios. Cada
página protegida (Colores, Técnicas, Solicitudes y las subpáginas de Modelos) reutiliza estas mismas
piezas y clases en vez de definir su propia variante de tarjeta, tabla o insignia de estado.

**Rationale**: Es la forma más simple de cumplir FR-003 (mismo sistema visual en todas las páginas,
incluidas las que no tienen mockup) sin duplicar estilos por página ni inventar un sistema de
componentes nuevo — reutiliza exactamente lo que el mockup ya define para la única página que sí
muestra en detalle ("Base Models").

**Alternatives considered**: Rediseñar cada página de forma independiente, sin piezas compartidas →
rechazado: alto riesgo de inconsistencia visual entre páginas (contradice FR-003) y de duplicar la
misma clase de tarjeta/tabla varias veces.
