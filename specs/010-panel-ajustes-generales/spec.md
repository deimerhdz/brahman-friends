# Feature Specification: Ajustes generales del sitio en el panel administrador

**Feature Branch**: `010-panel-ajustes-generales`

**Created**: 2026-09-13

**Status**: Draft

**Input**: User description: "necesito implementar una seccion de ajustes en el panel administrador para poder ingresar las configuraciones basicas, logotipo, banner del header, configurar seo de la pagina y agregar redes sociales"

## Clarifications

### Session 2026-09-13

- Q: ¿Qué es exactamente el "banner del header"? → A: Una imagen destacada solo en la página de
  inicio, que reemplaza el espacio de vista 3D/marcador de posición actual (no una franja
  promocional en todas las páginas).
- Q: ¿El logotipo y el banner deben tener una imagen distinta por idioma (español/inglés)? → A:
  No; se usa una sola imagen compartida para ambos idiomas.
- Q: ¿Cómo se agregan las redes sociales: lista fija de plataformas conocidas o nombre y enlace
  libres? → A: Lista fija de plataformas conocidas, cada una con su icono reconocible.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Editar la información básica del sitio (Priority: P1)

Una persona administradora entra a la nueva sección "Ajustes" del panel y edita los datos
generales del sitio: nombre del sitio (en español e inglés), correo de contacto y teléfono de
contacto. Guarda los cambios y estos quedan reflejados de inmediato en el sitio público (por
ejemplo, donde hoy aparece el nombre "Brahman Friends" de forma fija).

**Why this priority**: Es la base de la sección: sin poder guardar y ver reflejados los datos
generales, ninguna de las demás configuraciones (logo, banner, SEO, redes) tiene dónde vivir. Es
también el caso más simple para validar que el guardado funciona.

**Independent Test**: Se puede probar por completo entrando a Ajustes, cambiando el nombre del
sitio, guardando, y verificando que el nuevo nombre aparece en el sitio público y en el propio
panel, sin depender de logo, banner, SEO ni redes sociales.

**Acceptance Scenarios**:

1. **Given** la persona administradora está en la sección Ajustes, **When** cambia el nombre del
   sitio en español e inglés y guarda, **Then** el sistema confirma que se guardó y el nuevo
   nombre aparece en el sitio público en el idioma correspondiente.
2. **Given** la persona administradora deja vacío un campo obligatorio (por ejemplo el nombre del
   sitio en un idioma), **When** intenta guardar, **Then** el sistema muestra un error claro y no
   guarda el cambio.
3. **Given** cambios guardados previamente, **When** la persona administradora vuelve a entrar a
   Ajustes, **Then** ve los valores que había guardado, no los valores por defecto.

---

### User Story 2 - Subir y actualizar el logotipo y el banner del header (Priority: P2)

Una persona administradora sube una imagen para usar como logotipo del sitio y otra imagen para
usar como banner destacado que se muestra en el encabezado de la página de inicio. Cada una es una
sola imagen, compartida para las versiones en español e inglés del sitio. Puede reemplazar
cualquiera de las dos imágenes más adelante, y puede quitar una imagen para volver al estado sin
imagen (por ejemplo, texto en lugar de logo).

**Why this priority**: Da identidad visual real al sitio, que hoy solo muestra texto. Depende de
que la sección Ajustes ya exista (User Story 1), pero no depende de SEO ni de redes sociales.

**Independent Test**: Se puede probar subiendo una imagen de logotipo y una de banner, guardando, y
verificando que ambas aparecen en el sitio público en los lugares correspondientes, sin tocar SEO
ni redes sociales.

**Acceptance Scenarios**:

1. **Given** la persona administradora está en Ajustes, **When** sube una imagen válida como
   logotipo y guarda, **Then** esa imagen reemplaza el nombre de texto en el encabezado del sitio
   público y del panel.
2. **Given** la persona administradora está en Ajustes, **When** sube una imagen válida como
   banner del header y guarda, **Then** esa imagen aparece en la zona destacada del encabezado de
   la página de inicio.
3. **Given** un logotipo o banner ya configurado, **When** la persona administradora sube una
   imagen nueva para el mismo lugar, **Then** la imagen anterior se reemplaza por la nueva.
4. **Given** un logotipo o banner ya configurado, **When** la persona administradora lo quita,
   **Then** el sitio vuelve a mostrar el estado sin esa imagen (por ejemplo, el nombre en texto).
5. **Given** la persona administradora intenta subir un archivo que no es una imagen o que supera
   el tamaño permitido, **When** intenta guardar, **Then** el sistema rechaza el archivo con un
   mensaje claro y no reemplaza la imagen existente.

---

### User Story 3 - Configurar el SEO del sitio (Priority: P3)

Una persona administradora completa el título y la descripción que deben aparecer cuando el sitio
se comparte o aparece en buscadores, en español e inglés, y sube una imagen de vista previa para
compartir en redes.

**Why this priority**: Mejora cómo se ve el sitio en buscadores y al compartirlo, pero no bloquea
el uso diario del panel ni de las demás secciones de Ajustes.

