# Feature Specification: Configurador de gorras y solicitud de cotización

**Feature Branch**: `001-configurador-gorras` (el proyecto aún no usa control de versiones; no se creó rama)

**Created**: 2026-08-12

**Status**: Draft

**Input**: User description: "Configurador de gorras personalizadas y solicitud de cotización — Brahman Friends v1"

## Contexto de negocio

Hoy toda la venta de Brahman Friends ocurre por redes sociales: el cliente describe por chat lo
que quiere, el equipo comercial responde con texto y fotos sueltas, y no queda registro
estructurado de lo pedido. Eso alarga el ciclo de venta y produce errores en producción.

Esta versión construye la pieza que no existe: **una herramienta donde el cliente arma su gorra,
ve el resultado y envía una solicitud de cotización con toda la información técnica que
producción necesita.**

El pago en línea no entra: el precio depende de la cantidad, la técnica y la disponibilidad del
material, y ese cálculo aún no existe.

### Usuarios

- **Cliente**: equipos deportivos, empresas y colectivos que compran por lotes. No sabe de diseño
  ni de producción textil, no distingue bordado de DTF y sube el logo que tenga a mano. No
  necesita cuenta. Espera ver la gorra, no leer especificaciones.
- **Administrador**: carga modelos e imágenes, administra la paleta de colores y define las zonas
  decorables. Conoce las restricciones reales de la fábrica.
- **Comercial**: recibe las solicitudes, cotiza y responde por fuera del sistema. En esta versión
  comparte rol con el administrador.
- **Producción**: no entra al sistema, pero trabaja con la ficha técnica que este genera. Si la
  ficha está incompleta o es ambigua, la gorra sale mal.

## Clarifications

### Session 2026-08-12

- Q: ¿Las zonas decorables (posición, dimensiones máximas en cm y curvatura) se definen desde el
  panel de administración o quedan fijas en la configuración del despliegue? → A: Desde el panel,
  por modelo (se mantienen FR-034 y FR-035; se enmienda el Assumption 8).
- Q: ¿Cuánto puede tardar el configurador en quedar listo para interactuar la primera vez, y sobre
  qué conexión se mide? → A: 5 segundos o menos en 4G, cargando primero la vista frontal con los
  colores por defecto y el resto en segundo plano.
- Q: ¿Se mantiene el SVG entre los formatos de logotipo aceptados, y con qué tratamiento? → A: Sí,
  saneado al subir: se le retira todo contenido ejecutable antes de guardarlo y se rechaza si no
  sobrevive al saneo.
- Q: Si la solicitud se registra pero el correo de confirmación falla, ¿qué ve el cliente? → A: El
  envío se considera exitoso; se muestra el código con un aviso de que el correo puede demorar, se
  reintenta en segundo plano y la solicitud queda marcada como notificación pendiente en el panel.
- Q: ¿Cuánto tiempo conserva el sistema los datos personales de una solicitud cerrada o rechazada?
  → A: 12 meses desde que alcanza estado final; después se borran nombre, correo y teléfono y la
  solicitud queda como histórico anónimo. El administrador puede anonimizarla antes a petición del
  titular.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Publicar un modelo en el catálogo (Priority: P1)

El administrador registra una gorra: su nombre, su código interno, qué componentes la forman,
cuáles puede cambiar el cliente y de qué material es cada uno. Carga las imágenes de cada
componente en cada color habilitado y en cada vista, y publica el modelo cuando está completo.

**Why this priority**: Sin catálogo publicado no existe nada más. Es la única historia que ningún
otro flujo puede sustituir, y es la que concentra el trabajo de carga de imágenes.

**Independent Test**: Se prueba entrando al panel, creando un modelo con un componente y dos
colores, cargando sus imágenes y publicándolo. Entrega valor por sí sola: el equipo pasa de tener
las referencias en carpetas sueltas a tener un catálogo con materiales y disponibilidad.

**Acceptance Scenarios**:

1. **Given** un modelo con todas sus imágenes cargadas, **When** el administrador lo publica,
   **Then** el modelo queda disponible para el cliente.
2. **Given** un modelo cuyo componente personalizable "corona" no tiene imagen para el color
   "Azul Rey" en la vista trasera, **When** el administrador intenta publicarlo, **Then** el
   sistema lo impide y lista exactamente las combinaciones que faltan.
3. **Given** una imagen de 1800×1200 en un modelo cuyas demás imágenes miden 2000×1400, **When**
   el administrador la carga, **Then** el sistema la rechaza e indica la discrepancia.
4. **Given** un color de material "hilo de bordado", **When** el administrador intenta habilitarlo
   en un componente de material "tela", **Then** el sistema no lo permite.
5. **Given** un modelo en edición, **When** el administrador define la zona frontal con sus medidas
   en centímetros y ajusta su curvatura, **Then** el panel muestra la vista previa del efecto sobre
   la imagen base y guarda esos valores para ese modelo.

---

### User Story 2 - Diseñar la gorra eligiendo colores (Priority: P1)

El cliente llega desde Instagram o WhatsApp, elige un modelo publicado, cambia el color de cada
componente y ve el resultado al instante. Gira entre las cuatro vistas para revisar el diseño
completo y puede empezar de nuevo si no le convence.

