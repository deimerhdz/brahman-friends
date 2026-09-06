# Feature Specification: Colores propios por modelo

**Feature Branch**: `007-colores-por-modelo`

**Created**: 2026-09-06

**Status**: Draft

**Input**: User description: "por como entiendo el sistema parece que lo configuracion de colores, este definido de forma global, pero deberia configurarse una vez se crea el modelo, porque cada diseño de gorras es diferente y tiene sus variaciones de colores necesito que analices el sistema y hagas los respectivos cambios si tienes alguna duda me consultas"

> **Enmienda (2026-09-06, post-implementación, parte 1)**: durante la implementación, al probar el
> formulario de creación de color en el panel, el usuario pidió simplificarlo: un color de un
> modelo ya no tiene referencia de proveedor, material propio ni estado de disponibilidad — solo
> nombre (por idioma) e imagen de muestra. Esto reemplaza FR-003 y ajusta FR-004: la habilitación
> de un color en un componente ya no exige que el material del color coincida con el del
> componente (esa comparación dejó de tener sentido sin `color.material`); cualquier color propio
> del modelo puede habilitarse en cualquiera de sus componentes personalizables.
>
> **Enmienda (2026-09-06, post-implementación, parte 2)**: el usuario pidió retirar también la
> imagen de muestra — un color es solo su nombre. Se le consultó primero porque esa imagen también
> alimentaba el patrón de relleno del texto personalizado con color en el configurador
> (`lib/design/compose.ts`); confirmó seguir adelante sabiendo que el texto con color ahora se
> dibuja siempre con un color de reserva fijo, sin importar qué color se elija para él. Esto
> reemplaza FR-003 otra vez (solo nombre). Ver data-model.md y tasks.md para el detalle de los
> campos retirados en ambas partes.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Crear colores propios de un modelo (Priority: P1)

Como administrador, cuando edito un modelo de gorra, necesito poder crear los colores de ese diseño (nombre, material, muestra) directamente en la ficha del modelo, sin depender de un catálogo compartido con otros modelos, porque cada diseño tiene sus propias variaciones de color.

**Why this priority**: Es el cambio central que pide el usuario: hoy el catálogo de colores es compartido entre todos los modelos; sin este cambio el resto de historias no tiene sentido.

**Independent Test**: Se puede probar creando un color nuevo dentro de un modelo y verificando que ese color solo aparece y solo puede usarse en ese modelo, nunca al editar otro modelo distinto.

**Acceptance Scenarios**:

1. **Given** un modelo de gorra en edición, **When** el administrador crea un color nuevo (nombre en cada idioma, material, imagen de muestra), **Then** el color queda asociado únicamente a ese modelo y disponible para habilitarlo en los componentes de ese modelo.
2. **Given** un color creado dentro del Modelo A, **When** el administrador edita el Modelo B, **Then** ese color no aparece en la lista de colores del Modelo B.
3. **Given** que ya no existe una sección global de colores, **When** el administrador navega el panel, **Then** la única forma de crear o editar colores es entrando a un modelo específico.

---

### User Story 2 - Migración segura de colores existentes (Priority: P2)

Como administrador, cuando se active este cambio, necesito que los colores que hoy están compartidos entre varios modelos se conviertan automáticamente en copias independientes por modelo, para que ningún modelo publicado cambie de apariencia ni pierda sus imágenes.

**Why this priority**: Sin una migración segura, activar el cambio rompería los modelos ya publicados y las gorras que los clientes ya pueden configurar hoy.

**Independent Test**: Se puede probar tomando un color hoy compartido por dos o más modelos, aplicando la migración, y verificando que cada modelo termina con su propia copia idéntica en apariencia (nombre, material, muestra, estado, imágenes por vista) y que el configurador público de cada modelo se ve exactamente igual que antes.

**Acceptance Scenarios**:

1. **Given** un color compartido hoy por el Modelo A y el Modelo B, **When** se aplica la migración, **Then** el Modelo A y el Modelo B quedan cada uno con su propia copia independiente de ese color, con el mismo nombre, material, muestra, estado e imágenes por vista que tenían antes.
2. **Given** un modelo ya publicado antes de la migración, **When** un cliente abre su configurador después de la migración, **Then** ve exactamente los mismos colores, imágenes y color por defecto que veía antes.
3. **Given** una solicitud de cliente ya enviada antes de la migración (diseño congelado), **When** se aplica la migración, **Then** esa solicitud conserva sin cambios el nombre, material y muestra del color que el cliente eligió en su momento.

---

### User Story 3 - Edición aislada por modelo (Priority: P3)

Como administrador que gestiona varios modelos, necesito que editar, cambiar el estado o eliminar un color dentro de un modelo no afecte a ningún otro modelo, aunque otro modelo tenga un color con el mismo nombre o el mismo origen, para evitar confusiones y cambios accidentales entre diseños distintos.

**Why this priority**: Es la garantía de que el aislamiento por modelo se mantiene en el día a día, después de que la migración inicial ya ocurrió; tiene menor urgencia que las dos historias anteriores porque depende de que ya existan colores propios por modelo.

**Independent Test**: Se puede probar editando o eliminando un color dentro del Modelo A y verificando que el color equivalente del Modelo B (aunque provenga del mismo color compartido original) no se ve afectado.

**Acceptance Scenarios**:

1. **Given** dos modelos con un color equivalente tras la migración, **When** el administrador cambia el nombre, material, muestra o estado de ese color en el Modelo A, **Then** el color correspondiente en el Modelo B permanece sin cambios.
2. **Given** un color propio del Modelo A sin ninguna vista habilitada en ningún componente, **When** el administrador lo elimina, **Then** solo desaparece del Modelo A.

---

