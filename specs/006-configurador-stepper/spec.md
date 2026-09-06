# Feature Specification: Configurador en pasos

**Feature Branch**: `006-configurador-stepper` (el proyecto aún no usa control de versiones por rama para specs; no se creó rama)

**Created**: 2026-09-02

**Status**: Draft

**Input**: User description: "necesito que implementes tal cual el diseño que aparece en @detail-product/code.html en la pagina del configurador, define cada uno de los pasos, si necesitas incluir alguna feature en el modulo del administrador relacionado al producto me preguntas, y necesito que al finalizar se pueda crear una cotizacion"

## Contexto de negocio

El configurador actual (`001-configurador-gorras`) ya deja al cliente cambiar colores por
componente, decorar con logo o texto y enviar una solicitud de cotización. Esta versión **no
reemplaza ese motor**: cambia la forma en que el cliente lo recorre, pasando de un panel con todo
visible a la vez a un flujo guiado por pasos ("Progressive Disclosure Stepper") tal como lo define
el diseño de referencia.

### Usuarios

- **Cliente**: el mismo de `001-configurador-gorras`. Ya eligió un modelo publicado en el catálogo
  y entra al configurador de ese modelo para personalizarlo y pedir cotización.
- **Administrador/Comercial**: el mismo rol único de `001-configurador-gorras`. Gana una función
  nueva: definir la cantidad mínima de pedido (MOQ) de cada modelo.

## Clarifications

### Session 2026-09-02

- Q: El paso "Fabric Selection" del diseño no existe hoy como algo que el cliente elige — el
  material es hoy un dato fijo por componente. ¿Cómo se implementa? → A: Se crea un catálogo nuevo
  de telas en el panel de administración (nombre bilingüe, descripción, imagen de muestra), el
  administrador la asocia a los modelos que la ofrecen, y el cliente la elige como un paso más del
  configurador. **Superseded por la Enmienda 2026-09-06 (3): el paso y el catálogo de telas se
  eliminaron por completo.**
- Q: El paso "Base Silhouette" del diseño parece un selector de modelo dentro del propio
  configurador, pero hoy el cliente elige el modelo antes de entrar al configurador. ¿Se fusiona el
  catálogo de modelos dentro del stepper? → A: No. Se mantiene la selección de modelo como hoy, en
  el catálogo previo. El paso "Base Silhouette" se elimina del stepper del configurador.
- Q: El diseño muestra un precio fijo por unidad y una cantidad mínima de pedido (MOQ), pero la
  spec vigente prohíbe expresamente el cálculo automático de precio (RN18 de `001-configurador-gorras`).
  ¿Qué se hace con esa parte del diseño? → A: Se elimina la línea de precio del panel. Se conserva
  el control de cantidad, con un mínimo (MOQ) que el administrador define por modelo, y el botón
  final pasa a llamarse "Solicitar cotización" en vez de mostrar un precio.
- Q: En el paso "Personalizar colores", ¿el cliente ve una paleta por cada componente
  personalizable (como hoy) o una única paleta que colorea todos los componentes a la vez (como el
  mockup)? → A: Se conservan varias paletas, una por componente personalizable, cada una mostrada
  con la estética de cuadrícula de swatches del diseño de referencia. No se reduce a una paleta
  única global.
- Q: En el paso "Colocación de logo", ¿se conserva el arrastre y redimensionamiento libre dentro
  de la zona (como hoy) o se reemplaza por selección directa de zona mediante botones, sin ajuste
  fino, como muestra el mockup? → A: Se conserva el arrastre y redimensionamiento libre ya
  construido. Los botones de posición del diseño de referencia se usan solo como atajo para saltar
  a una zona; no reemplazan el ajuste fino de posición y tamaño.
- Q: Cuando el cliente elige una tela en el paso 1, ¿la imagen principal de la gorra cambia para
  reflejar esa tela, o se mantiene sin cambios? → A: Sí cambia: mientras el cliente está en el paso
  de tela, el visor principal muestra la imagen de muestra de la tela resaltada/elegida en lugar de
  la gorra compuesta. Al avanzar al paso de colores, el visor vuelve a mostrar la gorra compuesta
  por colores como ya ocurre hoy; la tela no participa en esa composición por capas. **Superseded
  por la Enmienda 2026-09-06 (3): sin paso de tela, el visor siempre muestra la gorra compuesta.**