**Why this priority**: Es el corazón del producto y lo que elimina el ida y vuelta de fotos por
chat. Aun sin decoración ni envío de solicitud, un cliente ya puede ver su gorra.

**Independent Test**: Con un modelo publicado, se abre el configurador, se cambian colores, se
recorren las vistas y se restablece el diseño. Se verifica sin escribir ni leer código.

**Acceptance Scenarios**:

1. **Given** el configurador abierto, **When** el cliente elige un color para la corona, **Then**
   la gorra se muestra con la corona en ese color en menos de un segundo y sin recargar la página.
2. **Given** un diseño con colores elegidos, **When** el cliente cambia de vista, **Then** todos
   los colores se conservan.
3. **Given** un color marcado como agotado, **When** el cliente abre cualquier selector, **Then**
   ese color no aparece.
4. **Given** un diseño en curso, **When** el cliente recarga la página por accidente, **Then** el
   diseño se restaura completo.
5. **Given** un diseño en curso, **When** el cliente pulsa restablecer y confirma, **Then** la
   gorra vuelve a su configuración por defecto.

---

### User Story 3 - Decorar con logotipo y texto (Priority: P2)

El cliente sube el logo de su equipo o su empresa, lo ubica en una de las zonas permitidas,
ajusta su tamaño y lo ve adaptado a la curvatura de la gorra. También puede poner un texto en vez
de un logo, y elige con qué técnica se producirá su diseño.

**Why this priority**: Es lo que convierte una gorra de color en una gorra del cliente, y lo que
más consultas genera por chat. Depende de la historia 2 para tener sobre qué dibujar.

**Independent Test**: Sobre un diseño con colores, se carga un PNG, se ubica al frente, se
agranda hasta el tope y se comprueba que no aparece en la vista trasera.

**Acceptance Scenarios**:

1. **Given** un archivo PNG válido, **When** el cliente lo carga, **Then** el logotipo aparece en
   la zona seleccionada, adaptado a la curvatura de esa zona.
2. **Given** un archivo que excede el peso permitido, **When** el cliente lo carga, **Then** el
   sistema lo rechaza e indica el límite.
3. **Given** un logotipo ubicado en la zona frontal, **When** el cliente pasa a la vista trasera,
   **Then** el logotipo no se muestra.
4. **Given** un logotipo en su tamaño máximo, **When** el cliente intenta agrandarlo más, **Then**
   el redimensionamiento se detiene en el límite de la zona.
5. **Given** un diseño con tres zonas ya decoradas, **When** el cliente intenta decorar una
   cuarta, **Then** el sistema no lo permite e indica el máximo.
6. **Given** una zona que ya tiene un logotipo, **When** el cliente intenta añadir texto en la
   misma zona, **Then** el sistema indica que debe elegir uno de los dos.

---

### User Story 4 - Enviar la solicitud de cotización (Priority: P2)

El cliente indica cuántas gorras necesita y cómo se reparten entre tallas, revisa un resumen de
todo lo que configuró, deja sus datos de contacto y envía. Recibe un código y un correo de
confirmación.

**Why this priority**: Es el punto donde el diseño se convierte en información utilizable por el
equipo comercial. Sin esto, el configurador es una demostración bonita sin resultado.

**Independent Test**: Con un diseño terminado, se indican 60 unidades repartidas en tallas, se
completan los datos y se envía; se comprueba que aparece un código y llega el correo.

**Acceptance Scenarios**:

1. **Given** una cantidad total de 60 unidades, **When** el cliente distribuye solo 55 entre las
   tallas, **Then** el sistema impide continuar hasta cuadrar las 5 restantes.
2. **Given** el formulario de envío, **When** el correo electrónico no es válido o no se acepta el
   tratamiento de datos, **Then** el envío permanece bloqueado.
3. **Given** una solicitud completa, **When** el cliente la envía, **Then** ve un código único en
   pantalla y recibe un correo de confirmación.
4. **Given** un envío en curso, **When** el cliente pulsa dos veces por error, **Then** se
   registra una única solicitud.
5. **Given** un modelo despublicado mientras el cliente lo personalizaba, **When** el cliente
   intenta enviar, **Then** el sistema informa que ya no está disponible y bloquea el envío.

---

### User Story 5 - Gestionar y cotizar las solicitudes (Priority: P3)

El administrador entra al panel, ve las solicitudes recibidas, abre una y encuentra el diseño tal
como lo dejó el cliente junto a su ficha técnica: referencias de material por componente y medidas
reales de cada elemento decorativo. Descarga el logotipo original, cambia el estado y responde por
fuera del sistema.

**Why this priority**: Cierra el ciclo, pero mientras el volumen sea bajo el equipo puede trabajar
desde los correos de notificación. Es lo que puede entregarse después sin frenar la venta.

**Independent Test**: Con una solicitud enviada, se entra al panel, se abre el detalle, se
descarga el logotipo y se cambia el estado; se verifica que queda registrado quién y cuándo.

**Acceptance Scenarios**:

