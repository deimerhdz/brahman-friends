# Feature Specification: Nueva paleta de colores y rediseño de la página de inicio (Brahman Threads)

**Feature Branch**: `011-rediseno-paleta-inicio`

**Created**: 2026-09-30

**Status**: Draft

**Input**: User description: "quiero actualizar la palete de colores y el diseño para pagina de inicio usando exactamente el diseño que aparece en el directorio ../brahman-threads si tienes dudas me preguntas"

## Clarifications

### Session 2026-09-30

- Q: La referencia incluye carrito ("Añadir al carrito", contador y panel lateral), pero la
  constitution 2.0.0 excluye el carrito de la versión 1. ¿Qué se hace con esas piezas? → A:
  Incluir el carrito tal como en la referencia. Esto exige enmendar la constitution antes de
  planificar (ver Dependencias).
- Q: La sección "Tu hierro. Tu gorra" de la referencia es un mini‑personalizador, y el sitio ya
  tiene un configurador real por modelo. ¿Cómo se resuelve? → A: Se muestra con la misma
  apariencia (vista previa + pasos 01, 02, 03) como vitrina; su botón principal lleva al
  configurador real de un modelo personalizable. No duplica el configurador.
- Q: ¿Hasta dónde aplica la nueva paleta y tipografía? → A: A todo el sitio público (portada
  rediseñada completa; barra de navegación, pie de página y colores base también en catálogo,
  producto, configurador, cuenta y solicitud). El panel administrador no cambia.
- Q: Los productos fijos muestran hoy el precio como "$120.00" (USD); para un cliente colombiano
  "$" parece pesos. ¿Cómo se muestra? → A: "US$ 120.00", en todo el sitio (Principio II: moneda
  clara).

## Diseño de referencia

La fuente de verdad visual es el proyecto `../brahman-threads` (página `src/routes/index.tsx` y
hoja de estilos `src/styles.css`). Resumen de lo que define:

- **Paleta**: azul marino profundo (encabezados, franjas, pie de página y banners), rojo intenso
  reservado para acciones principales y acentos, crema/blanco hueso como fondo general, arena
  suave para superficies secundarias, dorado para detalles y títulos del pie de página, verde
  WhatsApp para el botón flotante de contacto, gris piedra/azul oscuro para textos.
- **Tipografía**: títulos en letra condensada, gruesa y en mayúsculas; textos en una sans limpia;
  la palabra "friends." del logotipo en estilo manuscrito rojo, ligeramente inclinada.
- **Secciones, en orden**: franja de anuncios → encabezado fijo → héroe con foto de campo →
  franja de beneficios → "Nuestra colección" → "Tu hierro. Tu gorra" → pedidos por mayor →
  "Somos de campo" (comunidad) → pie de página → botón flotante de WhatsApp → panel lateral del
  carrito.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - El visitante ve la portada con el diseño de Brahman Threads (Priority: P1)

Una persona entra a la página de inicio y ve la nueva identidad: franja superior azul marino con
el anuncio de envíos y bordado 3D, encabezado con el logotipo "BRAHMAN friends.", héroe a pantalla
ancha con foto de campo y el titular "La gorra oficial de la pasión ganadera", franja de cuatro
beneficios, colección, sección de personalización, bloque de pedidos por mayor, sección de
comunidad y pie de página azul marino, todo con los colores, tipografías, espaciados y textos de
la referencia.

**Why this priority**: Es el pedido central: la portada debe verse exactamente como la referencia.

**Independent Test**: Abrir la portada del sitio y la referencia lado a lado en escritorio (1440
px) y recorrer sección por sección comparando orden, colores, tipografía, textos e imágenes.

**Acceptance Scenarios**:

1. **Given** un visitante abre la portada en escritorio, **When** la página carga, **Then** ve las
   secciones en el mismo orden que la referencia y cada una con la misma jerarquía visual,
   colores y textos.
2. **Given** el visitante está en el héroe, **When** pulsa "Personalizar con mi hierro", **Then**
   la página baja a la sección "Tu hierro. Tu gorra"; **When** pulsa "Ver colección oficial",
   **Then** baja a "Nuestra colección".
3. **Given** el visitante cambia el idioma a inglés, **When** la portada se recarga, **Then** todos
   los textos de la nueva portada aparecen en inglés, sin textos a medias en español.