### Edge Cases

- Un color que hoy existe en el catálogo global pero no está habilitado en ningún componente de ningún modelo (huérfano): al no tener un modelo al cual asignarse automáticamente, se descarta durante la migración.
- Al eliminar un modelo completo, sus colores propios se eliminan junto con él (ya no hay otros modelos que dependan de ese color, a diferencia del comportamiento actual).
- Dos modelos distintos pueden terminar con colores que se ven idénticos (mismo nombre, misma muestra) tras la migración; el sistema los trata como entidades completamente independientes, sin ningún vínculo entre ellos.
- No existe un atajo para "copiar un color desde otro modelo"; cada modelo construye su propia lista de colores desde cero.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema DEBE permitir crear, editar y eliminar colores únicamente dentro del flujo de edición de un modelo de gorra específico.
- **FR-002**: Cada color DEBE pertenecer exactamente a un modelo de gorra y NO DEBE poder seleccionarse, mostrarse ni reutilizarse desde ningún otro modelo.
- **FR-003**: El sistema DEBE permitir definir, por cada color propio de un modelo, su nombre en cada idioma soportado. *(Enmienda 2026-09-06, parte 2: reemplaza la versión anterior, que incluía imagen de muestra; y esa versión ya había reemplazado la original, que también incluía referencia de proveedor, material y estado de disponibilidad — todo retirado a pedido del usuario tras probar el formulario.)*
- **FR-004**: El sistema DEBE seguir permitiendo habilitar un color propio del modelo para uno o varios de los componentes y vistas de ese mismo modelo, con su imagen específica por vista. *(Enmienda 2026-09-06: ya no exige que el material del color coincida con el del componente — un color no tiene material propio; cualquier color del modelo puede habilitarse en cualquiera de sus componentes personalizables.)*
- **FR-005**: El sistema DEBE retirar del panel de administración la sección independiente de catálogo global de colores; la gestión de colores solo debe ser accesible desde la ficha de cada modelo.
- **FR-006**: Al activarse este cambio, el sistema DEBE migrar automáticamente los colores existentes: por cada modelo que use hoy un color compartido, DEBE crear una copia independiente de ese color (nombre por idioma, material, muestra, estado) perteneciente solo a ese modelo, y DEBE reapuntar las habilitaciones por componente/vista, las imágenes por color y vista, y el color por defecto de ese modelo hacia la nueva copia.
- **FR-007**: Tras la migración, el sistema NO DEBE permitir que editar, cambiar el estado o eliminar un color de un modelo afecte la disponibilidad, apariencia o estado de un color de cualquier otro modelo.
- **FR-008**: El sistema NO DEBE ofrecer, en esta iteración, una función para copiar o reutilizar un color creado en un modelo dentro de otro modelo; cada modelo crea sus colores de forma independiente.
- **FR-009**: Un color que hoy no está habilitado en ningún componente de ningún modelo DEBE descartarse durante la migración, ya que no existe un modelo al cual asignarlo automáticamente.
- **FR-010**: Al eliminar un modelo, el sistema DEBE eliminar también los colores que le pertenecen exclusivamente a ese modelo.
- **FR-011**: Las solicitudes de cliente ya enviadas antes de la migración (diseño congelado) DEBEN conservar sin cambios el nombre, material y muestra del color elegido, independientemente de cómo se reorganicen los colores en la migración.

### Key Entities *(include if feature involves data)*

- **Color**: Una opción de color/material seleccionable para los componentes de una gorra. Pasa de ser compartida entre todos los modelos a pertenecer exclusivamente a un modelo de gorra. Incluye nombre por idioma, material, imagen de muestra y estado de disponibilidad.
- **Modelo de gorra**: Ya existente; a partir de este cambio es dueño exclusivo de su propia lista de colores, en lugar de tomarlos prestados de un catálogo compartido.
- **Componente del modelo**: Ya existente; sigue habilitando colores por vista, pero ahora esos colores solo pueden venir del mismo modelo al que pertenece el componente.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El 100% de los colores nuevos se crean desde la ficha de un modelo, sin que exista ninguna pantalla del panel donde se pueda crear un color fuera del contexto de un modelo.
- **SC-002**: El 100% de los modelos publicados antes del cambio muestran, inmediatamente después de la migración, exactamente los mismos colores, imágenes y color por defecto que mostraban antes (cero regresiones visuales en el configurador público).
- **SC-003**: Editar o eliminar un color en un modelo produce 0 cambios observables en cualquier otro modelo, incluso cuando ambos modelos tenían un color con el mismo nombre antes de la migración.
- **SC-004**: El 100% de las solicitudes de cliente enviadas antes de la migración conservan, en su ficha de solicitud y en su PDF, el mismo nombre y muestra de color que tenían antes del cambio.

## Assumptions

- El catálogo de materiales (la lista fija de materiales disponibles, distinta del catálogo de colores) sigue siendo compartido entre todos los modelos; el usuario solo pidió cambiar el alcance de los colores, no el de los materiales.
- Las solicitudes de cliente ya enviadas no dependen en vivo del catálogo de colores (guardan una copia congelada de nombre, material y muestra en el momento del envío), por lo que la migración de colores no requiere tocar solicitudes existentes más allá de verificar que no se rompan.
- Un color sin ninguna vista habilitada en ningún componente de ningún modelo al momento de la migración no tiene forma de asignarse automáticamente a un modelo, así que se descarta en vez de migrarse.
- No se requiere una función de copiar/duplicar un color hacia otro modelo en esta iteración; cada modelo empieza su lista de colores desde cero (confirmado con el usuario).
- La sección global de colores del panel se elimina por completo, en lugar de conservarse como vista de solo lectura (confirmado con el usuario).