1. **Given** un usuario no autenticado, **When** intenta abrir el panel, **Then** el sistema le
   niega el acceso.
2. **Given** una solicitud recibida, **When** el administrador abre su detalle, **Then** ve las
   imágenes del diseño, las referencias de material por componente y las medidas en centímetros de
   cada elemento decorativo.
3. **Given** una solicitud en estado Nueva, **When** el administrador intenta pasarla a Cerrada,
   **Then** el sistema no lo permite.
4. **Given** una solicitud en cualquier estado abierto, **When** el administrador la rechaza,
   **Then** queda en Rechazada con la fecha y el usuario responsable registrados.
5. **Given** que el administrador reemplazó las imágenes del modelo, **When** abre una solicitud
   anterior, **Then** esa solicitud conserva sus imágenes originales.
6. **Given** una solicitud cuyo cliente pide que borren sus datos, **When** el administrador la
   anonimiza, **Then** deja de mostrar nombre, correo y teléfono, ya no permite descargar el
   logotipo, y conserva el código, el diseño y la ficha técnica.

---

### Edge Cases

- **No hay modelos publicados**: el configurador informa que no hay modelos disponibles en lugar
  de mostrar una pantalla vacía.
- **Un modelo se despublica mientras el cliente lo personaliza**: el sistema informa que dejó de
  estar disponible y bloquea el envío.
- **Un color se agota durante la configuración**: el sistema señala el componente afectado y pide
  elegir otro color antes de enviar.
- **Falta un dato obligatorio al enviar**: el sistema identifica el campo faltante.
- **Archivo de logotipo no válido**: se rechaza indicando el motivo (formato o peso).
- **SVG que no sobrevive al saneo**: si al retirarle el contenido ejecutable el archivo deja de ser
  un logotipo válido, se rechaza indicando el motivo y se pide otro formato.
- **Logotipo con fondo blanco en vez de transparente**: se muestra tal cual y se advierte que el
  fondo se producirá como parte del diseño.
- **Logotipo de resolución muy baja**: se acepta y se advierte que la calidad de producción puede
  verse afectada.
- **El cliente elimina un elemento decorativo**: desaparece de todas las vistas y su zona vuelve a
  quedar libre.
- **Texto vacío o por encima del máximo de caracteres**: no se permite agregarlo y se muestra el
  límite.
- **Elemento arrastrado fuera de su zona**: vuelve a la posición válida más cercana.
- **El cliente abandona el configurador sin enviar**: el diseño se conserva en su navegador y se
  restaura al volver; no queda registrado como solicitud.
- **Falla la conexión durante el envío**: el diseño se conserva y se puede reintentar sin volver a
  configurar nada.
- **Falla el correo con la solicitud ya registrada**: el cliente ve su código igual, con el aviso de
  que el correo puede demorar; la solicitud queda marcada como notificación pendiente en el panel.
- **Las imágenes del modelo no se pueden descargar**: el sistema informa el fallo y ofrece
  reintentar, sin perder la configuración en curso.
- **Dispositivo de bajo rendimiento**: el sistema reduce la calidad de la imagen antes que
  degradar la fluidez.
- **Logotipos cargados que nunca llegan a solicitud**: se eliminan del servidor pasado el plazo de
  retención.
- **El administrador intenta eliminar un color ya usado en solicitudes**: el sistema lo bloquea y
  ofrece descontinuarlo.

## Requirements *(mandatory)*

### Functional Requirements

#### Idioma y presentación

- **FR-001**: Todo texto visible, tanto del configurador como del panel de administración, DEBE
  estar disponible en español y en inglés.
- **FR-002**: El cliente DEBE poder cambiar de idioma desde cualquier pantalla, y su elección se
  conserva mientras navega y tras recargar la página.
- **FR-003**: El sistema DEBE expresar todas las medidas de decoración en centímetros.
- **FR-004**: El sistema DEBE ser operable en un teléfono de 360 px de ancho.

#### Catálogo de modelos

- **FR-005**: El sistema DEBE permitir registrar un modelo con nombre, código interno y
  descripción, con nombre y descripción en ambos idiomas.
- **FR-006**: Las vistas de un modelo provienen de un catálogo fijo de tres: frente, lateral y
  trasera. El administrador activa las que apliquen; frente es obligatoria.
- **FR-007**: El sistema DEBE permitir definir los componentes de cada modelo, indicando cuáles
  son personalizables y el material de cada uno.
- **FR-008**: El sistema DEBE permitir cargar la imagen base del modelo en cada vista activa, con
  las partes no personalizables.
- **FR-009**: El sistema DEBE permitir cargar una imagen por cada combinación de vista activa,
  componente personalizable y color habilitado para ese componente.
- **FR-010**: El sistema DEBE permitir la carga masiva de imágenes en una sola operación y mostrar
  en todo momento qué combinaciones siguen faltando.
- **FR-011**: El sistema DEBE rechazar toda imagen cuyas dimensiones no coincidan con las de las
  demás imágenes del mismo modelo, indicando la discrepancia.
- **FR-012**: El sistema DEBE impedir la publicación de un modelo mientras falte alguna imagen
  requerida, listando las combinaciones incompletas.
