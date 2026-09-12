# Feature Specification: Modelos de producto fijo junto a modelos configurables

**Feature Branch**: `009-modelos-producto-fijo`

**Created**: 2026-09-12

**Status**: Draft

**Input**: User description: "actualmente se pueden crear modelos configurables de gorras, pero no hay forma de crear modelos de gorras ya definidos como si fueran productos normales, con su precio y descripcion y fotos quisiera que mejoraras ese flujo, es decir los modelos configurables se cotizan y no necesitan definir precios pero las gorras que no se puedan personalizar si necesitan el precio y fotos normales"

## Clarifications

### Session 2026-09-12

- Q: Un modelo "producto fijo" (no personalizable) que la persona administradora publica con su
  precio y fotos, ¿qué debe pasar del lado del cliente en el sitio público? → A: Aparece en el
  catálogo ("The Collection") con su precio visible, y el cliente lo pide mediante el mismo
  mecanismo de solicitud/seguimiento que ya existe hoy, pero sin pasar por el configurador ni por
  una cotización (el precio ya está definido).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Crear un modelo de producto fijo con precio, descripción y fotos (Priority: P1)

Una persona administradora entra a "Nuevo modelo", elige que se trata de un producto fijo (una
gorra ya definida, no personalizable) y completa código, nombre (ES/EN), descripción (ES/EN) y
precio. Después sube las fotos del producto y guarda, sin tener que pasar por los pasos de colores
ni de zona de personalización que sí aplican a los modelos configurables.

**Why this priority**: Es la necesidad principal descrita: hoy no existe ninguna forma de cargar
una gorra ya definida como un producto normal (con precio y fotos fijas) porque todo el flujo de
creación asume que el modelo se va a cotizar y personalizar.

**Independent Test**: Se puede probar por completo creando un modelo, marcándolo como producto
fijo, completando precio, descripción y fotos, guardando, y confirmando que el modelo queda
armado con esos datos sin que el sistema pida configurar colores ni zonas de personalización.

**Acceptance Scenarios**:

1. **Given** la persona administradora abre "Nuevo modelo" y elige el tipo "Producto fijo", **When**
   completa código, nombre (ES/EN), descripción (ES/EN) y precio, y guarda, **Then** el modelo se
   crea con esos datos y el tipo "Producto fijo" queda registrado.
2. **Given** la persona administradora está creando o editando un modelo "Producto fijo", **When**
   intenta guardar sin precio, **Then** el sistema se lo impide y muestra un aviso de campo
   requerido (a diferencia de un modelo configurable, donde el precio puede quedar vacío).
3. **Given** la persona administradora abre la pantalla de configuración de un modelo "Producto
   fijo", **When** la revisa, **Then** no encuentra el paso de colores ni el paso de zona de
   personalización/técnicas, solo los campos y fotos que corresponden a un producto ya definido.
4. **Given** la persona administradora intenta publicar un modelo "Producto fijo", **When** todavía
   no cargó ninguna foto o no definió el precio, **Then** el sistema se lo impide, igual que hoy
   impide publicar un modelo configurable incompleto.

---

### User Story 2 - Un cliente ve y pide un producto fijo con su precio, sin configurador (Priority: P1)

Una persona visitante entra al sitio, ve en el catálogo un modelo "Producto fijo" junto con los
modelos configurables, y nota que ese tiene un precio ya definido. Al entrar a verlo, ve sus fotos,
descripción y precio, y puede pedirlo indicando cantidad y sus datos de contacto, sin pasar por el
configurador de colores/personalización ni recibir una cotización posterior: el precio ya es el que
vio.

**Why this priority**: Sin esto, crear un modelo "Producto fijo" en el panel no tiene ningún efecto
para el negocio: el objetivo completo es que ese tipo de gorra también se pueda ofrecer y pedir en
el sitio, a diferencia de los modelos configurables que sí requieren cotización.

**Independent Test**: Se puede probar publicando un modelo "Producto fijo" y luego, como visitante,
encontrándolo en el catálogo, abriéndolo, viendo su precio y fotos, y completando el pedido
(cantidad y contacto) hasta obtener una confirmación/código de seguimiento, sin que en ningún
momento se le pida elegir colores ni personalizar una zona.

**Acceptance Scenarios**:

1. **Given** un modelo "Producto fijo" publicado con precio y fotos, **When** un visitante abre el
   catálogo del sitio, **Then** ve ese modelo junto con los configurables y su precio visible.
2. **Given** un visitante abre un modelo "Producto fijo" desde el catálogo, **When** revisa la
   pantalla, **Then** ve sus fotos y descripción y no encuentra ningún paso de configurador
   (colores, zonas, técnicas).
3. **Given** un visitante quiere pedir un modelo "Producto fijo", **When** indica cantidad y sus
   datos de contacto y confirma, **Then** el sistema registra el pedido con el precio ya definido
   (sin pasar por un estado de "a cotizar") y le entrega una forma de seguir su estado, igual que ya
   ocurre hoy para los pedidos de modelos configurables.
4. **Given** un modelo "Producto fijo" que todavía está en borrador (no publicado), **When** un
   visitante navega el catálogo, **Then** no lo ve, igual que ocurre hoy con los modelos
   configurables en borrador.