4. **Given** la persona administradora configuró un banner en Ajustes, **When** se carga la
   portada, **Then** el héroe usa ese banner como foto de fondo; si no hay banner configurado, usa
   la foto de campo de la referencia.

---

### User Story 2 - El visitante explora la colección real y la filtra (Priority: P1)

En "Nuestra colección" el visitante ve las tarjetas con el estilo de la referencia (foto grande,
etiqueta en la esquina, nombre en mayúsculas condensadas, línea descriptiva, muestras de color y
botón rojo), pero con los modelos que el equipo publicó en el panel. Puede filtrar con pestañas y
buscar desde el icono de lupa del encabezado.

**Why this priority**: La colección es la puerta al configurador y a los productos fijos; si
muestra datos inventados o deja de enlazar a los modelos reales, el sitio pierde su función.

**Independent Test**: Con al menos un modelo personalizable y un producto fijo publicados, abrir la
portada, comprobar que ambos aparecen con el nuevo diseño, usar cada pestaña y la búsqueda, y
pulsar el botón de cada tarjeta.

**Acceptance Scenarios**:

1. **Given** hay modelos publicados, **When** el visitante llega a "Nuestra colección", **Then** ve
   una tarjeta por cada modelo publicado, con la foto de portada del modelo, y ningún producto
   de ejemplo de la referencia.
2. **Given** el visitante pulsa la pestaña "Personalizables" o "Productos listos", **When** se
   aplica el filtro, **Then** solo quedan las tarjetas de ese tipo; "Todos" las muestra todas.
3. **Given** el visitante pulsa la lupa del encabezado, **When** escribe parte del nombre de un
   modelo, **Then** la colección se desplaza a la vista y solo muestra los modelos que coinciden;
   si ninguno coincide, ve el mensaje "No encontramos gorras con esa búsqueda".
4. **Given** una tarjeta de un modelo personalizable, **When** el visitante pulsa su botón
   principal ("Personalizar"), **Then** llega al configurador de ese modelo.
5. **Given** una tarjeta de un producto fijo, **When** el visitante pulsa "Añadir al carrito",
   **Then** el producto entra al carrito y se abre el panel lateral del carrito.
6. **Given** no hay ningún modelo publicado, **When** el visitante llega a la colección, **Then** ve
   un mensaje de colección vacía en lugar de tarjetas.

---

### User Story 3 - El visitante arma un carrito y lo consulta por WhatsApp (Priority: P1)

El visitante agrega uno o varios productos fijos al carrito, ajusta cantidades o elimina líneas
desde el panel lateral, y envía el pedido por WhatsApp con un mensaje ya redactado que lista cada
producto y cantidad. El precio final, la disponibilidad y el envío se confirman por WhatsApp.

**Why this priority**: El usuario pidió incluir el carrito tal como en la referencia; es la
principal pieza de comportamiento nueva de esta funcionalidad.

**Independent Test**: Añadir dos productos fijos distintos (uno dos veces), abrir el carrito desde
el encabezado, cambiar cantidades, eliminar uno y pulsar "Consultar pedido por WhatsApp";
comprobar que WhatsApp abre con el mensaje que lista lo que queda en el carrito.

**Acceptance Scenarios**:

1. **Given** el carrito está vacío, **When** el visitante añade un producto, **Then** el contador
   rojo del icono del carrito muestra 1 y el panel lateral se abre mostrando el producto con
   foto, nombre, color (si aplica) y cantidad.
2. **Given** el mismo producto con el mismo color ya está en el carrito, **When** el visitante lo
   añade otra vez, **Then** la cantidad de esa línea sube en 1 en vez de crear otra línea.
3. **Given** una línea del carrito, **When** el visitante pulsa "−" con cantidad 1 o el icono de
   eliminar, **Then** la línea desaparece y el contador se actualiza.
4. **Given** el carrito tiene productos, **When** el visitante pulsa "Consultar pedido por
   WhatsApp", **Then** se abre WhatsApp hacia el número del negocio con un mensaje que lista
   cada línea como "cantidad × nombre — color".
5. **Given** el carrito está vacío, **When** el visitante abre el panel, **Then** ve "Tu carrito
   está vacío" y un botón que lo lleva a la colección.