- **FR-013**: El sistema DEBE permitir publicar y despublicar un modelo.
- **FR-014**: El sistema DEBE ofrecer al cliente únicamente los modelos publicados.
- **FR-015**: El sistema DEBE permitir definir las tallas disponibles de cada modelo.

#### Colores

- **FR-016**: El sistema DEBE permitir registrar colores con nombre comercial en ambos idiomas,
  referencia del proveedor, tipo de material y fotografía de la muestra física.
- **FR-017**: El sistema DEBE permitir marcar un color como disponible o agotado.
- **FR-018**: El sistema DEBE ocultar del configurador los colores agotados, conservando su
  referencia en las solicitudes ya enviadas.
- **FR-019**: El sistema DEBE permitir habilitar colores por componente de cada modelo, y DEBE
  impedirlo cuando el material del color no coincida con el del componente.
- **FR-020**: El sistema DEBE ofrecer al cliente únicamente los colores habilitados, disponibles y
  con imágenes cargadas para el componente que está editando.
- **FR-021**: El sistema DEBE mostrar el nombre comercial y la fotografía de la muestra de cada
  color en el selector.
- **FR-022**: El sistema DEBE advertir que el color en pantalla es una representación aproximada
  del color real de la tela.
- **FR-023**: El sistema DEBE impedir eliminar un color usado en alguna solicitud, ofreciendo
  descontinuarlo en su lugar.

#### Configurador

- **FR-024**: El sistema DEBE mostrar la gorra compuesta con el color seleccionado en cada
  componente.
- **FR-025**: El configurador DEBE ofrecer cuatro vistas al cliente —frente, lateral izquierdo,
  lateral derecho y trasera— mediante miniaturas y controles de avance y retroceso, limitadas a
  las vistas que el modelo tenga activas.
- **FR-026**: El sistema DEBE generar la vista del lateral derecho reflejando horizontalmente las
  imágenes de la vista lateral, sin reflejar los elementos decorativos colocados sobre ella.
- **FR-027**: El sistema DEBE conservar la configuración completa del diseño al cambiar de vista.
- **FR-028**: El sistema DEBE reflejar cada cambio de color de forma inmediata y sin recargar la
  página.
- **FR-029**: El sistema DEBE aplicar una configuración de colores por defecto al iniciar.
- **FR-030**: El sistema DEBE permitir restablecer el diseño, solicitando confirmación previa.
- **FR-031**: El sistema DEBE indicar el progreso mientras la gorra se prepara y habilitar la
  interacción solo cuando esté lista, en 5 segundos o menos sobre una conexión móvil 4G típica.
- **FR-031a**: Para cumplir ese plazo, el sistema DEBE preparar primero la vista frontal con los
  colores por defecto y traer las demás vistas y colores en segundo plano.
- **FR-031b**: Cuando el cliente elija un color cuya imagen todavía no está lista, el sistema DEBE
  indicar el progreso de ese componente en lugar de bloquear el configurador completo.
- **FR-032**: El sistema DEBE conservar el diseño en curso, incluido el logotipo cargado, ante una
  recarga del navegador.
- **FR-033**: El sistema DEBE informar cuando un modelo o un color deje de estar disponible
  durante la sesión, indicando qué corregir.

#### Decoración

- **FR-034**: El sistema DEBE permitir al administrador definir, desde el panel y para cada modelo,
  las zonas decorables entre cuatro posiciones —frente, lateral izquierdo, lateral derecho y
  trasera— con sus dimensiones máximas en centímetros reales y su límite de caracteres de texto.
- **FR-035**: El sistema DEBE permitir al administrador definir desde el panel, por zona y por
  modelo, los parámetros de deformación que representan la curvatura de esa superficie, y
  aplicarlos a todo elemento colocado en ella.
- **FR-035a**: El panel DEBE mostrar una vista previa del efecto de la curvatura sobre la imagen
  base del modelo mientras el administrador ajusta los parámetros de una zona.
- **FR-036**: El sistema DEBE permitir registrar las técnicas de decoración y asociarlas a cada
  modelo.
- **FR-037**: El sistema DEBE permitir cargar un logotipo, rechazando los archivos cuyo formato o
  peso no cumpla lo permitido e indicando el motivo.
- **FR-037a**: El sistema DEBE retirar de todo logotipo SVG el contenido ejecutable —scripts,
  manejadores de eventos y referencias a recursos externos— antes de guardarlo, y DEBE rechazar el
  archivo indicando el motivo si tras esa limpieza deja de ser un logotipo válido.
- **FR-037b**: Toda previsualización y toda descarga de un logotipo SVG DEBEN usar el archivo ya
  saneado; el sistema no conserva ni entrega la versión original sin limpiar.
- **FR-038**: El sistema DEBE almacenar el logotipo en el momento de cargarlo, de modo que
  sobreviva a una recarga del navegador y a un reintento de envío.
- **FR-039**: El sistema DEBE eliminar los logotipos que no lleguen a formar parte de una
  solicitud, una vez cumplido el plazo de retención.
- **FR-040**: El sistema DEBE permitir seleccionar la zona donde se ubicará cada elemento
  decorativo, y devolverlo a la posición válida más cercana si se arrastra fuera de ella.
