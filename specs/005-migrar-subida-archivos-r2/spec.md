# Feature Specification: Migración de subida de archivos a Cloudflare R2

**Feature Branch**: `005-migrar-subida-archivos-r2`

**Created**: 2026-08-22

**Status**: Draft

**Input**: User description: "necesito migrar toda la implementacion de vercel blob para subir archivos a claudflare R2, tambien cambiaras el estado del componente de subida de archivos lo haras reutilizable, y la imagen primero se debera precargar y luego se debera subir mediante un boton, el cual mostrara si se subio con exito o si subo algun error mediante una alerta, el archivo debera relacionarse con su respectiva entidad en base de datos pues para guardar la respectiva url  al final tambien me daras una guia de las configuraciones que debo hacer en el panel de claudflare"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Subir la imagen de un color con confirmación explícita (Priority: P1)

Una persona del equipo administrativo está creando o editando un color de tela. Selecciona la
imagen de muestra desde su computador y la ve en pantalla como vista previa antes de que se suba a
ningún lado. Cuando confirma que es la imagen correcta, presiona un botón de "Subir" y el sistema
le avisa con una alerta si la subida fue exitosa o si falló.

**Why this priority**: Es el flujo más simple y frecuente de subida manual de un solo archivo; sirve
de base para el componente reutilizable que usarán las demás pantallas.

**Independent Test**: Se puede probar completamente entrando a editar un color, eligiendo un
archivo de imagen, confirmando la vista previa, presionando "Subir" y verificando que aparece la
alerta de éxito y que la imagen queda asociada al color al guardar.

**Acceptance Scenarios**:

1. **Given** la persona administradora está en el formulario de un color, **When** selecciona un
   archivo de imagen válido, **Then** ve una vista previa de esa imagen en pantalla sin que todavía
   se haya subido a ningún almacenamiento.
2. **Given** la vista previa está visible, **When** presiona el botón de subir, **Then** el sistema
   sube el archivo y, al terminar con éxito, muestra una alerta de éxito y guarda la URL resultante
   asociada al color correspondiente.
3. **Given** la vista previa está visible, **When** presiona el botón de subir y la subida falla,
   **Then** el sistema muestra una alerta de error, no asocia ninguna URL al color y permite volver
   a intentar sin perder la vista previa.
4. **Given** la persona todavía no ha presionado "Subir", **When** intenta guardar el color,
   **Then** el sistema no permite guardar sin que la imagen haya completado su subida.

---

### User Story 2 - Subir la imagen de una vista de modelo con el mismo componente (Priority: P2)

Una persona del equipo administrativo está configurando las vistas (frontal, lateral, trasera) de
un modelo de gorra. Para cada vista activa, sube su imagen base usando exactamente el mismo
componente de precarga, confirmación y alerta que en la pantalla de colores.

**Why this priority**: Confirma que el componente de subida es realmente reutilizable entre
pantallas distintas del panel administrativo, que es un requisito explícito de esta migración.

**Independent Test**: Se puede probar entrando a editar las vistas de un modelo, subiendo la imagen
de una vista con el mismo flujo de precarga y botón, y verificando que queda asociada a esa vista
específica del modelo.

**Acceptance Scenarios**:

1. **Given** la persona administradora está editando las vistas de un modelo, **When** selecciona y
   confirma la imagen de una vista, **Then** el sistema la sube y la asocia a esa vista de ese
   modelo específico, sin afectar las imágenes de otras vistas.
2. **Given** una vista ya tiene imagen, **When** la persona sube una imagen nueva para reemplazarla,
   **Then** el sistema sube el nuevo archivo, actualiza la URL asociada a la vista y dicho reemplazo
   se refleja al guardar.

---

### User Story 3 - Continuidad de las subidas automáticas y masivas sobre el nuevo almacenamiento (Priority: P3)

El resto de flujos de archivos del sistema —la carga masiva de imágenes por modelo que usa el
equipo administrativo, y la subida automática de las vistas compuestas cuando un cliente envía una
solicitud de cotización— siguen funcionando igual que hoy, pero guardando los archivos en el nuevo
proveedor de almacenamiento en vez del actual.