6. **Given** el panel del carrito está abierto, **When** el visitante pulsa fuera del panel, la X
   o la tecla Escape, **Then** el panel se cierra.
7. **Given** el visitante añadió productos en la portada, **When** navega a otra página del sitio
   público y vuelve, **Then** el carrito conserva su contenido durante la visita.

---

### User Story 4 - El visitante conoce la personalización, los pedidos por mayor y la comunidad (Priority: P2)

Debajo de la colección el visitante encuentra: "Tu hierro. Tu gorra" (vista previa grande de una
gorra, pasos 01 Elige el estilo, 02 Elige el color, 03 Añade tu hierro, y botón que lo lleva a
personalizar); el bloque azul marino "¿Tienes una ganadería, subasta o evento?" con el dato "12+
unidades" y el botón "Cotizar pedido para mi finca"; y "Somos de campo" con cuatro fotos de la
comunidad y el enlace al canal de YouTube.

**Why this priority**: Aporta la narrativa de marca de la referencia, pero la portada ya es útil
sin estas secciones.

**Independent Test**: Recorrer las tres secciones y pulsar sus botones, comprobando a dónde lleva
cada uno.

**Acceptance Scenarios**:

1. **Given** el visitante está en "Tu hierro. Tu gorra", **When** pulsa las opciones de estilo o
   color, **Then** la vista previa y sus etiquetas cambian para reflejar la opción elegida, igual
   que en la referencia.
2. **Given** el visitante está en "Tu hierro. Tu gorra", **When** pulsa el botón principal
   ("Personalizar mi gorra"), **Then** llega al configurador de un modelo personalizable
   publicado.
3. **Given** el visitante está en el bloque de pedidos por mayor, **When** pulsa "Cotizar pedido
   para mi finca", **Then** se abre WhatsApp con un mensaje ya redactado para pedidos de 12 o más
   unidades.
4. **Given** hay un enlace de YouTube configurado en Ajustes, **When** el visitante pulsa el botón
   de YouTube en "Somos de campo", **Then** se abre el canal en otra pestaña.

---

### User Story 5 - El resto del sitio público adopta la nueva paleta y navegación (Priority: P2)

En cualquier página pública (catálogo, producto, configurador, cuenta, solicitud, política de
privacidad) el visitante ve el mismo encabezado, la franja de anuncios, el pie de página y los
colores de la nueva identidad, y sigue teniendo el selector de idioma y el control de cuenta.

**Why this priority**: Evita que el sitio se vea partido en dos identidades al salir de la
portada, pero depende de que la portada exista (US1).

**Independent Test**: Navegar desde la portada a cada página pública y comprobar encabezado, pie
de página, colores de fondo, botones principales en rojo y que idioma y cuenta siguen funcionando.

**Acceptance Scenarios**:

1. **Given** el visitante está en cualquier página pública, **When** mira el encabezado, **Then**
   ve el logotipo, los enlaces "Colecciones", "Personaliza tu hierro", "Pedidos por mayor",
   "Comunidad", la lupa, WhatsApp, el carrito con su contador, el selector de idioma y el
   control de cuenta.
2. **Given** el visitante está en una página que no es la portada, **When** pulsa un enlace de
   sección del encabezado (por ejemplo "Pedidos por mayor"), **Then** llega a la portada en esa
   sección.
3. **Given** el visitante está en cualquier página pública, **When** mira los botones de acción
   principal (enviar, continuar, pedir), **Then** estos usan el rojo de acción y los fondos usan
   el crema de la nueva paleta.
4. **Given** una persona administradora entra al panel, **When** navega por él, **Then** el panel
   se ve igual que antes de este cambio.

---

### User Story 6 - El visitante usa la portada en el teléfono (Priority: P2)

En un teléfono o tablet todas las secciones se reacomodan como en la referencia: menú
hamburguesa, beneficios en dos columnas, tarjetas en una o dos columnas, sin desplazamiento
horizontal, y el botón flotante de WhatsApp siempre visible.

**Why this priority**: La mayoría de los clientes del sector entra desde el celular, pero el
diseño responsive ya está resuelto en la referencia; solo hay que respetarlo.

**Independent Test**: Abrir la portada a 360 px, 768 px y 1440 px y recorrerla completa.