- **FR-041**: El sistema DEBE mostrar cada elemento decorativo con la deformación de su zona, en
  las vistas donde esa zona resulta visible.
- **FR-042**: El sistema DEBE ocultar los elementos decorativos en las vistas donde su zona no es
  visible.
- **FR-043**: El sistema DEBE permitir ajustar el tamaño del logotipo e impedir que exceda los
  límites de su zona.
- **FR-044**: El sistema DEBE permitir agregar texto indicando contenido, tipografía, color y
  tamaño, dentro del límite de caracteres de la zona.
- **FR-045**: El sistema DEBE admitir un único elemento decorativo por zona —logotipo o texto— y
  un máximo de tres zonas decoradas por diseño.
- **FR-046**: El sistema DEBE permitir eliminar un elemento decorativo del diseño.
- **FR-047**: El sistema DEBE permitir seleccionar la técnica de decoración, única para todo el
  diseño.

#### Solicitud

- **FR-048**: El sistema DEBE permitir indicar la cantidad total y distribuirla entre las tallas
  habilitadas del modelo, validando que ambas cifras coincidan.
- **FR-049**: El sistema DEBE mostrar un resumen con modelo, color por componente, elementos
  decorativos, técnica, cantidad y tallas antes de enviar.
- **FR-050**: El sistema DEBE solicitar nombre, correo y teléfono, y la aceptación de la política
  de tratamiento de datos personales.
- **FR-051**: El sistema DEBE permitir agregar comentarios a la solicitud.
- **FR-052**: El sistema DEBE generar un código único e irrepetible al registrar la solicitud y
  mostrarlo al cliente.
- **FR-053**: El sistema DEBE conservar, junto a cada solicitud, una imagen del diseño por cada
  vista y las referencias de material de cada color seleccionado, sin que cambios posteriores al
  catálogo las alteren.
- **FR-054**: El sistema DEBE registrar una única solicitud aunque el envío se dispare más de una
  vez.
- **FR-055**: El sistema DEBE conservar el diseño y permitir reintentar el envío cuando este
  falle.
- **FR-056**: El sistema DEBE notificar por correo la recepción de la solicitud al cliente y al
  administrador.
- **FR-056a**: El registro de la solicitud y el envío del correo son independientes: si la
  solicitud queda registrada, el sistema DEBE mostrar el código al cliente aunque el correo no haya
  podido enviarse, advirtiéndole que puede demorar y que conserve su código.
- **FR-056b**: El sistema DEBE reintentar en segundo plano las notificaciones que fallen y DEBE
  señalar en el listado del panel las solicitudes cuya notificación siga pendiente, para que el
  equipo comercial las atienda igual.

#### Gestión

- **FR-057**: El sistema DEBE requerir autenticación para todas las funciones de administración.
- **FR-058**: El sistema DEBE listar las solicitudes con código, fecha, cliente, cantidad y
  estado, y permitir filtrarlas por estado y por rango de fechas.
- **FR-059**: El sistema DEBE permitir consultar el detalle de una solicitud con las imágenes del
  diseño y su ficha técnica.
- **FR-060**: La ficha técnica DEBE incluir las referencias de material de cada componente y las
  dimensiones reales en centímetros de cada elemento decorativo.
- **FR-061**: El sistema DEBE permitir descargar el logotipo tal como lo cargó el cliente: los
  mapas de bits en su resolución original, y los SVG en su forma saneada (FR-037b), sin
  reescalarlos ni recomprimirlos.
- **FR-062**: El sistema DEBE permitir cambiar el estado de una solicitud, registrando fecha y
  usuario responsable.
- **FR-063**: El sistema DEBE permitir únicamente estas transiciones: Nueva → En revisión →
  Cotizada → Cerrada; y de cualquier estado abierto (Nueva, En revisión o Cotizada) → Rechazada.
  Cerrada y Rechazada son estados finales.
- **FR-064**: El sistema DEBE permitir descargar la ficha técnica en PDF y exportar el listado de
  solicitudes.

#### Datos personales

- **FR-065**: El sistema DEBE solicitar al cliente únicamente nombre, correo, teléfono y
  comentarios opcionales.
- **FR-066**: El formulario DEBE incluir el enlace a la política de privacidad y registrar la
  fecha en que el cliente autorizó el tratamiento de sus datos.
- **FR-067**: Los datos personales DEBEN usarse únicamente para gestionar la solicitud, conforme a
  la Ley 1581 de 2012.
- **FR-068**: Cumplidos 12 meses desde que una solicitud alcanza un estado final (Cerrada o
  Rechazada), el sistema DEBE borrar de ella el nombre, el correo y el teléfono del cliente, y
  conservar el resto —código, diseño, ficha técnica, cantidad y tallas— como histórico anónimo.
- **FR-069**: El sistema DEBE permitir al administrador anonimizar una solicitud en cualquier
  momento a petición del titular de los datos, con el mismo efecto que FR-068 y registrando fecha y
  usuario responsable.
- **FR-070**: El sistema DEBE eliminar el logotipo asociado a una solicitud cuando esta se
  anonimice, por FR-068 o por FR-069.

