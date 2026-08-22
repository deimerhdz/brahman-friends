# Feature Specification: Rediseño del panel de administración

**Feature Branch**: `004-rediseno-panel-admin`

**Created**: 2026-08-22

**Status**: Draft

**Input**: User description: "necesito que tomes @dashboard/code.html como diseño de referencia para actualizar el diseño actual del panel de administracion, los componentes deben ser responsive y cuando un usuario inicie sesion no se le debe volver a mostrar los enlaces de ingresar y registrarme ni el cambio de idioma"

## Clarifications

### Session 2026-08-22

- Q: ¿La página de inicio de sesión del panel (`/panel/login`) también debe adoptar el nuevo
  estilo visual del diseño de referencia, o se queda con su apariencia actual? → A: Se queda con
  su apariencia actual; el rediseño se limita estrictamente a las páginas protegidas por sesión.
- Q: Al ocultar el selector de idioma dentro del panel autenticado, ¿el contenido del panel debe
  seguir existiendo en ambos idiomas (es/en), o puede quedar fijo en un solo idioma para el
  administrador? → A: El panel deja de necesitar soporte bilingüe para administradores
  autenticados: los textos propios de la interfaz del panel (no el contenido del catálogo) se
  fijan en un solo idioma sin pasar por el sistema de traducciones. Esto es una excepción
  explícita al Principio II ("Idioma y mercado") de la constitución del proyecto, aceptada y
  documentada a propósito para esta funcionalidad (ver Assumptions); la constitución no se
  modifica en este momento.
- Q: En pantallas de tablet (~768px a 1023px), ¿la barra lateral del panel debe verse fija como en
  escritorio, o debe comportarse como en móvil (menú colapsado)? → A: Igual que el diseño de
  referencia: la barra lateral fija solo aparece en escritorio (≥1024px); en tablet (768-1023px)
  se usa el menú móvil colapsado.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Un administrador ve el panel con el nuevo diseño visual de referencia (Priority: P1)

Un administrador que ya inició sesión en el panel entra a cualquiera de sus secciones (Modelos,
Colores, Técnicas, Solicitudes) y ve una interfaz con la identidad visual del diseño de referencia:
barra lateral con marca e iconos, encabezado de página con título y acciones principales, y el
contenido presentado en tablas/tarjetas con bordes suaves, sombra e insignias de estado, en vez del
diseño simple que existe hoy.

**Why this priority**: Es el cambio central solicitado: "actualizar el diseño actual del panel de
administración". Sin esto no hay entregable.

**Independent Test**: Se puede probar completamente iniciando sesión en el panel, abriendo
cualquier página protegida en un navegador de escritorio y comparando el lenguaje visual (barra
lateral, encabezado, tablas/tarjetas, tipografía, color) contra el diseño de referencia
(`dashboard/code.html`).

**Acceptance Scenarios**:

1. **Given** un administrador autenticado entra a la página de listado de Modelos en escritorio,
   **When** la página carga, **Then** ve una barra lateral fija con marca, iconos y sección de
   perfil, un encabezado de página con título/buscador/acción principal, y el listado presentado
   con el estilo visual del diseño de referencia (bordes suaves, sombra ambiental, insignias de
   estado).
2. **Given** un administrador autenticado navega a otras secciones existentes del panel (Colores,
   Técnicas, Solicitudes), **When** cada página carga, **Then** el mismo lenguaje visual (barra
   lateral, encabezado, tipografía, paleta de color) se aplica de forma consistente, aunque el
   contenido de cada página sea distinto al mockup de catálogo.
3. **Given** un administrador ve la barra lateral, **When** mira los enlaces de navegación,
   **Then** encuentra las secciones reales que existen hoy en el panel (Modelos, Colores, Técnicas,
   Solicitudes), con la sección activa resaltada, en vez de los enlaces de ejemplo del mockup
   (Dashboard, Catalog, Orders, Settings) que no corresponden a funciones reales.

---

### User Story 2 - El panel se adapta a cualquier tamaño de pantalla (Priority: P1)

