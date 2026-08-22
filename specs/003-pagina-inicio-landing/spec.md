# Feature Specification: Migración de landing page de referencia a la página de inicio

**Feature Branch**: `003-pagina-inicio-landing`

**Created**: 2026-08-22

**Status**: Draft

**Input**: User description: "usa de referancia el archivo @landing-page/code.html para implementar la pagina de inicio y migrarlos a next, has que se vea exactamente igual, manteniendo la opciones existentes del navbar y procurando que se adapte a cualquier dispositivo movil"

## Clarifications

### Session 2026-08-22

- Q: ¿A dónde debe llevar el botón "Start Designing" / "Launch Configurator" del héroe y del cierre
  de "The Process", ya que hoy no existe una ruta genérica del configurador sin elegir antes un
  modelo? → A: Dejar el botón sin acción funcional, solo visual como en el mockup.
- Q: ¿Qué imagen debe usarse como portada de cada tarjeta de modelo en "The Collection", dado que
  las fotos por modelo se guardan por vista (front/back/side) en `modelView` y no hay un campo de
  portada dedicado? → A: La vista "front"; si el modelo no la tiene cargada, se muestra un fondo
  neutro de marcador de posición en su lugar.
- Q: ¿De dónde debe salir la imagen grande del héroe, ya que no está atada a ningún modelo
  específico del catálogo? → A: Marcador de posición visual neutro (sin foto real) hasta que el
  equipo decida el asset definitivo.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Un visitante ve la nueva página de inicio con el diseño de referencia (Priority: P1)

Una persona entra al sitio y ve una página de inicio con la identidad visual, textos, secciones e
imágenes del diseño de referencia (héroe, catálogo de siluetas, servicios B2B, proceso de trabajo
y pie de página), en vez del listado simple de modelos que existe hoy.

**Why this priority**: Es el cambio central solicitado: la portada debe verse exactamente como el
diseño de referencia. Sin esto no hay entregable.

**Independent Test**: Se puede probar completamente abriendo la página de inicio en un navegador de
escritorio y comparando cada sección visualmente contra el archivo de referencia
(`landing-page/code.html`): tipografía, colores, espaciados, textos e imágenes deben coincidir.

**Acceptance Scenarios**:

1. **Given** un visitante entra a la página de inicio en un navegador de escritorio, **When** la
   página carga, **Then** ve las mismas secciones, en el mismo orden, con la misma jerarquía visual
   y los mismos textos que el diseño de referencia (héroe, "The Collection", "B2B Services & Bulk
   Orders", "The Process" y pie de página).
2. **Given** un visitante entra a la página de inicio, **When** compara colores, tipografías y
   espaciados contra el diseño de referencia, **Then** no percibe diferencias visuales relevantes.

---

### User Story 2 - El visitante conserva acceso a las funciones actuales del sitio desde la barra de navegación (Priority: P1)

Una persona que ya usa el sitio (selector de idioma es/en, iniciar sesión o ver su cuenta, volver al
inicio) necesita seguir encontrando esas mismas opciones en la nueva barra de navegación, aunque el
diseño visual de la barra cambie para parecerse al de referencia.

**Why this priority**: El sitio ya depende de estas funciones (autenticación de clientes,
selección de idioma) en el resto de la aplicación. Perderlas al migrar el diseño rompería flujos
existentes, así que tiene la misma prioridad crítica que el rediseño visual.

**Independent Test**: Se puede probar completamente abriendo la nueva página de inicio y
verificando que, desde la barra de navegación, se puede cambiar el idioma del sitio y acceder al
control de cuenta (iniciar sesión / ver cuenta / cerrar sesión), igual que en la barra de
navegación actual.

**Acceptance Scenarios**:

1. **Given** un visitante ve la nueva barra de navegación, **When** usa el selector de idioma,
   **Then** el sitio cambia de idioma igual que lo hace hoy.
2. **Given** un visitante no ha iniciado sesión, **When** mira la barra de navegación, **Then**
   encuentra la opción para iniciar sesión / crear cuenta, igual que en la barra actual.
3. **Given** un cliente con sesión iniciada, **When** mira la barra de navegación, **Then** ve el
   control de cuenta que le permite acceder a su cuenta o cerrar sesión, igual que en la barra
   actual.
4. **Given** un visitante hace clic en el nombre/logo del sitio en la barra de navegación,
   **When** se completa la navegación, **Then** vuelve a la página de inicio.

---

### User Story 3 - El visitante ve la página adaptada correctamente en su dispositivo móvil (Priority: P2)

Una persona entra a la página de inicio desde un teléfono o una tablet y espera que todas las
secciones, imágenes y la barra de navegación se ajusten al ancho de su pantalla, sin desbordes
horizontales ni contenido cortado, y con los controles de navegación accesibles.

**Why this priority**: El diseño de referencia ya contempla un layout adaptable (clases
responsive), y el usuario lo pidió explícitamente ("procurando que se adapte a cualquier
dispositivo móvil"). Es de alta prioridad pero depende de que primero exista la página (US1).

**Independent Test**: Se puede probar completamente abriendo la página de inicio en anchos de
pantalla móviles y de tablet (por ejemplo 360px, 768px) y verificando que cada sección se reacomoda
sin overflow horizontal ni elementos superpuestos, y que las opciones de navegación siguen siendo
accesibles.

**Acceptance Scenarios**:

1. **Given** un visitante abre la página de inicio en un ancho de pantalla de teléfono (~360-414px),
   **When** recorre la página, **Then** todas las secciones se muestran en una sola columna legible,
   sin scroll horizontal.
2. **Given** un visitante abre la página de inicio en un ancho de pantalla de tablet (~768px),
   **When** recorre la página, **Then** el contenido usa el layout intermedio adecuado (por ejemplo,
   más columnas que en móvil cuando el diseño de referencia lo define así) sin overflow.
3. **Given** un visitante en móvil necesita usar el selector de idioma o el control de cuenta,
   **When** interactúa con la barra de navegación, **Then** puede hacerlo sin que los controles se
   corten o queden inaccesibles.

### Edge Cases

- ¿Qué ve el visitante en la sección de catálogo ("The Collection") si actualmente no hay modelos
  publicados? El listado dinámico de modelos publicados (comportamiento actual, ver FR-009) debe
  seguir funcionando; cuando no hay modelos publicados se muestra un estado vacío en vez de tarjetas
  de producto inventadas.
- ¿Qué pasa si una imagen de referencia (fotos de producto/hero) no está disponible o tarda en
  cargar? La sección debe reservar el espacio de la imagen (sin saltos de layout) y no romper el
  resto de la página.
- ¿Cómo se comporta la barra de navegación en pantallas móviles donde no caben todos los enlaces
  horizontalmente? Debe colapsar a un patrón de navegación móvil (por ejemplo menú desplegable)
  que siga exponiendo las mismas opciones (idioma, cuenta, inicio) sin cortarlas.
- ¿Qué ocurre con los enlaces de la barra y del pie de página que en el diseño de referencia son
  decorativos (`href="#"`, por ejemplo "Collections", "B2B Services", "Design Studio", "Support",
  "Track Order")? Ver FR-003 y Assumptions: se conservan visualmente pero no deben reemplazar ni
  ocultar las opciones funcionales existentes del sitio.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: La página de inicio del sitio (`/{locale}`) MUST mostrar todas las secciones visibles
  en el diseño de referencia (`landing-page/code.html`): barra de navegación, sección de héroe,
  "The Collection", "B2B Services & Bulk Orders", "The Process" y pie de página.
- **FR-002**: El diseño visual (colores, tipografías, espaciados, jerarquía y disposición de cada
  sección) MUST reproducir fielmente el del archivo de referencia, en escritorio.
- **FR-003**: La barra de navegación MUST conservar las opciones funcionales que existen hoy en el
  sitio: enlace al inicio con el nombre del sitio, selector de idioma (es/en) y control de cuenta
  (iniciar sesión / cuenta / cerrar sesión). Estas opciones reemplazan a los enlaces de marcador de
  posición del diseño de referencia (p. ej. "Collections", "B2B Services", "Design Studio",
  "Account", ícono de carrito), que no corresponden a funciones existentes del sitio.
- **FR-004**: Los textos del diseño de referencia que forman parte de la barra de navegación y el
  pie de página y que sí tienen equivalente en el sitio actual (nombre del sitio, selector de
  idioma) MUST usar el sistema de traducciones existente (es/en) en vez de texto fijo en inglés.
- **FR-005**: El resto de textos del diseño de referencia (contenido de marketing: héroe, secciones
  de colección, B2B, proceso y pie de página) MUST mostrarse en ambos idiomas del sitio (es/en),
  siguiendo el mecanismo de traducción ya usado en el proyecto.
- **FR-006**: La página de inicio MUST adaptarse a anchos de pantalla móviles y de tablet sin
  overflow horizontal, reorganizando el layout tal como lo define el diseño de referencia (que ya
  incluye reglas responsive) para cada punto de quiebre.
- **FR-007**: En anchos de pantalla móviles donde la barra de navegación horizontal completa no cabe,
  el sitio MUST ofrecer un patrón de navegación adaptado a móvil que siga exponiendo las mismas
  opciones funcionales (FR-003) sin ocultarlas de forma permanente.
- **FR-008**: Los botones "Start Designing" (héroe) y "Launch Configurator" (cierre de "The
  Process") MUST mostrarse visualmente igual que en el diseño de referencia, sin comportamiento de
  navegación funcional, ya que el sitio no tiene hoy una ruta genérica del configurador que no
  requiera elegir antes un modelo publicado. El botón "Inquire for Wholesale" (sección B2B) MUST
  mostrarse igual, también sin navegación funcional, ya que el sitio no tiene un flujo de contacto
  B2B existente. El enlace "Explore All" de la sección "The Collection" MUST desplazar al visitante
  a esa misma sección dentro de la página.
- **FR-009**: La sección de catálogo ("The Collection") MUST seguir mostrando los modelos
  actualmente publicados del catálogo (comportamiento ya existente en la portada), adaptados a la
  presentación visual de tarjetas de producto del diseño de referencia, en vez de las tres siluetas
  fijas de ejemplo (Snapback, Trucker, Dad Hat) del archivo de referencia. Cada tarjeta MUST usar la
  vista "front" del modelo como imagen de portada; si el modelo publicado no tiene esa vista
  cargada, la tarjeta MUST mostrar un fondo neutro de marcador de posición en vez de la foto.
- **FR-010**: Cuando no haya modelos publicados, la sección de catálogo MUST mostrar un estado vacío
  legible en vez de tarjetas de producto inventadas o vacías.
- **FR-011**: Las imágenes decorativas y de producto del diseño de referencia MUST incluir texto
  alternativo descriptivo para accesibilidad.
- **FR-012**: La página MUST seguir siendo accesible en los dos idiomas soportados por el sitio
  (es/en) a través de las rutas por locale ya existentes (`/es`, `/en`).
- **FR-013**: La imagen grande de la sección de héroe MUST mostrarse como un bloque de marcador de
  posición visual neutro (mismo tamaño y posición que en el diseño de referencia), sin una
  fotografía real de producto, hasta que el equipo de contenido provea el asset definitivo.

### Key Entities

- **Modelo de gorra publicado**: entidad ya existente en el catálogo (ver `capModel`), usada para
  poblar la sección "The Collection" con nombre, descripción y enlace al configurador; no se agrega
  ni modifica su estructura de datos.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Al comparar la página de inicio migrada con el diseño de referencia en una pantalla
  de escritorio estándar (≥1280px de ancho), un observador no identifica diferencias visuales
  perceptibles en ninguna de las cinco secciones (barra de navegación, héroe, colección, B2B,
  proceso, pie de página) más allá de los cambios funcionales descritos en FR-003, FR-009 y
  FR-013.
- **SC-002**: El 100% de las opciones de navegación disponibles hoy (inicio, selector de idioma,
  control de cuenta) siguen siendo accesibles y funcionan igual desde la nueva página de inicio, en
  escritorio y en móvil.
- **SC-003**: La página de inicio no presenta desbordamiento horizontal ni contenido cortado en
  ningún ancho de pantalla entre 360px y 1920px.
- **SC-004**: Todo el texto de marketing visible en la página de inicio se muestra correctamente
  traducido tanto en español como en inglés, sin textos fijos en un solo idioma fuera de nombres
  propios de marca.

## Assumptions

- El archivo `landing-page/code.html` es un mockup estático de referencia visual (usa Tailwind vía
  CDN y datos/enlaces de ejemplo); no se migra su forma de cargar estilos ni sus enlaces
  ("#", URLs de imágenes de placeholder) tal cual, sino su apariencia final dentro de la stack Next.js
  ya usada por el proyecto.
- "Manteniendo las opciones existentes del navbar" se interpreta como: conservar las funciones que
  hoy tiene la barra de navegación del sitio (inicio, selector de idioma, control de cuenta),
  aplicándoles el nuevo estilo visual del diseño de referencia, en vez de conservar literalmente los
  enlaces de ejemplo del archivo de referencia (Collections, B2B Services, Design Studio, Account,
  carrito).
- Las URLs de imágenes del archivo de referencia (que apuntan a un servicio de terceros ajeno al
  proyecto) no se migran tal cual. La imagen de héroe se resuelve como marcador de posición neutro
  (FR-013) y las imágenes de las tarjetas de "The Collection" salen de las fotos ya cargadas por
  modelo (vista "front", FR-009).
- El scroll/parallax, rotación 3D "drag to rotate" y demás detalles puramente decorativos del mockup
  se implementan como estados visuales estáticos equivalentes si no hay una interacción 3D real
  detrás; no se asume que deban implementarse como una función 3D interactiva real salvo que ya
  exista en el proyecto (configurador).
- Los breakpoints responsive a replicar son los ya usados por el diseño de referencia (móvil por
  defecto, escritorio desde ~768px), sin requisitos adicionales de dispositivos específicos.