### Reglas de negocio

- **RN1**: Solo los modelos publicados pueden usarse para crear diseños.
- **RN2**: Un modelo no puede publicarse si falta cualquier imagen requerida por sus componentes
  personalizables, colores habilitados y vistas activas.
- **RN3**: Despublicar un modelo no afecta las solicitudes ya enviadas sobre él.
- **RN4**: Un diseño en curso sobre un modelo despublicado no puede convertirse en solicitud.
- **RN5**: Todas las imágenes de un mismo modelo deben tener dimensiones idénticas.
- **RN6**: Un color solo puede habilitarse en componentes cuyo material coincida con el del color.
  Un color de la carta de hilos de bordado sirve para ojales y costuras, no para la corona.
- **RN7**: Un color agotado desaparece del configurador pero se conserva en las solicitudes ya
  enviadas.
- **RN8**: Un color usado en alguna solicitud no puede eliminarse, solo descontinuarse.
- **RN9**: Cada componente personalizable debe tener al menos un color habilitado y disponible, y
  su color por defecto debe estar entre ellos.
- **RN10**: El color en pantalla es referencial y no compromete coincidencia exacta con la tela
  física. La fotografía de la muestra es la referencia frente a un reclamo.
- **RN11**: Un elemento decorativo solo puede ubicarse dentro de una zona habilitada del modelo.
- **RN12**: Un elemento decorativo no puede exceder las dimensiones máximas de su zona.
- **RN13**: Cada zona admite un único elemento decorativo, sea logotipo o texto, y un diseño
  admite como máximo tres zonas decoradas.
- **RN14**: La técnica de decoración aplica a todo el diseño, no por zona. No puede combinarse
  bordado al frente y DTF atrás.
- **RN15**: El sistema no valida la compatibilidad entre el logotipo y la técnica elegida; esa
  validación es de producción y se resuelve al responder la solicitud.
- **RN16**: El cliente es responsable de los derechos de uso del logotipo, y Brahman Friends puede
  rechazar contenido que infrinja derechos de terceros o resulte ofensivo.
- **RN17**: La suma de las cantidades por talla debe igualar la cantidad total, y solo pueden
  usarse tallas habilitadas para el modelo.
- **RN18**: El envío de una solicitud no genera precio automático ni constituye compromiso de
  venta.
- **RN19**: Al enviarse, el diseño queda congelado: los cambios posteriores en el catálogo o la
  paleta no lo alteran, y no puede modificarse.
- **RN20**: El código de una solicitud es irrepetible y no reutilizable, incluso si la solicitud
  se rechaza.
- **RN20a**: Una solicitud registrada es válida aunque su correo de confirmación no haya salido. El
  correo es un aviso, no la constancia; la constancia es el código.
- **RN21**: Una solicitud solo transita por los estados de FR-063, y todo cambio queda registrado
  con usuario y fecha.
- **RN22**: Los datos personales solo se usan para gestionar la solicitud, conforme a la Ley 1581
  de 2012.
- **RN23**: La finalidad que justifica guardar los datos de contacto se agota cuando la solicitud
  llega a un estado final. Se conservan 12 meses más para poder retomar al cliente, y después la
  solicitud queda anónima. Una solicitud anonimizada no se puede revertir.

### Parámetros de configuración

Estos valores son fijos en la versión 1 y se ajustan por despliegue, no desde el panel. Los
marcados con ⚠ deben confirmarse con la fábrica antes de desarrollar.

Las dimensiones máximas, la curvatura y el límite de caracteres de cada zona **no** están en esta
tabla: se definen por modelo desde el panel (FR-034, FR-035). Los valores de partida sugeridos para
la zona frontal son 11 cm × 5,5 cm y 20 caracteres, y también deben confirmarse con la fábrica.

| Parámetro | Valor de partida |
|-----------|------------------|
| ⚠ Elementos decorativos por zona | 1 |
| ⚠ Zonas decoradas por diseño | 3 |
| ⚠ Formatos de logotipo aceptados | PNG, SVG, JPG |
| ⚠ Peso máximo del logotipo | 5 MB |
| Retención de logotipos sin solicitud | 30 días |
| Retención de datos personales tras estado final | 12 meses |

### Key Entities

- **Modelo**: gorra del catálogo. Nombre bilingüe, código interno, descripción, estado de
  publicación, vistas activas, tallas disponibles.
- **Vista**: una de tres perspectivas fijas del modelo (frente, lateral, trasera). El lateral
  derecho se deriva reflejando la vista lateral.
- **Componente**: pieza del modelo (corona, visera, botón, ojales, costuras). Indica si es
  personalizable y de qué material es.
- **Color**: nombre comercial bilingüe, referencia del proveedor, tipo de material, fotografía de
  la muestra física y disponibilidad.
- **Imagen de componente**: la pieza renderizada para una combinación de vista, componente y
  color. Todas las de un modelo comparten dimensiones.
- **Zona de decoración**: posición decorable de un modelo, con dimensiones máximas en centímetros,
  los parámetros de curvatura de esa superficie y el límite de caracteres del texto que admite.