Un administrador entra al panel desde un teléfono o una tablet y espera que la barra lateral, los
encabezados y las tablas/tarjetas se ajusten al ancho de su pantalla, sin desbordes horizontales ni
controles inaccesibles.

**Why this priority**: Fue pedido explícitamente ("los componentes deben ser responsive"); sin
esto el rediseño no sería utilizable en los dispositivos que el equipo use fuera de escritorio.

**Independent Test**: Se puede probar completamente abriendo cualquier página del panel en anchos
de pantalla móviles y de tablet (por ejemplo 360px, 768px) y verificando que cada componente se
reacomoda sin overflow horizontal ni elementos cortados o superpuestos, y que todas las acciones
siguen siendo accesibles.

**Acceptance Scenarios**:

1. **Given** un administrador abre el panel en un ancho de pantalla de teléfono (~360-414px),
   **When** recorre cualquier página, **Then** la barra lateral no ocupa espacio fijo permanente
   sino que colapsa a un patrón de navegación móvil accesible, y el contenido principal se muestra
   en una sola columna legible sin scroll horizontal de la página completa.
2. **Given** un administrador abre el panel en un ancho de pantalla de tablet (768-1023px),
   **When** recorre cualquier página, **Then** la barra lateral se comporta igual que en móvil
   (menú colapsado, no fija) y el contenido usa un layout intermedio adecuado (por ejemplo, tablas
   con su propio scroll horizontal contenido, o tarjetas apiladas) sin overflow horizontal de la
   página completa.
3. **Given** un administrador en móvil o tablet necesita realizar una acción habitual (crear,
   editar, buscar, paginar), **When** interactúa con los controles, **Then** puede hacerlo sin que
   los botones o campos se corten o queden inaccesibles.

---

### User Story 3 - Un administrador con sesión iniciada ya no ve enlaces de ingresar/registrarme ni el selector de idioma dentro del panel (Priority: P2)

Hoy, al entrar autenticado a cualquier página del panel, un administrador sigue viendo los enlaces
"Ingresar" y "Registrarme" y el selector de idioma pensados para un visitante de la tienda pública,
porque esos controles no consideran la sesión del panel. Una vez iniciada la sesión del panel, esos
elementos ya no deben aparecer en ninguna página del panel.

**Why this priority**: Fue pedido explícitamente por el usuario y corrige una experiencia
confusa (un administrador ya autenticado viendo invitaciones a iniciar sesión/registrarse que no le
aplican). Es una corrección más acotada que el rediseño visual completo, por lo que puede probarse
y entregarse de forma independiente.

**Independent Test**: Se puede probar completamente iniciando sesión en el panel con credenciales
válidas, recorriendo cada página protegida y verificando que en ningún lugar de la página aparecen
los enlaces "Ingresar"/"Registrarme" ni el selector de idioma.

**Acceptance Scenarios**:

1. **Given** un administrador ha iniciado sesión en el panel, **When** navega a cualquier página
   protegida del panel (Modelos, Colores, Técnicas, Solicitudes y sus subpáginas), **Then** no ve
   en ningún lugar de la página los enlaces "Ingresar" o "Registrarme".
2. **Given** un administrador ha iniciado sesión en el panel, **When** navega a cualquier página
   protegida del panel, **Then** no ve el selector de idioma en ninguna parte de la página.
3. **Given** un administrador todavía no ha iniciado sesión y visita la página de inicio de sesión
   del panel, **When** la página carga, **Then** el comportamiento de esa pantalla no se ve
   afectado por esta funcionalidad: sigue siendo el punto de entrada para autenticarse.

### Edge Cases

- ¿Qué pasa si el mismo navegador tiene, además de la sesión del panel, una sesión de cliente
  activa en paralelo (por ejemplo alguien que compró como cliente y también administra el
  catálogo)? La sesión de cliente no debe influir en lo que se muestra dentro del panel: mientras
  haya una sesión de panel activa, los enlaces de ingresar/registrarme y el selector de idioma
  permanecen ocultos, sin importar si existe una sesión de cliente en paralelo.
- ¿Qué ocurre si la sesión del panel expira mientras el administrador navega? Debe redirigir al
  login del panel (comportamiento ya existente), sin quedar en un estado intermedio donde estos
  elementos se muestren u oculten de forma inconsistente.