**Why this priority**: Es indispensable para que la migración esté completa (nada debe seguir
apuntando al proveedor anterior), pero no cambia la experiencia de la persona usuaria en estos
flujos, por lo que tiene menor prioridad que los dos anteriores.

**Independent Test**: Se puede probar haciendo una carga masiva de imágenes de un modelo y enviando
una solicitud de cotización de principio a fin, y verificando que todas las URLs guardadas en el
sistema apuntan al nuevo almacenamiento y que las imágenes se ven correctamente.

**Acceptance Scenarios**:

1. **Given** la persona administradora hace una carga masiva de imágenes para un modelo, **When**
   el lote termina de subirse, **Then** todas las imágenes quedan accesibles y sus URLs guardadas
   apuntan al nuevo almacenamiento.
2. **Given** un cliente anónimo termina de personalizar una gorra y envía su solicitud, **When** el
   sistema compone y sube las vistas finales, **Then** esas imágenes quedan accesibles públicamente
   igual que antes, ahora desde el nuevo almacenamiento.

### Edge Cases

- ¿Qué pasa si la persona selecciona un archivo, ve la vista previa, pero cambia de archivo antes de
  presionar "Subir"? El sistema debe reemplazar la vista previa sin haber subido nada todavía.
- ¿Qué pasa si la persona cierra o navega fuera de la pantalla después de precargar la imagen pero
  antes de presionar "Subir"? La imagen nunca se sube y la entidad conserva su URL anterior (si
  tenía una).
- ¿Qué pasa si la subida se completa con éxito pero falla el guardado posterior de la entidad en
  base de datos? El archivo ya subido queda huérfano (sin entidad asociada); este caso se maneja
  igual que hoy, sin limpieza automática adicional.
- ¿Qué pasa si se sube un archivo que no cumple el tipo o tamaño permitido? El sistema rechaza la
  subida antes de completarla y la alerta de error lo explica.
- ¿Qué pasa si la persona presiona "Subir" dos veces seguidas? El sistema evita una segunda subida
  simultánea del mismo archivo mientras la primera está en curso.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema DEBE guardar todo archivo nuevo que se suba (imágenes de color, imágenes
  de vista de modelo, carga masiva de imágenes, vistas compuestas de solicitudes) en el nuevo
  proveedor de almacenamiento, en reemplazo total del proveedor usado hasta ahora.
- **FR-002**: El componente de subida de un solo archivo DEBE ser reutilizable entre, como mínimo,
  la pantalla de edición de color y la de vistas de modelo, sin duplicar su lógica de estados.
- **FR-003**: El componente de subida DEBE mostrar primero una vista previa local del archivo
  seleccionado, sin subirlo, hasta que la persona confirme explícitamente la subida con un botón.
- **FR-004**: Al confirmar la subida, el sistema DEBE mostrar una alerta indicando si la subida
  terminó con éxito o si ocurrió un error, incluyendo un motivo entendible en caso de error.
- **FR-005**: El sistema DEBE asociar la URL del archivo subido con éxito a su entidad
  correspondiente en base de datos (color, vista de modelo, imagen de carga masiva o vista de
  solicitud) solamente después de confirmar que la subida fue exitosa.
- **FR-006**: El sistema NO DEBE permitir guardar una entidad con una subida de archivo que todavía
  está en curso o que falló, hasta que la persona la reintente con éxito o cancele el cambio de
  archivo.
- **FR-007**: El sistema DEBE seguir restringiendo los archivos subidos a los tipos y tamaños ya
  permitidos hoy para cada flujo (por ejemplo, solo imágenes, con su límite de tamaño por caso de
  uso).
- **FR-008**: Las imágenes de producto que hoy son de acceso público (colores, vistas de modelo,
  vistas compuestas de solicitudes) DEBEN seguir siendo accesibles públicamente por URL tras la
  migración, sin degradar la composición de imágenes en el configurador.
- **FR-009**: El sistema DEBE permitir eliminar o reemplazar un archivo previamente subido a una
  entidad, guardando la nueva URL y sin dejar accesible la referencia a la versión reemplazada desde
  esa entidad.