- **Técnica de decoración**: forma de aplicar el diseño (bordado directo, DTF, etc.), asociada a
  los modelos que la admiten.
- **Diseño**: modelo elegido, color por componente, elementos decorativos y técnica. Vive en el
  navegador del cliente hasta que se envía.
- **Elemento decorativo**: logotipo o texto ubicado en una zona, con su tamaño en centímetros. El
  texto añade contenido, tipografía, color y tamaño.
- **Solicitud**: diseño congelado más cantidad, distribución por tallas, datos de contacto,
  comentarios, código único, estado, historial de cambios de estado, fecha de autorización del
  tratamiento de datos y estado de la notificación por correo. Pasa a anónima cuando se le retiran
  los datos de contacto.
- **Usuario administrador**: quien accede al panel. En esta versión un único rol, que cubre
  también las funciones comerciales.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Con el configurador ya listo, al seleccionar un color de corona la gorra se muestra
  con la corona en ese color en menos de un segundo.
- **SC-002**: Al cambiar de vista, la gorra conserva los colores elegidos en todos los
  componentes.
- **SC-003**: Un color marcado como agotado no aparece en ningún selector del configurador.
- **SC-004**: El selector de un componente solo muestra colores del material que le corresponde.
- **SC-005**: El configurador muestra una miniatura por cada vista disponible, más controles de
  avance y retroceso.
- **SC-006**: La vista del lateral derecho muestra la gorra reflejada y el logotipo de esa zona
  sin reflejar, legible.
- **SC-007**: Al restablecer y confirmar, el diseño vuelve a la configuración por defecto.
- **SC-008**: Al abrir un modelo por primera vez desde un teléfono con 4G, la gorra queda
  interactiva en 5 segundos o menos, mostrando el progreso mientras tanto.
- **SC-009**: Tras recargar la página, el diseño se restaura completo, incluido el logotipo
  cargado.
- **SC-010**: Un archivo PNG válido se acepta y el logotipo aparece en la zona seleccionada.
- **SC-011**: Un archivo que excede el peso permitido se rechaza indicando el límite.
- **SC-012**: Un logotipo colocado al frente no se muestra en la vista trasera.
- **SC-013**: El logotipo se ve adaptado a la curvatura de la gorra en la vista lateral, sin
  cortes en el borde de la zona.
- **SC-014**: Al ampliar un logotipo más allá del límite de su zona, el redimensionamiento se
  detiene.
- **SC-015**: Con tres zonas decoradas, el sistema impide decorar una cuarta e indica el máximo.
- **SC-016**: Al eliminar un elemento de texto, desaparece de todas las vistas y su zona vuelve a
  quedar libre.
- **SC-017**: Una distribución de tallas que no suma la cantidad total impide continuar.
- **SC-018**: El resumen muestra modelo, color por componente, elementos decorativos, técnica,
  cantidad y tallas.
- **SC-019**: Sin correo electrónico válido o sin aceptar el tratamiento de datos, el envío
  permanece bloqueado.
- **SC-020**: Tras enviar, el cliente ve un código único en pantalla y recibe un correo de
  confirmación.
- **SC-020a**: Con el servicio de correo caído, el cliente que envía su solicitud ve igualmente su
  código y el aviso de demora, y esa solicitud aparece en el panel señalada como notificación
  pendiente.
- **SC-021**: Al modificar las imágenes de un modelo, las solicitudes anteriores conservan sus
  imágenes originales.
- **SC-022**: Un usuario no autenticado no puede acceder al panel de administración.
- **SC-023**: Un modelo al que le falta alguna imagen requerida no puede publicarse, y el sistema
  indica qué falta.
- **SC-024**: Un conjunto de imágenes con dimensiones distintas se rechaza indicando la
  discrepancia.
- **SC-025**: El detalle de una solicitud muestra las imágenes del diseño, las referencias de
  material por componente y las medidas reales de cada elemento decorativo.
- **SC-026**: Una solicitud en estado Nueva no puede pasar directamente a Cerrada, y sí puede
  pasar a Rechazada.
- **SC-027**: Cada cambio de estado muestra su fecha y el usuario responsable.
- **SC-028**: El administrador descarga el logotipo tal como lo cargó el cliente: un PNG conserva
  su resolución original y un SVG conserva su dibujo completo.
- **SC-028a**: Un SVG que incluye una acción automática (por ejemplo, una que abriría una ventana
  emergente) se rechaza al cargarlo, o se acepta sin que esa acción llegue a ocurrir ni en el
  configurador ni al abrirlo desde el panel.
- **SC-029**: El configurador es operable en un teléfono de 360 px de ancho.
- **SC-030**: Toda pantalla puede recorrerse completa en español y en inglés, sin textos sin
  traducir.
- **SC-031**: Un cliente que nunca ha visto la herramienta completa un diseño y envía su solicitud
  sin ayuda de nadie del equipo.
- **SC-032**: El equipo comercial cotiza a partir de la solicitud recibida sin necesidad de
  preguntarle nada más al cliente.
- **SC-033**: El administrador define desde el panel las zonas decorables de un modelo nuevo, con
  sus medidas en centímetros y su curvatura, y ve la vista previa del efecto sin ayuda del equipo
  de desarrollo.