- ¿Cómo se ve la barra lateral o el menú móvil en anchos de pantalla muy angostos (~320px)? Debe
  seguir siendo utilizable sin cortar texto ni iconos.
- Páginas del panel que hoy no tienen una captura exacta en el diseño de referencia (formularios de
  colores y técnicas, detalle de una solicitud, subpáginas de un modelo) deben adoptar el mismo
  lenguaje visual (tipografía, color, tarjetas, botones) aunque no exista un mockup específico para
  ellas.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Todas las páginas del panel de administración protegidas por sesión MUST adoptar el
  lenguaje visual del diseño de referencia (`dashboard/code.html`): barra de navegación lateral con
  marca e iconos, encabezado de página con título/contexto y acciones principales, tablas/tarjetas
  de contenido con bordes suaves, sombra e insignias de estado, y la tipografía/paleta de color
  definidas en ese archivo.
- **FR-002**: La barra de navegación lateral del panel MUST reflejar las secciones reales que
  existen hoy (Modelos, Colores, Técnicas, Solicitudes), no los enlaces de ejemplo del archivo de
  referencia (Dashboard, Catalog, Orders, Settings), y MUST resaltar visualmente la sección en la
  que se encuentra el administrador.
- **FR-003**: Todas las páginas protegidas del panel (listados, formularios y vistas de detalle de
  Modelos, Colores, Técnicas y Solicitudes) MUST aplicar el mismo sistema visual de forma
  consistente, incluso en las páginas para las que el archivo de referencia no incluye una captura
  específica.
- **FR-004**: El panel de administración MUST adaptarse sin desbordamiento horizontal ni elementos
  cortados o superpuestos a anchos de pantalla de teléfono, tablet y escritorio.
- **FR-005**: Por debajo de 1024px de ancho (móvil y tablet), el panel MUST ofrecer un patrón de
  navegación adaptado (por ejemplo, menú desplegable) que exponga las mismas secciones sin
  ocultarlas de forma permanente, en vez de la barra lateral fija; la barra lateral fija MUST
  mostrarse solo en anchos de escritorio (≥1024px), igual que en el diseño de referencia.
- **FR-006**: Mientras un administrador tenga una sesión de panel activa, el sitio MUST NOT mostrar
  en ninguna página del panel los enlaces "Ingresar" ni "Registrarme".
- **FR-007**: Mientras un administrador tenga una sesión de panel activa, el sitio MUST NOT mostrar
  el selector de idioma en ninguna página del panel.
- **FR-008**: La sesión de cliente de la tienda pública MUST NOT determinar lo que se muestra
  dentro del panel; el comportamiento descrito en FR-006 y FR-007 depende únicamente de si existe
  una sesión de panel activa.
- **FR-009**: La página de inicio de sesión del panel (no protegida por sesión) queda fuera del
  alcance de FR-006 y FR-007: su comportamiento actual no cambia por esta funcionalidad.
- **FR-010**: Las acciones y datos que ya existen en cada página del panel (crear/editar modelo,
  gestionar colores y técnicas, ver y actualizar el estado de solicitudes, etc.) MUST seguir
  funcionando igual que hoy; el cambio es exclusivamente visual y de adaptación a pantalla, sin
  agregar, quitar ni modificar funcionalidades de negocio existentes.
- **FR-011**: Los iconos y elementos gráficos del panel que transmitan información (por ejemplo,
  iconos de acción en una tabla) MUST incluir texto alternativo o etiqueta accesible.
- **FR-012**: La página de inicio de sesión del panel (no protegida por sesión) MUST mantener su
  apariencia visual actual; el alcance del rediseño visual (FR-001 a FR-003) se limita
  estrictamente a las páginas protegidas por sesión.