- **FR-010**: Este trabajo DEBE entregar, además del código, una guía en lenguaje sencillo con los
  pasos de configuración que la persona dueña del producto debe completar en el panel de Cloudflare
  para que el almacenamiento quede operativo (creación del bucket, credenciales, dominio/acceso
  público y cualquier otro ajuste necesario).
- **FR-011**: La migración aplica únicamente hacia adelante: todo archivo subido a partir de esta
  migración se guarda en el nuevo almacenamiento; los archivos ya existentes en el proveedor
  anterior conservan su URL actual y siguen sirviéndose desde allí hasta que se reemplacen de forma
  natural (por ejemplo, al subir una nueva imagen para ese color o vista). No se ejecuta una copia
  masiva del histórico como parte de esta migración.
- **FR-012**: La carga masiva de imágenes por modelo conserva su flujo especializado actual
  (selección/arrastre de muchos archivos, detección automática por nombre, revisión en matriz y
  confirmación de todo el lote); únicamente cambia el almacenamiento de destino a R2. El componente
  reutilizable de precarga, confirmación por botón y alerta se aplica a los flujos de un solo
  archivo con interacción directa de la persona usuaria (color, vista de modelo).
- **FR-013**: Los archivos públicos (imágenes de colores, vistas de modelo, vistas compuestas de
  solicitudes) se sirven con URLs públicas permanentes, sin expiración, equivalente al
  comportamiento actual de Vercel Blob, y compatibles con la composición de imágenes en el
  `<canvas>` del configurador sin restricciones de origen cruzado.

### Key Entities *(include if feature involves data)*

- **Color**: color de tela disponible para las gorras; tiene una imagen de muestra (`sampleImageUrl`)
  que debe apuntar al nuevo almacenamiento tras subirse.
- **Vista de modelo**: imagen base de una de las vistas (frontal, lateral, trasera) de un modelo de
  gorra; cada vista activa de un modelo tiene su propia URL de imagen.
- **Imagen de carga masiva**: imagen de un componente/color/vista específico de un modelo, subida en
  lote junto con muchas otras durante la carga masiva.
- **Vista compuesta de solicitud**: imagen final generada al componer el diseño que un cliente
  personalizó, subida automáticamente al enviar una solicitud de cotización.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Ninguna imagen nueva subida desde el panel administrativo o desde el flujo de
  solicitud de cotización queda alojada en el proveedor de almacenamiento anterior tras completar la
  migración.
- **SC-002**: En el 100% de los flujos de subida manual de un solo archivo (color, vista de modelo),
  la persona ve la vista previa antes de subir y una alerta clara de éxito o error después de
  presionar "Subir".
- **SC-003**: Una persona administradora puede subir la imagen de un color o de una vista de modelo
  en menos de 30 segundos, sin necesitar ayuda técnica.
- **SC-004**: Todas las imágenes de producto (colores, vistas de modelo, vistas de solicitud) se
  siguen viendo correctamente en el sitio público y en el configurador después de la migración,
  verificable por una persona no técnica simplemente navegando el sitio.
- **SC-005**: La guía de configuración de Cloudflare permite a la persona dueña del producto dejar el
  almacenamiento operativo siguiendo únicamente los pasos escritos, sin soporte adicional.

## Assumptions

- Los tipos de archivo, tamaños máximos y demás validaciones actuales por flujo (colores, vistas de
  modelo, carga masiva, solicitudes) se conservan igual; esta migración no amplía ni reduce esas
  reglas.
- El componente de subida reutilizable aplica a los flujos de un solo archivo con interacción
  directa de la persona usuaria (color, vista de modelo). La carga masiva conserva su flujo de lote
  actual y solo migra su almacenamiento de destino a R2 (FR-012).
- Los archivos ya existentes en Vercel Blob no se migran como parte de este trabajo; la cuenta de
  Vercel Blob debe seguir activa mientras existan URLs antiguas en uso (FR-011).
- La alerta de éxito o error se muestra dentro de la misma pantalla donde ocurre la subida (no se
  asume un sistema de notificaciones global nuevo).
- El acceso administrativo (sesión de panel) sigue siendo requisito para los flujos de subida que
  hoy lo requieren; esta migración no cambia permisos ni autenticación.
- La guía de configuración de Cloudflare se entrega como documentación para la persona dueña del
  producto, no como automatización dentro de la aplicación.