**Independent Test**: Se puede probar completando título, descripción e imagen de SEO, guardando, y
verificando (por ejemplo con una herramienta de vista previa de enlaces o viendo el código de la
página) que esos valores aparecen en la página de inicio del sitio público.

**Acceptance Scenarios**:

1. **Given** la persona administradora completa título y descripción de SEO en ambos idiomas y
   guarda, **Then** esos valores aparecen como metadatos de la página de inicio en el idioma
   correspondiente.
2. **Given** la persona administradora sube una imagen de vista previa para compartir en redes,
   **When** guarda, **Then** esa imagen queda asociada como imagen de vista previa del sitio.
3. **Given** los campos de SEO están vacíos, **When** la persona administradora no los completa,
   **Then** el sitio sigue funcionando mostrando un título y descripción por defecto razonables,
   sin dejar la página sin título.

---

### User Story 4 - Agregar y administrar redes sociales (Priority: P4)

Una persona administradora agrega enlaces a las redes sociales del negocio (por ejemplo Instagram,
Facebook, TikTok, WhatsApp), pudiendo agregar varias, editarlas o quitarlas. Estos enlaces aparecen
en el sitio público (por ejemplo en el pie de página).

**Why this priority**: Es la configuración de menor urgencia funcional entre las cuatro pedidas;
el sitio funciona igual sin ella, pero es rápida de construir una vez existe la sección de
Ajustes.

**Independent Test**: Se puede probar agregando un enlace de red social, guardando, y verificando
que aparece visible y clickeable en el sitio público, y que se puede editar o quitar
posteriormente.

**Acceptance Scenarios**:

1. **Given** la persona administradora está en Ajustes, **When** elige una plataforma de la lista
   predefinida y completa su enlace, **Then** el enlace aparece en el sitio público con el icono de
   esa plataforma, apuntando a esa dirección.
2. **Given** una red social ya agregada, **When** la persona administradora edita su enlace o la
   quita, **Then** el sitio público refleja el cambio.
3. **Given** la persona administradora intenta guardar un enlace que no tiene el formato de una
   dirección web válida, **When** intenta guardar, **Then** el sistema muestra un error claro y no
   guarda ese enlace.

---

### Edge Cases

- ¿Qué pasa si dos personas administradoras editan Ajustes al mismo tiempo y guardan cambios
  distintos? El sistema debe conservar el último guardado exitoso sin mezclar datos a medias de
  ambos intentos.
- ¿Qué pasa si se borra el logotipo o el banner sin subir uno nuevo? El sitio debe seguir
  funcionando mostrando el estado sin esa imagen (por ejemplo, el nombre en texto para el logo),
  nunca un espacio roto o un error visible.
- ¿Qué pasa si se guardan los ajustes básicos en un idioma pero no en el otro? El sistema no debe
  permitir guardar con un idioma obligatorio vacío (ver User Story 1, escenario 2).
- ¿Qué pasa si se agrega el mismo tipo de red social más de una vez (por ejemplo dos enlaces de
  Instagram)? El sistema lo permite, mostrando ambos enlaces en el orden en que se agregaron.
- ¿Qué pasa si la persona administradora quiere agregar una plataforma que no está en la lista
  predefinida? El sistema no lo permite en esta versión; debe elegir una de las plataformas de la
  lista. Agregar una plataforma nueva a la lista queda para una iteración futura.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema DEBE mostrar una nueva sección "Ajustes" en la navegación del panel
  administrador, accesible para cualquier persona administradora autenticada.
- **FR-002**: El sistema DEBE permitir editar y guardar el nombre del sitio en español e inglés, un
  correo de contacto y un teléfono de contacto.
- **FR-003**: El sistema DEBE exigir que el nombre del sitio esté completo en ambos idiomas antes
  de permitir guardar (Principio II de la constitution: ningún texto visible se publica a medias
  en un solo idioma).
- **FR-004**: El sistema DEBE permitir subir, reemplazar y quitar una imagen de logotipo del sitio,
  compartida entre las versiones en español e inglés (no una versión por idioma).
- **FR-005**: El sistema DEBE permitir subir, reemplazar y quitar una imagen de banner destacado
  para el encabezado de la página de inicio, compartida entre las versiones en español e inglés
  (no una versión por idioma). El banner aplica únicamente a la página de inicio, no a otras
  páginas del sitio.
- **FR-006**: El sistema DEBE validar que los archivos subidos como logotipo o banner sean
  imágenes en un formato permitido y no superen el tamaño máximo permitido, rechazando el archivo
  con un mensaje claro en caso contrario.
- **FR-007**: El sistema DEBE mostrar el logotipo configurado en el encabezado del sitio público y
  del panel administrador en lugar del nombre en texto, y volver a mostrar el nombre en texto
  cuando no haya logotipo configurado.
- **FR-008**: El sistema DEBE mostrar el banner configurado en la zona destacada del encabezado de
  la página de inicio del sitio público cuando exista, y no mostrar ningún espacio roto cuando no
  exista.
- **FR-009**: El sistema DEBE permitir editar y guardar el título y la descripción de SEO de la
  página de inicio en español e inglés, y una imagen de vista previa para compartir en redes.