---

### User Story 3 - Seguir creando modelos configurables sin precio obligatorio (Priority: P1)

El flujo actual de modelos configurables sigue funcionando exactamente igual: el precio sigue
siendo opcional porque ese tipo de gorra se cotiza según cómo la personalice cada cliente, y el
modelo sigue pasando por los pasos de vistas, colores y personalización, además de seguir
apareciendo en el catálogo llevando al configurador como hasta ahora.

**Why this priority**: Es igual de crítico que las funcionalidades nuevas: no se puede resolver el
caso de los productos fijos rompiendo o complicando el flujo de los modelos configurables, que es
el que ya se usa activamente.

**Independent Test**: Se puede probar creando un modelo dejando el tipo por defecto ("Configurable")
o eligiéndolo explícitamente, sin llenar el precio, guardando, y confirmando que continúa hacia el
configurador de vistas/colores/personalización exactamente como ocurre hoy, y que en el catálogo
sigue llevando al configurador en vez de a una página de pedido directo.

**Acceptance Scenarios**:

1. **Given** la persona administradora crea un modelo sin cambiar el tipo, **When** deja el precio
   vacío y guarda, **Then** el modelo se crea como "Configurable" sin ningún error, igual que hoy.
2. **Given** un modelo configurable creado antes de esta funcionalidad, **When** la persona
   administradora lo abre, **Then** aparece con tipo "Configurable" y con todos sus pasos (vistas,
   colores, personalización) sin cambios.
3. **Given** un modelo "Configurable" publicado, **When** un visitante lo abre desde el catálogo,
   **Then** sigue llevándolo al configurador para elegir colores y personalizar, y su pedido sigue
   pasando por el mismo proceso de cotización que hoy.

---

### User Story 4 - Distinguir el tipo de modelo al verlo en el listado del panel (Priority: P2)

Al ver el listado de modelos en el panel, la persona administradora puede notar de inmediato cuáles
son modelos configurables (se cotizan) y cuáles son productos fijos (precio y fotos definidos), sin
tener que entrar a cada uno para saberlo.

**Why this priority**: Mejora el trabajo diario del equipo administrador una vez que existen los dos
tipos, pero no bloquea la funcionalidad principal (crear, publicar y vender productos fijos) si se
entrega después.

**Independent Test**: Se puede probar abriendo el listado de modelos y confirmando que cada fila o
tarjeta indica su tipo ("Configurable" o "Producto fijo") sin necesidad de abrir el modelo.

**Acceptance Scenarios**:

1. **Given** el panel tiene modelos de ambos tipos creados, **When** la persona administradora abre
   el listado de modelos, **Then** distingue el tipo de cada uno a simple vista.

---

### Edge Cases

- Si la persona administradora intenta publicar un modelo "Producto fijo" sin precio o sin ninguna
  foto cargada, el sistema lo impide, igual que hoy impide publicar un modelo configurable
  incompleto.
- Si dos modelos usan el mismo código, el sistema rechaza la creación sin importar el tipo elegido,
  tal como ocurre hoy.
- El tipo de un modelo se elige al crearlo y no se puede cambiar después: evita dejar a un modelo
  configurable con colores o zonas ya configuradas convertido a un tipo que no los usa (o viceversa,
  un producto fijo con precio y fotos convertido en un modelo que debería cotizarse).
- Los modelos configurables que ya existían antes de esta funcionalidad se tratan como tipo
  "Configurable" automáticamente, sin que la persona administradora tenga que hacer nada.
- Si un modelo "Producto fijo" se despublica (vuelve a borrador) después de tener pedidos hechos,
  esos pedidos ya registrados no se ven afectados; solo deja de verse en el catálogo para nuevos
  visitantes, igual que ocurre hoy al despublicar un modelo configurable.
- Un pedido de un modelo "Producto fijo" no requiere que el equipo administrador defina un precio
  al revisarlo (ya viene fijo desde el catálogo), a diferencia de un pedido de un modelo
  configurable, que sí se cotiza tras revisarlo.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema DEBE permitir elegir, al crear un modelo nuevo, un tipo: "Configurable"
  (comportamiento actual, valor por defecto) o "Producto fijo" (gorra ya definida, no
  personalizable).
- **FR-002**: Para un modelo tipo "Producto fijo", el precio DEBE ser obligatorio para poder
  guardarlo.
- **FR-003**: Para un modelo tipo "Configurable", el precio DEBE seguir siendo opcional, sin
  cambios respecto al comportamiento actual.
- **FR-004**: El sistema NO DEBE mostrar el paso de colores ni el paso de zona de
  personalización/técnicas al configurar un modelo tipo "Producto fijo", porque ninguno de los dos
  aplica a una gorra que no se personaliza.
- **FR-005**: El sistema DEBE permitir cargar fotos del producto para un modelo "Producto fijo"
  usando el mismo mecanismo de vistas (frontal/lateral/trasera) que ya usan los modelos
  configurables, sin exigir combinaciones de componente y color.