- **SC-034**: Al anonimizar una solicitud a petición del cliente, su detalle deja de mostrar nombre,
  correo y teléfono, ya no permite descargar el logotipo, y conserva el código, el diseño y la ficha
  técnica.

## Assumptions

Decisiones tomadas al redactar esta especificación, confirmadas con el responsable del producto:

1. **Alcance frente a la constitution**: la constitution v1.0.0 declaraba carrito y pago dentro de
   la versión 1. Se enmienda para reflejar el alcance real de esta spec (configurador y solicitud
   de cotización, sin pago).
2. **Idioma**: la interfaz es bilingüe español/inglés desde esta versión, tanto para el cliente
   como para el panel. No se muestran precios, así que las dos monedas del Principio II no aplican
   todavía.
3. **Imágenes por color**: el administrador sube una imagen por cada combinación de componente,
   vista y color, en vez de una máscara que el sistema tiñe. Esto da fidelidad máxima al material
   real y exige que la carga masiva de imágenes sea una función de primera clase: con 6
   componentes, 3 vistas y 30 colores son unas 540 imágenes por modelo, y habilitar un color nuevo
   obliga a subir un juego completo.
4. **Curvatura**: cada zona lleva unos pocos parámetros de deformación definidos por el
   administrador, no una malla editable punto por punto.
5. **Vistas**: catálogo fijo de tres (frente, lateral, trasera). El lateral derecho se previsualiza
   reflejando la vista lateral; es una aproximación aceptada, y por eso los elementos decorativos
   no se reflejan con ella.
6. **Zonas**: cuatro posiciones decorables sobre tres vistas, con un máximo de tres decoradas por
   diseño.
7. **Texto y logotipo compiten por la zona**: cada zona admite uno u otro, no ambos.
8. **Valores ⚠**: viven en la configuración del sistema y se ajustan por despliegue. No se
   construyen pantallas de administración para ellos en esta versión. Se exceptúan las dimensiones
   máximas, la curvatura y el límite de caracteres de cada zona: distintos modelos tienen frentes y
   curvaturas distintas, y un frente pequeño no admite el mismo texto que uno grande, así que se
   definen por modelo desde el panel (FR-034, FR-035, FR-044), con vista previa para calibrarlos. Si
   vivieran en el despliegue, publicar un modelo nuevo exigiría intervención de desarrollo y la
   historia 1 dejaría de ser autónoma.
9. **Logotipo**: se sube al servidor en el momento en que el cliente lo elige, y el navegador
   guarda solo la referencia. Es lo único que permite restaurar el diseño tras una recarga y
   reintentar un envío fallido. Obliga a eliminar los archivos que nunca lleguen a solicitud.
10. **Compatibilidad de técnica**: el sistema no analiza el archivo ni advierte sobre número de
    colores o degradados. Solo permite elegir la técnica; producción valida al responder.
11. **Cantidad mínima**: no existe. El cliente indica la cantidad que necesita y la reparte entre
    tallas; el equipo comercial decide al cotizar si el lote es viable.
12. **Estados**: una solicitud puede rechazarse desde cualquier estado abierto, para poder cortar
    temprano casos como el de RN16.
13. **Roles**: un único rol de administración cubre las funciones de administrador y comercial.
    Los usuarios los crea el equipo directamente; no hay autorregistro.
14. **Tipografías**: el conjunto de tipografías para texto es fijo y curado en esta versión.
15. **Vigencia de la cotización**: la cotización se emite y se responde por fuera del sistema, así
    que su vigencia no se modela ni se controla aquí.
16. **Retención de datos personales**: una solicitud cerrada o rechazada conserva los datos de
    contacto 12 meses y después queda anónima. Se eligió anonimizar en vez de borrar la solicitud
    entera para no perder el histórico de qué se cotizó y en qué volumen, que no es dato personal.

## Fuera de Alcance

Esta versión **no** incluye:

- Pago en línea, carrito de compras, checkout ni integración con pasarelas de pago.
- Venta de gorras estándar sin personalización, ni catálogo de colecciones existentes.
- Cálculo automático del precio. El precio lo establece el equipo comercial por fuera del sistema.
- Guardar y recuperar diseños mediante un código. El diseño se conserva solo en el navegador del
  cliente hasta que lo envía.
- Cuentas de cliente, registro ni inicio de sesión para el comprador.
- Flujo de prueba de diseño con versionado, aprobación del cliente y confirmación de pedido. La
  aprobación se gestiona por correo o WhatsApp.
- Visualización en 3D, rotación libre 360° y realidad aumentada. La gorra se muestra mediante
  vistas fijas.
- Vectorización automática de logotipos y edición avanzada de imágenes.
- Análisis automático del logotipo para advertir sobre compatibilidad con la técnica.
- Generación de archivos para maquinaria de bordado ni integración con sistemas de producción.
- Generación de diseños mediante inteligencia artificial.
- Gestión de inventario, proveedores, logística, facturación electrónica y devoluciones.
- Colaboración simultánea de varios usuarios sobre un mismo diseño.
