# Feature Specification: Formulario de creación de modelo alineado con edición

**Feature Branch**: `008-formulario-creacion-modelo`

**Created**: 2026-09-12

**Status**: Draft

**Input**: User description: "Ajusta el formulario de creacion de los modelo, deberia verse igual que el formulario de edicion y tener los mismos campos pero para crear un nuevo modelo de gorra"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Crear modelo con el mismo formulario que se usa para editar (Priority: P1)

Una persona del equipo administrador entra a "Nuevo modelo" en el panel y ve un formulario con la
misma apariencia y los mismos campos (código, nombre en español e inglés, descripción en español e
inglés, precio) que ve cuando edita un modelo ya existente. Completa esos datos y guarda; el sistema
crea el modelo como borrador y la lleva al mismo configurador de vistas, colores y personalización
que usaría para seguir editando ese modelo.

**Why this priority**: Es el pedido completo de la funcionalidad: hoy el formulario de creación se
ve distinto y tiene menos campos (falta precio) que el de edición, lo que obliga a la persona
administradora a aprender dos pantallas diferentes para la misma tarea.

**Independent Test**: Se puede probar por completo entrando a "Nuevo modelo", llenando código,
nombre, descripción y precio, guardando, y confirmando que el modelo aparece en el listado con esos
datos y que la pantalla de creación se ve igual (mismo diseño, mismos campos, mismo control de
cambio de idioma ES/EN) que la de edición.

**Acceptance Scenarios**:

1. **Given** la persona administradora abre "Nuevo modelo", **When** ve el formulario, **Then**
   encuentra los mismos campos y el mismo estilo visual que en la pantalla de edición de un modelo:
   código, nombre (ES/EN), descripción (ES/EN) y precio.
2. **Given** la persona administradora completa código, nombre en ambos idiomas y precio, **When**
   guarda, **Then** el modelo se crea como borrador con esos datos y la persona es llevada al
   configurador (vistas, colores, personalización) para continuar armando el modelo, igual que hoy.
3. **Given** la persona administradora deja el nombre en español o inglés vacío, **When** intenta
   guardar, **Then** el sistema se lo impide y muestra el mismo aviso de campo requerido que usa la
   pantalla de edición.

---

### User Story 2 - No ver controles que todavía no aplican a un modelo nuevo (Priority: P2)

La persona administradora no debe ver, en el formulario de creación, controles que solo tienen
sentido para un modelo que ya existe: la cantidad mínima de pedido (MOQ) y el interruptor de
publicar/despublicar.

**Why this priority**: Evita confusión y errores: un modelo recién creado no tiene vistas ni
colores configurados, así que publicarlo no es válido, y el MOQ es una decisión que hoy el negocio
toma después de crear el modelo, no al crearlo.

**Independent Test**: Se puede probar abriendo "Nuevo modelo" y confirmando que no aparecen ni el
campo de cantidad mínima de pedido ni el control de estado de publicación, y luego abriendo un
modelo ya creado y confirmando que ahí sí aparecen ambos, sin cambios respecto a hoy.

**Acceptance Scenarios**:

1. **Given** la persona administradora abre "Nuevo modelo", **When** revisa el formulario, **Then**
   no ve el campo de cantidad mínima de pedido (MOQ) ni el control de publicar/despublicar.
2. **Given** la persona administradora abre un modelo ya existente para editarlo, **When** revisa la
   pantalla, **Then** el campo de MOQ y el control de publicación siguen apareciendo igual que hoy.

---

### Edge Cases

- Si la persona administradora intenta guardar sin llenar el nombre en español o en inglés, el
  sistema no crea el modelo y muestra el mismo error que usa hoy la pantalla de edición para ese
  caso.
- Si dos modelos usan el mismo código, el sistema debe rechazar la creación tal como lo hace hoy
  (comportamiento sin cambios).