- **FR-006**: El sistema NO DEBE permitir publicar un modelo "Producto fijo" si le falta el precio o
  no tiene al menos una foto cargada, mostrando un aviso de qué falta, en el mismo espíritu que la
  validación de publicación que ya existe para modelos configurables.
- **FR-007**: El sistema DEBE seguir validando la publicación de un modelo "Configurable" con las
  mismas reglas que usa hoy (vistas, colores, componentes), sin cambios.
- **FR-008**: El listado de modelos en el panel DEBE mostrar el tipo de cada modelo ("Configurable"
  o "Producto fijo").
- **FR-009**: Los modelos creados antes de esta funcionalidad DEBEN tratarse como tipo
  "Configurable", conservando su comportamiento actual sin requerir ninguna acción de migración por
  parte de la persona administradora.
- **FR-010**: El tipo de un modelo DEBE quedar fijo desde su creación: el sistema NO DEBE ofrecer una
  forma de cambiarlo después, para evitar dejar datos de configuración (colores, zonas) o de
  producto (precio, fotos) inconsistentes con el nuevo tipo.
- **FR-011**: El catálogo público DEBE mostrar los modelos "Producto fijo" publicados junto con los
  modelos "Configurable" publicados, indicando el precio del producto fijo.
- **FR-012**: Al abrir un modelo "Producto fijo" publicado desde el catálogo, el sistema DEBE
  mostrar sus fotos, descripción y precio, y NO DEBE llevar al visitante al configurador de
  colores/personalización que usan los modelos configurables.
- **FR-013**: El sistema DEBE permitir a un visitante pedir un modelo "Producto fijo" indicando
  cantidad y datos de contacto, y registrar ese pedido con el precio ya definido del modelo, sin
  pasar por un paso de cotización.
- **FR-014**: Un pedido de un modelo "Producto fijo" DEBE poder seguirse por la persona que lo hizo,
  usando el mismo mecanismo de seguimiento (código/estado) que ya existe para los pedidos de
  modelos configurables.
- **FR-015**: Un modelo "Producto fijo" en borrador (no publicado) NO DEBE aparecer en el catálogo
  público, igual que ocurre hoy con los modelos configurables en borrador.

### Key Entities *(include if feature involves data)*

- **Modelo de gorra**: además de sus atributos actuales (código, nombre ES/EN, descripción ES/EN,
  precio, estado borrador/publicado), pasa a tener un **tipo**: "Configurable" o "Producto fijo".
  El tipo determina si el precio es obligatorio, si los pasos de colores y personalización aplican,
  y si el catálogo lleva al configurador o a un pedido directo. El tipo se define al crear el
  modelo y no cambia después.
- **Fotos del modelo**: siguen siendo las mismas vistas (frontal/lateral/trasera) que ya existen
  hoy; los modelos "Producto fijo" las usan como fotos de producto normales, sin variantes de color
  asociadas.
- **Pedido/solicitud**: sigue siendo la misma entidad que hoy registra cantidad, contacto y estado
  de un pedido. Para un modelo "Producto fijo" no incluye una configuración de colores/decoración
  ni pasa por un estado de cotización, porque el precio ya viene definido del modelo.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Una persona administradora puede crear un modelo "Producto fijo" listo para publicar
  (código, nombre ES/EN, descripción ES/EN, precio y al menos una foto) en menos de 2 minutos, sin
  pasar por ningún paso de colores o personalización.
- **SC-002**: El 100% de los intentos de publicar un modelo "Producto fijo" sin precio o sin fotos
  son bloqueados por el sistema, verificable intentando publicar uno incompleto.
- **SC-003**: Los modelos configurables creados antes de esta funcionalidad siguen funcionando sin
  ningún cambio perceptible (mismos pasos, mismas validaciones, mismo camino desde el catálogo),
  verificable abriendo uno existente después de entregada la funcionalidad.
- **SC-004**: Una persona administradora distingue el tipo de cualquier modelo del listado sin
  necesidad de abrirlo, verificable a simple vista.
- **SC-005**: Un visitante puede pedir un modelo "Producto fijo" publicado, desde que lo encuentra
  en el catálogo hasta que obtiene su código de seguimiento, en menos de 2 minutos y sin que se le
  pida elegir colores ni personalizar ninguna zona.

## Assumptions

- El tipo de un modelo se elige una sola vez, al crearlo, y no se puede cambiar después (FR-010).
- Las fotos de un modelo "Producto fijo" reutilizan el mismo paso de vistas (frontal/lateral/
  trasera) que ya existe para modelos configurables, en vez de un mecanismo de galería nuevo.
- La cantidad mínima de pedido (MOQ) sigue siendo un campo opcional para ambos tipos de modelo, sin
  cambios respecto al comportamiento actual.
- Un modelo "Producto fijo" sigue el mismo ciclo de vida borrador → publicado que un modelo
  configurable, y el mismo mecanismo de seguimiento de pedidos (código, estados), aunque un pedido
  de producto fijo no pasa por el estado de cotización.
- El pedido de un modelo "Producto fijo" sigue pidiendo los mismos datos de contacto y aceptación de
  política de privacidad que ya se piden hoy al solicitar un modelo configurable.