- **FR-013**: Los textos propios de la interfaz del panel (etiquetas de navegación, encabezados de
  página, botones y mensajes de la barra lateral/encabezado) MAY fijarse en un único idioma
  (español, el ya usado hoy en el panel) sin pasar por el sistema de traducciones del sitio. Esta
  excepción aplica solo a la interfaz propia del panel y NOT a los datos de catálogo (nombres,
  descripciones u otros campos traducibles de modelos, colores o técnicas) que el panel permite
  administrar, los cuales siguen rigiéndose por las reglas de traducción existentes del proyecto.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Al comparar cualquier página protegida del panel con el diseño de referencia en una
  pantalla de escritorio estándar (≥1280px), un observador no identifica diferencias visuales
  relevantes en el lenguaje de diseño (barra lateral, encabezado, tablas/tarjetas, tipografía,
  color), más allá de los cambios de contenido y navegación descritos en FR-002 y FR-003.
- **SC-002**: El panel no presenta desbordamiento horizontal ni contenido cortado en ningún ancho
  de pantalla entre 360px y 1920px, en ninguna de sus páginas protegidas.
- **SC-003**: El 100% de las páginas protegidas del panel deja de mostrar los enlaces
  "Ingresar"/"Registrarme" y el selector de idioma mientras la sesión de panel esté activa.
- **SC-004**: Un administrador puede completar sus tareas habituales (revisar el catálogo,
  actualizar el estado de una solicitud, editar un color o una técnica) desde un dispositivo móvil
  o tablet sin que ningún control quede inaccesible o cortado.
- **SC-005**: La interfaz propia del panel (navegación, encabezados, botones) se muestra en
  español de forma consistente en todas las páginas protegidas, sin depender de la ruta de idioma
  visitada, mientras que los campos de catálogo traducibles que el panel administra y el resto del
  sitio público siguen funcionando en ambos idiomas sin cambios.

## Assumptions

- `dashboard/code.html` es un mockup estático de referencia visual (usa Tailwind vía CDN y
  datos/iconos de ejemplo); no se migra tal cual su forma de cargar estilos, sino su apariencia
  (paleta, tipografía, tokens de espaciado y radio) reutilizando el sistema de diseño que ya existe
  en el proyecto.
- Los enlaces y datos del mockup que no corresponden a funciones reales del panel (secciones
  "Dashboard"/"Catalog"/"Settings", botón "New Design", perfil "Premium Member / Verified
  Collector") se adaptan a las secciones y datos reales del panel (Modelos, Colores, Técnicas,
  Solicitudes, nombre del administrador autenticado) en vez de copiarse de forma literal.
- El archivo de referencia solo muestra en detalle la página de listado de modelos ("Base Models");
  el mismo lenguaje visual (tarjetas, tablas, insignias, botones, espaciados) se extiende de forma
  consistente al resto de páginas del panel (Colores, Técnicas, Solicitudes y sus
  formularios/vistas de detalle) aunque no tengan una captura de referencia exacta.
- "Cuando un usuario inicie sesión" se interpreta específicamente como la sesión del panel de
  administración, no la sesión de cliente de la tienda pública; esta última sigue comportándose
  igual que hoy fuera del panel.
- **Excepción constitucional documentada (FR-013)**: el Principio II de la constitución
  ("Idioma y mercado") exige que todo texto visible exista en inglés y español, tanto para el
  cliente como para el equipo interno, y que ningún texto visible se escriba fijo en el código.
  Para esta funcionalidad se acepta a propósito una excepción: los textos propios de la interfaz
  del panel administrativo (no los datos de catálogo que el panel gestiona) pueden fijarse en un
  solo idioma sin sistema de traducciones, ya que el panel es de uso exclusivo del equipo interno
  en español. Esta excepción queda registrada aquí como decisión consciente; no modifica la
  constitución del proyecto, que sigue aplicando sin cambios al resto del sitio (incluidos los
  campos traducibles de catálogo que el panel administra) y a cualquier funcionalidad futura.
- El punto de quiebre entre el menú móvil colapsado y la barra lateral fija de escritorio es
  1024px, igual que en el diseño de referencia (`hidden lg:flex`); por debajo de ese ancho (móvil y
  tablet) se usa el mismo patrón de navegación colapsado. El resto de ajustes responsive dentro de
  cada rango (por ejemplo, cuántas columnas usa una tabla en tablet vs. móvil) sigue la convención
  mobile-first ya empleada en el resto del proyecto.