- **FR-010**: El sistema DEBE aplicar el título y la descripción de SEO guardados como metadatos de
  la página de inicio del sitio público, en el idioma que corresponda a cada versión de la página.
- **FR-011**: El sistema DEBE mostrar un título y una descripción de SEO por defecto cuando estos
  campos no hayan sido configurados, de forma que la página nunca quede sin título ni descripción.
- **FR-012**: El sistema DEBE permitir agregar, editar y quitar enlaces de redes sociales,
  eligiendo la plataforma de una lista predefinida de redes reconocidas (por ejemplo Instagram,
  Facebook, TikTok, WhatsApp, X/Twitter, YouTube, LinkedIn), más la dirección web del enlace. El
  sistema NO debe permitir escribir libremente un nombre de plataforma fuera de esa lista.
- **FR-013**: El sistema DEBE validar que la dirección de cada red social tenga formato de
  dirección web válida antes de guardar.
- **FR-014**: El sistema DEBE mostrar los enlaces de redes sociales configurados en el sitio
  público (pie de página), cada uno con el icono reconocible de su plataforma y apuntando a la
  dirección guardada.
- **FR-015**: El sistema DEBE conservar los valores guardados previamente al volver a abrir la
  sección Ajustes, de forma que la persona administradora vea el estado real y no un formulario en
  blanco.
- **FR-016**: El sistema DEBE mostrar un mensaje de confirmación al guardar cambios exitosamente y
  un mensaje de error claro cuando el guardado falle, sin perder lo que la persona administradora
  había escrito en el formulario.

### Key Entities

- **Ajustes del sitio**: Registro único que representa la configuración global del sitio. Incluye
  nombre del sitio (ES/EN), correo de contacto, teléfono de contacto, imagen de logotipo (una sola,
  compartida entre idiomas), imagen de banner del header de la página de inicio (una sola,
  compartida entre idiomas), título de SEO (ES/EN), descripción de SEO (ES/EN) e imagen de vista
  previa de SEO. Existe una sola instancia para todo el sitio (no varía por modelo, producto ni
  solicitud).
- **Red social**: Enlace configurado por la persona administradora, compuesto por una plataforma
  elegida de una lista predefinida de redes reconocidas (por ejemplo Instagram, Facebook, TikTok,
  WhatsApp, X/Twitter, YouTube, LinkedIn) y una dirección web. Pueden existir varios, en el orden
  en que se agregaron, asociados a los Ajustes del sitio.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Una persona administradora puede actualizar el nombre del sitio y verlo reflejado en
  el sitio público en menos de 1 minuto desde que guarda el cambio.
- **SC-002**: Una persona administradora puede subir un nuevo logotipo o banner y verlo reflejado
  en el sitio público sin necesitar ayuda técnica ni acceder a ningún sistema fuera del panel.
- **SC-003**: El 100% de los intentos de guardar con un campo obligatorio vacío o un archivo/enlace
  inválido son rechazados con un mensaje que la persona administradora entiende sin ayuda técnica.
- **SC-004**: Después de configurar el SEO, una vista previa de enlace (por ejemplo al compartir la
  URL del sitio) muestra el título, la descripción y la imagen configurados en el idioma
  correspondiente.
- **SC-005**: Una persona administradora puede agregar una red social nueva y verla visible y
  funcional (clickeable, dirige a la dirección correcta) en el sitio público en menos de 1 minuto
  desde que guarda el cambio.

## Assumptions

- "Configuraciones básicas" se interpreta como: nombre del sitio (ES/EN), correo de contacto y
  teléfono de contacto. Si el negocio necesita otros campos básicos (por ejemplo dirección física),
  se agregan en una iteración futura con su propia justificación.
- El logotipo reemplaza el nombre en texto (`t("common.siteName")`) tanto en la barra de
  navegación del sitio público como en la del panel administrador; cuando no hay logotipo, se sigue
  mostrando el nombre en texto como hoy.
- El SEO configurado aplica a la página de inicio del sitio. Configurar SEO específico por cada
  modelo, producto o página interna queda fuera de esta funcionalidad.
- El listado inicial de plataformas de redes sociales incluye Instagram, Facebook, TikTok,
  WhatsApp, X/Twitter, YouTube y LinkedIn. Agregar una plataforma nueva a esa lista requiere una
  actualización futura del sistema, no es configurable por la persona administradora en esta
  versión.
- Cualquier persona administradora autenticada puede editar Ajustes; el sistema actual no
  distingue niveles de permiso entre administradores (según lo verificado en el código existente),
  así que esta funcionalidad no introduce un nuevo nivel de acceso.
- Los límites de tamaño y formato de archivo para logotipo y banner siguen el mismo criterio ya
  usado para otras imágenes subidas en el panel (imágenes PNG, JPEG, SVG o WEBP), sin necesidad de
  definir un caso especial.
- Solo existe una configuración de Ajustes para todo el sitio (no una por idioma ni por marca), ya
  que el negocio opera bajo una sola marca visible ("Brahman Friends").