- Q: ¿Es obligatorio colocar un logo o texto en el paso 3 antes de avanzar al resumen? → A: No, es
  opcional. El cliente puede llegar al resumen sin decorar la gorra, igual que hoy la decoración es
  independiente de elegir colores (`001-configurador-gorras` Historia 3).

### Enmienda 2026-09-06

Tras implementar y probar el formulario de telas, se retiró el campo de **descripción** (bilingüe)
de la tela: el administrador solo carga nombre bilingüe e imagen de muestra. La validación bilingüe
de un campo que no aportaba nada al cliente ni a producción generaba fricción real en el panel sin
ningún beneficio (RN de simplicidad, Principio I). Afecta FR-001, FR-005 y la entidad `Tela`, más
abajo ya actualizados; ninguna otra decisión de esta spec cambia.

### Enmienda 2026-09-06 (2)

Se invierte el orden de los dos primeros pasos: **colores primero, tela segunda** (antes era al
revés). El paso de colores ya muestra en el visor la gorra compuesta y la actualiza al instante
con cada selección — es una primera pantalla más útil que un paso de tela que, en modelos sin
ninguna tela asociada, aparece vacío. Afecta FR-013 y la lista de pasos, más abajo ya actualizados.
De paso se corrige una inconsistencia de esta misma spec: FR-018 exigía tela elegida como
obligatoria en todos los casos, contradiciendo a FR-007 ("informar sin impedir avanzar" cuando el
modelo no tiene ninguna tela asociada); FR-018 queda corregido para que el paso de tela solo sea
obligatorio si el modelo tiene al menos una tela activa asociada. Ninguna otra decisión de esta
spec cambia — el motor de colores por componente, el drag/resize de logo, el MOQ, etc. se
mantienen igual.

### Enmienda 2026-09-06 (3)