**Acceptance Scenarios**:

1. **Given** una pantalla de 360 px, **When** el visitante recorre la portada, **Then** no hay
   desplazamiento horizontal ni texto cortado, y el menú aparece como hamburguesa.
2. **Given** el menú hamburguesa abierto, **When** el visitante lo usa, **Then** encuentra los
   enlaces de sección, el enlace a YouTube, el selector de idioma y el control de cuenta.
3. **Given** cualquier ancho de pantalla, **When** el visitante recorre la página, **Then** el botón
   flotante de WhatsApp permanece visible en la esquina inferior derecha sin tapar los botones
   del carrito.

### Edge Cases

- **Sin número de WhatsApp configurado**: si en Ajustes no existe enlace de WhatsApp ni teléfono de
  contacto, los botones de WhatsApp (encabezado, flotante, carrito, pedidos por mayor) no se
  muestran y el carrito indica que el pedido no se puede enviar por ahora, en vez de abrir un
  WhatsApp sin destinatario.
- **Sin enlace de YouTube configurado**: el botón de YouTube de "Somos de campo" y del menú móvil
  no se muestra.
- **Sin ningún modelo personalizable publicado**: el botón principal de "Tu hierro. Tu gorra" lleva
  a la colección en vez de a un configurador.
- **Modelo sin foto de portada**: la tarjeta reserva el mismo espacio con un fondo arena neutro, sin
  saltos de diseño.
- **Producto del carrito que deja de estar publicado**: se mantiene en el carrito con el nombre que
  tenía; el precio y la disponibilidad se confirman por WhatsApp.
- **Nombre de modelo muy largo**: el nombre se ajusta en varias líneas dentro de la tarjeta sin
  desbordarla.
- **Movimiento reducido**: si el dispositivo pide reducir animaciones, se eliminan los efectos de
  zoom y el desplazamiento suave.

## Requirements *(mandatory)*

### Functional Requirements

**Paleta y tipografía**

- **FR-001**: El sitio público MUST usar la paleta de la referencia: azul marino profundo para
  franjas, encabezados de bloque, pie de página y banners; rojo de acción exclusivamente para
  botones principales, contadores y acentos; crema como fondo general; arena para superficies
  secundarias; dorado para detalles del pie de página y del bloque de pedidos por mayor; verde
  WhatsApp para el botón flotante.
- **FR-002**: El sitio público MUST usar la tipografía de la referencia: títulos condensados,
  gruesos y en mayúsculas; textos en sans limpia; "friends." del logotipo en estilo manuscrito
  rojo inclinado.
- **FR-003**: El panel administrador MUST conservar su apariencia actual.

**Estructura de la portada**

- **FR-004**: La portada MUST mostrar, en este orden: franja de anuncios, encabezado fijo, héroe,
  franja de beneficios (Bordado 3D, Lista para el sol, Envíos rurales, Hecha para durar),
  "Nuestra colección", "Tu hierro. Tu gorra", bloque de pedidos por mayor, "Somos de campo", pie
  de página y botón flotante de WhatsApp.