- Si la persona administradora guarda el encabezado pero abandona antes de subir vistas o configurar
  colores, el modelo queda como borrador y puede retomarlo después desde el listado de modelos, tal
  como ocurre hoy tras crear un modelo.
- Si no se indica un precio, el modelo se guarda sin precio definido, igual que se permite hoy al
  editar.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El formulario de creación de modelo DEBE mostrar los mismos campos que la sección de
  encabezado del formulario de edición: código, nombre (español e inglés), descripción (español e
  inglés) y precio.
- **FR-002**: El formulario de creación DEBE usar la misma disposición visual, estilos y control de
  cambio de idioma (ES/EN) que usa esa sección en la pantalla de edición, de modo que ambas pantallas
  se sientan como la misma interfaz.
- **FR-003**: El campo de código DEBE poder escribirse libremente en el formulario de creación
  (porque el modelo todavía no existe), a diferencia de la pantalla de edición donde ese campo solo
  se muestra de lectura.
- **FR-004**: El formulario de creación NO DEBE mostrar el campo de cantidad mínima de pedido (MOQ)
  ni el control de publicar/despublicar, porque ninguno de los dos aplica a un modelo que aún no
  tiene vistas ni colores configurados.
- **FR-005**: El nombre en español e inglés DEBE seguir siendo obligatorio para guardar, con el
  mismo aviso de validación que usa hoy la pantalla de edición para ese campo.
- **FR-006**: Al guardar el formulario de creación, el sistema DEBE crear el modelo en estado
  borrador con los datos ingresados y llevar a la persona administradora al configurador de vistas,
  colores y personalización de ese modelo, igual que ocurre hoy después de crear un modelo.
- **FR-007**: Si falla la validación o el guardado, el formulario de creación DEBE mostrar el mismo
  tipo de mensaje de error que usa hoy la pantalla de edición, sin crear el modelo.
- **FR-008**: Los pasos de configuración de vistas, colores y personalización siguen sin cambios:
  continúan estando disponibles únicamente después de que el modelo fue creado, exactamente como
  funcionan hoy al editar un modelo.

### Key Entities *(include if feature involves data)*

- **Modelo de gorra**: representa un diseño de gorra del catálogo. Atributos relevantes para esta
  funcionalidad: código (identificador visible, único), nombre en español e inglés, descripción en
  español e inglés, precio, y estado (borrador o publicado). Las vistas, colores y zonas de
  personalización son datos relacionados que se configuran después de que el modelo existe, y no
  cambian con esta funcionalidad.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Una persona administradora puede crear un nuevo modelo de gorra completando el
  formulario de creación en menos de 1 minuto.
- **SC-002**: Al comparar la pantalla de creación con la de edición, los campos código, nombre (ES/EN),
  descripción (ES/EN) y precio se ven y se comportan igual en ambas (mismo orden, estilo y forma de
  cambiar de idioma), verificable a simple vista sin conocimientos técnicos.
- **SC-003**: El formulario de creación nunca muestra el campo de cantidad mínima de pedido ni el
  control de publicar/despublicar, verificable a simple vista.
- **SC-004**: Después de crear un modelo, la persona administradora llega al mismo configurador de
  vistas, colores y personalización que usa hoy para modelos existentes, sin pasos adicionales ni
  pantallas nuevas.

## Assumptions

- Solo se iguala la sección de encabezado (código, nombre, descripción, precio) entre creación y
  edición. Los pasos de vistas, colores y personalización de la pantalla de edición siguen
  apareciendo únicamente después de que el modelo fue creado, porque dependen de que el modelo ya
  exista para guardar imágenes, variantes de color y zonas.
- El modelo se sigue creando en estado "borrador" al guardar el formulario, igual que hoy.
- La cantidad mínima de pedido (MOQ) sigue siendo un campo que solo se define después de crear el
  modelo, según la regla de negocio ya existente; no se agrega a la creación.
- El precio, que hoy no aparece en el formulario de creación, pasa a poder definirse desde la
  creación, igual que se puede editar después.