Se elimina por completo el paso de selección de tela, el catálogo de telas del panel de
administración y la asociación modelo–tela: tras construirlo, se decidió que no aporta valor
suficiente para el alcance actual del negocio y se retira en vez de mantenerlo sin uso (RN de
simplicidad, Principio I). Afecta directamente a Historia de Usuario 2 (eliminada de esta spec),
a los FR-001 a FR-009 y FR-006a (eliminados), a la entidad `Tela` y `Modelo–Tela` (eliminadas), y a
SC-004, SC-005, SC-005a, SC-009 y SC-010 (eliminados). El stepper pasa de cuatro a **tres pasos**:
colores, logo, resumen — ya reflejados más abajo. Ninguna otra decisión de esta spec cambia: el
motor de colores por componente, el drag/resize de logo, la técnica de decoración, el MOQ y la
salida hacia la solicitud de cotización se mantienen igual. Las Historias de Usuario 3 y 4
originales se renumeraron a 2 y 3 respectivamente, y la Historia 3 (antes "Administrar el catálogo
de telas y el MOQ del modelo") quedó reducida a solo el MOQ.

## Los pasos del configurador

Con las decisiones anteriores, el stepper queda en **tres pasos** (el diseño de referencia traía
cinco; se eliminó "Base Silhouette" y "Fabric Selection" — la segunda decisión y la Enmienda
2026-09-06 (3) respectivamente):

1. **Personalizar colores**: el cliente ve una paleta en cuadrícula de swatches por cada
   componente personalizable del modelo (una paleta por componente, no una única paleta global) y
   elige el color de cada una, con el mismo comportamiento de disponibilidad y vista previa
   inmediata que ya existe en `001-configurador-gorras` (FR-016 a FR-023 y FR-024 a FR-030 de esa
   spec), adoptando únicamente la estética visual de cuadrícula de swatches del diseño de
   referencia.
2. **Colocación de logo**: el cliente elige entre subir un logotipo o escribir un texto, salta a una
   de las zonas decorables habilitadas para el modelo con un botón de posición (atajo visual del
   diseño de referencia) y luego lo arrastra y redimensiona libremente dentro de esa zona, igual que
   hoy. Elige también la técnica de decoración. Reusa el motor de decoración existente (FR-034 a
   FR-047 de `001-configurador-gorras`) sin cambios de comportamiento; solo cambia la presentación al
   estilo de pasos.
3. **Resumen**: muestra el color de cada componente y el logo/texto elegidos, junto con un
   control de cantidad (con el mínimo MOQ del modelo) y el botón "Solicitar cotización", que lleva
   al cliente al flujo existente de solicitud (cantidad por talla, datos de contacto y envío,
   `001-configurador-gorras` FR-048 a FR-056) con la cantidad de este paso ya sugerida.

Cada paso conserva, del diseño de referencia, el indicador de progreso (número de paso, marca de
verificación al completarse, línea vertical entre pasos), la posibilidad de saltar a un paso ya
visitado haciendo clic en él, y los botones "Atrás" / "Siguiente" fijos en la parte inferior del
panel — reemplazados por "Solicitar cotización" únicamente en el último paso.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Recorrer el configurador paso a paso (Priority: P1)

El cliente entra al configurador de un modelo publicado y ve un único paso activo a la vez —
empezando por los colores — con los pasos futuros visibles pero atenuados y los pasos ya completados
marcados con un check. Avanza con "Siguiente", retrocede con "Atrás" o salta directo a cualquier
paso ya visitado haciendo clic en su indicador. La vista previa de la gorra reacciona de inmediato a
cada cambio, igual que hoy.

**Why this priority**: Es el cambio central que pide esta versión — la forma de navegar el
configurador — y sin él ningún otro paso tiene dónde vivir.

**Independent Test**: Se abre el configurador de un modelo publicado, se confirma que solo el paso
1 está activo y el resto atenuado, se avanza hasta el paso 3 con "Siguiente", se retrocede con
"Atrás" y se salta al paso 2 haciendo clic en su indicador; en todos los casos el contenido mostrado
corresponde al paso seleccionado y la vista previa no pierde lo ya elegido.

**Acceptance Scenarios**:

1. **Given** el configurador recién abierto, **When** carga, **Then** el paso 1 (colores) está
   activo y los pasos 2 y 3 aparecen atenuados y sin marca de completado.
2. **Given** el paso 1 activo con un color elegido por cada componente personalizable, **When** el
   cliente pulsa "Siguiente", **Then** el paso 1 queda marcado como completado y el paso 2 pasa a
   activo.
3. **Given** el cliente en el paso 3, **When** hace clic en el indicador del paso 1, **Then** el
   paso 1 vuelve a mostrarse activo sin perder los colores ya elegidos.
4. **Given** el cliente en el paso 1, **When** pulsa "Atrás", **Then** el botón no tiene efecto
   porque no hay paso anterior.
5. **Given** el cliente en el paso 3, **When** el panel se muestra, **Then** el botón "Siguiente" no
   aparece y en su lugar aparece "Solicitar cotización".

---

### User Story 2 - Administrar el MOQ del modelo (Priority: P1)

El administrador entra al panel y define, por modelo, la cantidad mínima de pedido (MOQ) que el
cliente verá como mínimo en el paso de resumen.

**Why this priority**: Sin este dato el control de cantidad del resumen (Historia de Usuario 3) no
tiene un mínimo real que ofrecer.

**Independent Test**: Se entra al panel, se define el MOQ de un modelo existente, y se verifica que
ese valor aparece como mínimo del control de cantidad en el configurador de ese modelo del lado del
cliente.

**Acceptance Scenarios**:

1. **Given** un modelo publicado, **When** el administrador define su cantidad mínima de pedido,
   **Then** ese valor se refleja como mínimo del control de cantidad en el paso de resumen del
   configurador.

---

### User Story 3 - Pasar del resumen a la solicitud de cotización (Priority: P2)

El cliente llega al paso de resumen, revisa colores y logo, ajusta la cantidad respetando el
MOQ del modelo y pulsa "Solicitar cotización". El sistema lo lleva al flujo existente de solicitud
con la cantidad ya sugerida, donde reparte esa cantidad entre tallas, completa sus datos de contacto
y envía, exactamente como ya funciona hoy.

**Why this priority**: Es el cierre que pide el usuario ("que al finalizar se pueda crear una
cotización"), pero depende de que exista el paso anterior para tener algo que resumir.

**Independent Test**: Con un diseño completo en el paso de resumen, se ajusta la cantidad, se pulsa
"Solicitar cotización", se llega a la pantalla de solicitud con esa cantidad ya cargada, se completa
la distribución por tallas y los datos de contacto, se envía y se confirma que aparece el código de
solicitud.

**Acceptance Scenarios**:

1. **Given** el paso de resumen, **When** el cliente intenta bajar la cantidad por debajo del MOQ
   del modelo, **Then** el sistema no lo permite.
2. **Given** el paso de resumen con colores y logo elegidos, **When** el cliente pulsa
   "Solicitar cotización", **Then** llega al flujo de solicitud existente con la cantidad de este
   paso ya sugerida como punto de partida.
3. **Given** que el cliente llega a la solicitud desde el resumen, **When** revisa el resumen de esa
   pantalla, **Then** ve reflejados los mismos colores y logo que dejó en el configurador.
4. **Given** un modelo despublicado mientras el cliente lo personalizaba, **When** llega al paso de
   resumen, **Then** el sistema informa que el modelo ya no está disponible y no permite continuar a
   la solicitud, igual que ya ocurre hoy (`001-configurador-gorras` FR-033).

---

### Edge Cases

- **Cliente recarga el navegador a mitad del stepper**: el paso en el que estaba, junto con
  colores y logo ya elegidos, se restaura igual que ya ocurre hoy con el diseño completo
  (`001-configurador-gorras` FR-032); no se pierde el progreso por haber cambiado de paso.
- **MOQ del modelo no definido por el administrador**: el sistema usa un mínimo de una unidad hasta
  que el administrador configure el MOQ real de ese modelo.
- **Cliente intenta pulsar "Solicitar cotización" sin haber completado un paso previo** (por
  ejemplo, sin un color elegido para algún componente personalizable): el sistema no lo permite
  hasta que ese paso tenga una selección válida.
- **Cliente llega al resumen sin haber colocado logo ni texto**: el sistema lo permite; el resumen
  y la posterior solicitud reflejan un diseño sin elemento decorativo.

## Requirements *(mandatory)*

### Funcionalidad reutilizada de `001-configurador-gorras`

Este feature no repite ni reemplaza las reglas ya vigentes sobre colores por componente
(FR-016 a FR-030), decoración con logo o texto (FR-034 a FR-047), envío de solicitud (FR-048 a
FR-056), gestión de solicitudes (FR-057 a FR-064) y datos personales (FR-065 a FR-070). Todas
siguen aplicando sin cambios; lo que cambia es la presentación en pasos.

### Funcionalidad nueva

> **Nota (Enmienda 2026-09-06 (3))**: esta spec tuvo originalmente una subsección "Catálogo de
> telas" con FR-001 a FR-009 y FR-006a. Se eliminó por completo junto con el paso de tela; los
> números de requisito no se reutilizan.

#### Cantidad mínima de pedido (MOQ) por modelo

- **FR-010**: El sistema DEBE permitir al administrador definir, por modelo, una cantidad mínima de
  pedido (MOQ).
- **FR-011**: El control de cantidad del paso de resumen DEBE usar el MOQ del modelo como valor
  mínimo por defecto y DEBE impedir bajar de ese mínimo.
- **FR-012**: Si el administrador no ha definido un MOQ para un modelo, el sistema DEBE usar 1 como
  mínimo.

#### Navegación por pasos (stepper)

- **FR-013**: El configurador DEBE presentar la personalización en tres pasos secuenciales:
  colores, logo, resumen — en ese orden (Enmienda 2026-09-06 (3)).
- **FR-014**: El sistema DEBE mostrar en todo momento en cuál de los tres pasos está el cliente,
  cuáles ya completó y cuáles faltan.
- **FR-015**: El sistema DEBE permitir avanzar al siguiente paso, retroceder al anterior, y saltar
  directamente a cualquier paso ya visitado.
- **FR-016**: El sistema DEBE conservar todas las selecciones hechas (colores, logo o texto,
  técnica) al moverse entre pasos en cualquier dirección.
- **FR-017**: El sistema DEBE reemplazar el botón "Siguiente" por "Solicitar cotización" únicamente
  en el último paso (resumen).
- **FR-018**: El sistema DEBE impedir avanzar de un paso a otro mientras el paso actual no tenga una
  selección válida cuando esa selección es obligatoria (al menos un color por componente
  personalizable en el paso 1). El paso 2 (logo) NO tiene selección obligatoria: el sistema DEBE
  permitir avanzar al resumen sin ningún logo ni texto colocado.
- **FR-019**: El paso de resumen DEBE mostrar el color de cada componente y el elemento
  decorativo (logo o texto) elegidos, antes de pasar a la solicitud. Si el cliente no colocó ningún
  logo ni texto, el resumen DEBE indicarlo como "sin decoración" en vez de dejarlo vacío o exigir
  uno.
- **FR-020**: El sistema NO DEBE mostrar precio ni total estimado en ningún paso del configurador.

#### Salida hacia la solicitud de cotización

- **FR-021**: El botón "Solicitar cotización" del paso de resumen DEBE llevar al cliente al flujo de
  solicitud existente (`001-configurador-gorras` FR-048 a FR-056), con la cantidad definida en el
  resumen ya sugerida como punto de partida para la distribución por tallas.
- **FR-022**: Si el modelo dejó de estar publicado mientras el cliente lo configuraba, el sistema
  DEBE informarlo en el paso de resumen y DEBE impedir continuar hacia la solicitud, igual que ya
  ocurre hoy (`001-configurador-gorras` FR-033).

### Key Entities

- **Modelo** *(extiende la entidad ya definida en `001-configurador-gorras`)*: agrega la cantidad
  mínima de pedido (MOQ) que el cliente ve como mínimo al pedir cotización.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Al abrir el configurador de un modelo publicado, el cliente ve un único paso activo
  a la vez, con los pasos futuros visiblemente atenuados.
- **SC-002**: Un cliente que nunca ha visto el configurador reconoce sin ayuda en qué paso está y
  cuántos le faltan, solo mirando el panel.
- **SC-003**: Saltar a un paso ya visitado no hace perder ninguna selección hecha en otros pasos.
- **SC-006**: El control de cantidad del paso de resumen nunca permite un valor menor al MOQ
  definido por el administrador para ese modelo.
- **SC-007**: Ningún paso del configurador muestra un precio o total estimado.
- **SC-008**: Al pulsar "Solicitar cotización", el cliente llega a la pantalla de solicitud con la
  cantidad del resumen ya cargada, sin tener que volver a escribirla.

## Assumptions

1. **La técnica de decoración se sigue eligiendo dentro del paso de logo**, como ya ocurre hoy
   (`001-configurador-gorras` FR-047), aunque el diseño de referencia no la muestra como control
   explícito; el resumen del último paso la incluye igual que hoy.
2. **El paso de resumen no sustituye la pantalla de solicitud existente**: solo la antecede,
   pasándole la cantidad como sugerencia. La distribución por tallas, los datos de contacto y el
   envío siguen ocurriendo donde ya ocurren hoy (`001-configurador-gorras` User Story 4), para no
   duplicar esa lógica ya construida.
3. **El catálogo de modelos no cambia**: el cliente sigue eligiendo el modelo (silueta) antes de
   entrar al configurador, como ya ocurre hoy. El paso "Base Silhouette" del diseño de referencia no
   se construye.
4. **Idioma y accesibilidad**: se mantienen los mismos requisitos ya vigentes en
   `001-configurador-gorras` (bilingüe español/inglés, operable en un teléfono de 360px) para todo
   el contenido nuevo de este feature.
5. **Migración de datos**: los modelos publicados existentes no tendrán MOQ definido al desplegar
   este feature; por eso FR-012 evita que la ausencia de ese dato bloquee al cliente.

## Fuera de Alcance

- Selección de tela: catálogo de telas en el panel, asociación modelo–tela y paso de tela en el
  configurador (Enmienda 2026-09-06 (3): se construyeron y luego se eliminaron por completo).
- Precio, precio estimado o cualquier cálculo automático de costo (se mantiene la decisión de
  `001-configurador-gorras` RN18 y Fuera de Alcance).
- Selección de modelo/silueta dentro del stepper del configurador; se mantiene el catálogo previo
  existente.
- Cambios al motor de composición de imágenes por capas, a las zonas de decoración, a las técnicas
  o a la lógica de envío de solicitud ya construidos en `001-configurador-gorras`.
- Controles de cámara 3D, iluminación de estudio o vista de cuadrícula del diseño de referencia:
  son ambientación visual del mockup, no funcionalidad del producto real (que usa vistas fijas 2D,
  `001-configurador-gorras` Assumption 5).