- **FR-005**: La portada MUST reemplazar por completo las secciones actuales (héroe actual, "The
  Collection", "B2B Services", "The Process" y pie de página actual); la sección "The Process" deja
  de mostrarse.
- **FR-006**: El héroe MUST usar el banner configurado en Ajustes como foto de fondo cuando exista y,
  si no, la foto de campo de la referencia, siempre con el degradado azul marino de la referencia.
- **FR-007**: Las fotos de la referencia (héroe, equipo ganadero del bloque de pedidos por mayor,
  vista previa de "Tu hierro. Tu gorra" y las cuatro fotos de comunidad) MUST incorporarse al
  sitio.
- **FR-008**: Todo texto visible nuevo MUST existir en español e inglés y salir del sistema de
  traducción; los textos en español son los de la referencia.

**Encabezado y navegación**

- **FR-009**: El encabezado MUST mostrar el logotipo `public/logotipo.jpeg` y el pie de página
  `public/logotipo-footer.png`, este último sobre una placa crema porque su "BRAHMAN" azul marino
  no se lee sobre el pie azul marino (decisión del 2026-09-30). Si hay un logotipo subido en
  Ajustes, se muestra ese en ambos lugares. Pulsar el logotipo del encabezado lleva a la portada.
- **FR-010**: El encabezado MUST incluir los enlaces "Colecciones", "Personaliza tu hierro",
  "Pedidos por mayor" y "Comunidad", que llevan a la sección correspondiente de la portada desde
  cualquier página pública.
- **FR-011**: El encabezado MUST conservar el selector de idioma y el control de cuenta existentes,
  además de la lupa, el acceso a WhatsApp y el carrito con contador.
- **FR-012**: En pantallas angostas el encabezado MUST colapsar en un menú hamburguesa que expone
  los enlaces de sección, YouTube (si está configurado), el selector de idioma y el control de
  cuenta.

**Colección**

- **FR-013**: "Nuestra colección" MUST listar únicamente los modelos publicados en el panel, con su
  foto de portada y su nombre en el idioma activo.
- **FR-014**: La colección MUST ofrecer las pestañas "Todos", "Personalizables" y "Productos
  listos", que filtran por tipo de modelo.
- **FR-015**: La lupa del encabezado MUST abrir un buscador en la colección que filtra por nombre
  mientras se escribe.
- **FR-016**: Cada tarjeta MUST mostrar una etiqueta en la esquina ("Personalizable" o "Producto
  listo"), el nombre y, si el modelo tiene colores, sus muestras de color seleccionables que
  cambian la foto cuando el color tiene foto propia.
- **FR-017**: El botón de la tarjeta de un modelo personalizable MUST llevar a su configurador; el
  de un producto fijo MUST añadirlo al carrito (con el color elegido, si el producto tiene
  colores).
- **FR-018**: Las tarjetas de productos fijos MUST mostrar su precio con la moneda escrita sin
  ambigüedad, en el formato "US$ 120.00" (el símbolo "$" solo se confunde con pesos colombianos);
  el mismo formato se usa en la página de producto. Las tarjetas de modelos personalizables
  muestran "Cotizar" en lugar de precio.

**Carrito**

- **FR-019**: El carrito MUST abrirse como panel lateral desde el icono del encabezado y al añadir
  un producto, y cerrarse con la X, pulsando fuera o con Escape.
- **FR-020**: El carrito MUST agrupar líneas por producto y color, permitir subir y bajar
  cantidades y eliminar líneas, y el contador del encabezado MUST mostrar el total de unidades.
- **FR-021**: El carrito MUST conservar su contenido mientras el visitante navega por el sitio
  público durante la visita, sin requerir cuenta.
- **FR-022**: El carrito MUST enviar el pedido abriendo WhatsApp hacia el número del negocio con un
  mensaje que liste cada línea como "cantidad × nombre — color", e indicar que precio final,
  disponibilidad y envío se confirman por WhatsApp. El carrito no cobra ni guarda el pedido en el
  sistema.

**Secciones de marca**

- **FR-023**: "Tu hierro. Tu gorra" MUST reproducir la vista previa y los pasos 01, 02 y 03 de la
  referencia; elegir estilo o color MUST actualizar la vista previa y sus etiquetas; el botón
  principal MUST llevar al configurador de un modelo personalizable publicado (o a la colección
  si no hay ninguno). Esta sección no sube archivos ni añade al carrito.
- **FR-024**: El bloque de pedidos por mayor MUST mostrar el titular, el texto, el dato "12+
  unidades", la foto con la etiqueta dorada "Orgullo que se lleva puesto" y el botón "Cotizar
  pedido para mi finca", que abre WhatsApp con un mensaje ya redactado.
- **FR-025**: "Somos de campo" MUST mostrar las cuatro fotos de comunidad, el lema "Hechos de la
  misma tierra. Unidos por la misma pasión." y un botón al canal de YouTube configurado en
  Ajustes.

**Pie de página y contacto**

- **FR-026**: El pie de página MUST seguir la referencia (logotipo claro con texto de propósito,
  columnas "Explora", "Contacto" y "Tu pedido", derechos y "Volver arriba") y MUST mostrar las
  redes sociales configuradas en Ajustes.
- **FR-027**: Todos los enlaces de WhatsApp MUST usar el enlace de WhatsApp configurado en Ajustes o,
  si no existe, el teléfono de contacto de Ajustes; si no hay ninguno, esos botones no se
  muestran.

**Adaptación y accesibilidad**

- **FR-028**: La portada y el encabezado MUST adaptarse a teléfono, tablet y escritorio como en la
  referencia, sin desplazamiento horizontal.
- **FR-029**: Los controles de iconos (lupa, WhatsApp, carrito, menú, cerrar) MUST tener nombre
  accesible en el idioma activo, y el sitio MUST respetar la preferencia de movimiento reducido.

### Key Entities

- **Línea del carrito**: un producto fijo elegido por el visitante; guarda nombre, foto, color y
  cantidad. Solo vive en el navegador del visitante durante la visita.
- **Ajustes del sitio** (existente): aporta logotipo, banner del héroe, teléfono de contacto y
  redes sociales (incluidos WhatsApp y YouTube) que la nueva portada consume.
- **Modelo publicado** (existente): alimenta las tarjetas de la colección (nombre, tipo, foto de
  portada, colores y precio si es producto fijo).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Comparando la portada con la referencia a 1440 px, 768 px y 360 px, una persona del
  equipo no encuentra diferencias en orden de secciones, colores, tipografías ni textos, fuera de
  los contenidos que salen de datos reales (modelos, logo, banner, redes).
- **SC-002**: Un visitante puede, desde la portada, añadir un producto fijo al carrito y abrir
  WhatsApp con el pedido en menos de 1 minuto y en no más de 4 pulsaciones.
- **SC-003**: Un visitante llega al configurador de un modelo personalizable desde la portada en 2
  pulsaciones o menos.
- **SC-004**: Al recorrer las 7 páginas públicas (portada, catálogo, producto, configurador,
  cuenta, solicitud, política de privacidad) en ambos idiomas, todas muestran el nuevo
  encabezado, pie de página y paleta, y ninguna muestra textos en el idioma equivocado.
- **SC-005**: En un teléfono de 360 px, ninguna página pública permite desplazamiento horizontal.
- **SC-006**: Recorriendo el panel administrador después del cambio, su apariencia es idéntica a la
  anterior.
- **SC-007**: El carrito conserva su contenido al pasar de la portada a otra página pública y
  volver, en el 100 % de las pruebas.

## Assumptions

- La referencia `../brahman-threads` se usa como diseño visual; su código no se incorpora tal cual
  y sus productos de ejemplo ("La Legado", "La Origen", etc.) no se muestran: la colección sale de
  los modelos publicados.
- Las categorías de la referencia ("Colección Brahman", "Edición Especial Ferias") no existen en
  los datos; se sustituyen por los dos tipos de modelo reales ("Personalizables", "Productos
  listos").
- Solo los productos fijos entran al carrito; un modelo personalizable necesita pasar por el
  configurador y termina, como hoy, en una solicitud de cotización.
- El carrito termina en WhatsApp como en la referencia; no reemplaza el flujo actual de pedido de
  productos fijos ni el de solicitud de cotización, que siguen existiendo en sus páginas.
- El carrito se conserva en el navegador del visitante mientras dura la visita; no se sincroniza
  entre dispositivos ni se asocia a la cuenta.
- La franja de beneficios, textos de la franja de anuncios, "12+ unidades" y los textos del bloque
  de pedidos por mayor se toman literalmente de la referencia; se asume que el negocio los
  respalda (envíos rurales, bordado 3D, pedidos desde 12 unidades).
- El logotipo subido en Ajustes tiene prioridad sobre los archivos de logotipo de `public/`, para
  no perder lo construido en 010-panel-ajustes-generales.
- Los estilos de "Tu hierro. Tu gorra" (Trucker Malla, Cierre de Cuero, Visera Curva) y colores
  (Azul / Rojo, Arena / Café, Negro, Camo) son ilustrativos de la vitrina, con las fotos de la
  referencia.

## Dependencies

- **Enmienda de la constitution (resuelta)**: la constitution 2.1.0 (2026-09-30) permite un
  carrito de consulta por WhatsApp solo para productos fijos, guardado en el navegador durante la
  visita y sin pago en línea, que es lo que piden US3 y FR-019 a FR-022.
- Depende de los ajustes existentes (010-panel-ajustes-generales) para logotipo, banner, teléfono y
  redes sociales, y de los modelos publicados (001, 007, 009) para la colección.
