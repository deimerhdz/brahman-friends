# Feature Specification: Login de cliente y traducciones por tabla independiente

**Feature Branch**: `002-login-cliente-traducciones`

**Created**: 2026-08-22

**Status**: Draft

**Input**: User description: "necesito implementar una forma de iniciar sesion desde la pagina de inicio para poder ingresar como usuario, tambien quiero mejorar la implemetacion de la parte de multi idioma, quiero almacenar la traducciones en una tabla independiente para cada entidad que tenga actualmente atributos por ejemplo (name_es, name_en) y en los formularios no deben exitir campos duplicados los campos comunes se mantienen y si hay un atributo que necesita traduccion se mantiene un solo campo para todo pero el usuario debera seleccionar mediante un switch es/en para ingresar la respectiva traduccion"

## Clarifications

### Session 2026-08-22

- Q: Cuando un cliente tiene sesión iniciada, ¿su cuenta debe conectarse de alguna forma con las solicitudes de cotización que envía, o el login en esta versión sirve solo para identificarlo sin tocar el flujo de solicitud actual? → A: Solo identificación — el login no cambia el flujo de solicitud de cotización en esta versión.
- Q: Cuando alguien falla varias veces seguidas al iniciar sesión con la misma cuenta, ¿qué tan lejos debe llegar la protección contra intentos repetidos (fuerza bruta)? → A: Bloqueo temporal tras varios fallos — tras un número de intentos fallidos seguidos, el sitio impone una breve espera antes de permitir otro intento con esa cuenta o desde ese origen.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Un cliente inicia sesión desde la página de inicio (Priority: P1)

Una persona que visita la tienda quiere identificarse como cliente para acceder a su cuenta. Desde
la página de inicio, sin tener que buscarlo en otra parte del sitio, puede crear una cuenta nueva
o iniciar sesión con una cuenta existente, y el sitio recuerda que está identificada mientras
navega.

**Why this priority**: Es el punto de entrada de todo lo demás que dependa de tener una cuenta de
cliente. Sin esto no hay forma de saber quién es el visitante.

**Independent Test**: Se puede probar completamente entrando a la página de inicio, creando una
cuenta con nombre, correo y contraseña, cerrando el navegador, volviendo a entrar e iniciando
sesión con esos mismos datos, y confirmando que el sitio muestra que la sesión está activa.

**Acceptance Scenarios**:

1. **Given** un visitante sin cuenta está en la página de inicio, **When** hace clic en el control
   de inicio de sesión y completa el formulario de registro con nombre, correo y contraseña
   válidos, **Then** la cuenta queda creada y el visitante queda identificado como cliente en el
   sitio.
2. **Given** un cliente ya registrado está en la página de inicio, **When** ingresa su correo y
   contraseña correctos en el formulario de inicio de sesión, **Then** el sitio lo reconoce como
   ese cliente y se lo muestra (por ejemplo, mostrando su nombre en lugar del control de inicio de
   sesión).
3. **Given** un cliente registrado, **When** ingresa una contraseña incorrecta, **Then** el sitio
   muestra un mensaje de error genérico sin revelar si el correo existe o no, y no inicia sesión.
4. **Given** alguien intenta registrarse con un correo que ya tiene cuenta, **When** envía el
   formulario de registro, **Then** el sitio rechaza el registro con un mensaje claro y no crea una
   cuenta duplicada.
5. **Given** un cliente con sesión activa, **When** elige cerrar sesión, **Then** el sitio deja de
   reconocerlo como identificado y vuelve a mostrar el control de inicio de sesión.

---

### User Story 2 - Un administrador edita textos traducibles sin campos duplicados (Priority: P2)

Una persona del equipo que administra el catálogo (modelos de gorra, colores, componentes,
técnicas) abre el formulario de edición de uno de estos elementos. En vez de ver dos campos
separados para cada texto traducible (uno en español y otro en inglés, uno debajo del otro),
ve un único campo por atributo, y un switch ES/EN que le permite elegir en qué idioma está
escribiendo. Los campos que no necesitan traducción (por ejemplo un código interno o una
referencia de proveedor) se muestran una sola vez, como hoy.

**Why this priority**: Mejora la experiencia de quien administra el catálogo y ordena cómo se
guarda la traducción, pero el sitio ya funciona sin este cambio (los textos ya se traducen hoy,
solo que con campos duplicados). No bloquea la Historia 1.

**Independent Test**: Se puede probar completamente abriendo el formulario de edición de un color
(o modelo, componente o técnica), cambiando el switch a "EN", escribiendo un nombre en inglés,
cambiando el switch a "ES", escribiendo un nombre en español, guardando, y luego confirmando que
la página pública muestra el nombre correcto en cada idioma al cambiar el idioma del sitio.

**Acceptance Scenarios**:

1. **Given** un administrador abre el formulario de edición de un modelo de gorra existente,
   **When** la pantalla carga, **Then** cada atributo traducible (por ejemplo el nombre y la
   descripción) aparece una sola vez en el formulario, no dos veces.
2. **Given** el formulario de edición está en modo español (switch en "ES"), **When** el
   administrador escribe en el campo de nombre y luego mueve el switch a "EN", **Then** el campo
   muestra el texto en inglés guardado previamente (o vacío si no existe todavía), y el texto en
   español que acababa de escribir no se pierde.
3. **Given** el administrador escribió texto en español y en inglés para el mismo atributo usando
   el switch, **When** guarda el formulario, **Then** ambas versiones quedan almacenadas y
   disponibles, cada una asociada a su idioma.
4. **Given** un administrador intenta guardar un modelo de gorra dejando vacío alguno de sus
   atributos traducibles obligatorios en alguno de los dos idiomas, **When** envía el formulario,
   **Then** el sitio rechaza el guardado y señala qué idioma falta — igual que hoy exige ambos
   idiomas antes de crear el registro — de modo que nunca llega a existir un modelo publicable con
   un idioma incompleto.
5. **Given** los datos de nombre y descripción que existían antes del cambio (por ejemplo
   `name_es`/`name_en` de un color ya creado), **When** se completa la migración a la nueva forma
   de almacenar traducciones, **Then** el sitio público sigue mostrando exactamente el mismo texto
   en español e inglés que mostraba antes, sin pérdida de contenido.

### Edge Cases

- ¿Qué pasa si un cliente intenta iniciar sesión repetidamente con una contraseña incorrecta? Tras
  varios intentos fallidos consecutivos, el sitio impone una breve espera antes de permitir otro
  intento (FR-010c), sin bloquear la cuenta de forma permanente ni revelar información adicional
  sobre por qué falló.
- ¿Qué pasa si un administrador cambia el switch de idioma varias veces sin guardar? El texto
  escrito en cada idioma debe conservarse mientras el formulario siga abierto, sin necesidad de
  guardar entre cada cambio.
- ¿Qué pasa si un cliente ya tiene sesión activa y vuelve a visitar la página de inicio en otra
  pestaña o día distinto? El sitio debe seguir reconociéndolo como identificado mientras la sesión
  no haya expirado o cerrado sesión explícitamente.
- ¿Qué pasa con un componente, técnica o color que ya existía antes del cambio y que solo tenía
  texto en un idioma (si lo hubiera)? La migración debe preservar ese texto tal cual estaba, sin
  inventar ni borrar contenido.
- ¿Qué pasa si dos administradores editan el mismo elemento en idiomas distintos al mismo tiempo?
  Se aplica el mismo comportamiento de "quien guarda último gana" que ya tienen hoy los formularios
  del panel; no se introduce bloqueo de edición concurrente nuevo.

## Requirements *(mandatory)*

### Functional Requirements

**Login de cliente**

- **FR-001**: La página de inicio DEBE mostrar, de forma visible sin necesidad de navegar a otra
  sección, un control para iniciar sesión o registrarse como cliente.
- **FR-002**: El sitio DEBE permitir que un visitante cree una cuenta de cliente nueva
  proporcionando nombre, correo electrónico y contraseña.
- **FR-003**: El sitio DEBE rechazar el registro de una cuenta con un correo que ya está
  registrado, mostrando un mensaje claro, sin crear una cuenta duplicada.
- **FR-004**: El sitio DEBE permitir que un cliente ya registrado inicie sesión con su correo y
  contraseña.
- **FR-005**: El sitio DEBE rechazar intentos de inicio de sesión con credenciales incorrectas
  mostrando un mensaje de error genérico, que no distinga entre "correo no existe" y "contraseña
  incorrecta".
- **FR-006**: El sitio DEBE mantener la sesión del cliente identificada mientras navega por el
  sitio, hasta que cierre sesión explícitamente o la sesión expire.
- **FR-007**: El sitio DEBE permitir que un cliente con sesión activa cierre sesión desde
  cualquier página, volviendo al estado de visitante no identificado.
- **FR-008**: El sitio DEBE almacenar las contraseñas de los clientes de forma que nunca queden
  legibles en texto plano (ni en base de datos ni en registros).
- **FR-009**: Las cuentas de cliente DEBEN mantenerse separadas de las cuentas de administración
  del panel interno; iniciar sesión como cliente no otorga acceso al panel administrativo ni
  viceversa.
- **FR-010**: Todo texto visible de los formularios de registro e inicio de sesión (etiquetas,
  mensajes de error, botones) DEBE existir en español e inglés, siguiendo el idioma activo del
  sitio.
- **FR-010b**: El inicio de sesión de cliente NO DEBE modificar ni vincularse al flujo existente
  de solicitud de cotización (formulario de solicitud, datos de contacto, historial de estados);
  ambos flujos permanecen independientes en esta versión. La cuenta de cliente sirve únicamente
  para identificar al visitante en el sitio.
- **FR-010c**: El sitio DEBE imponer una breve espera antes de permitir un nuevo intento de inicio
  de sesión sobre la misma cuenta (o desde el mismo origen) después de varios intentos fallidos
  consecutivos, sin bloquear la cuenta de forma permanente ni requerir intervención de un
  administrador para levantar la espera.

**Traducciones en tabla independiente**

- **FR-011**: Para cada entidad del catálogo que hoy almacena un mismo atributo repetido por
  idioma (por ejemplo nombre y descripción de modelo de gorra, nombre de color, nombre de
  componente, nombre de técnica), el sistema DEBE almacenar el texto de cada idioma como un
  registro independiente asociado a esa entidad, en lugar de columnas paralelas por idioma.
- **FR-012**: Los atributos que no requieren traducción (por ejemplo código de modelo, referencia
  de proveedor, material, estado) DEBEN seguir mostrándose una sola vez en los formularios, sin
  cambios en su comportamiento.
- **FR-013**: Cada formulario administrativo que edite un atributo traducible DEBE mostrar un
  único campo de entrada por atributo, nunca un campo por idioma.
- **FR-014**: Cada formulario administrativo con atributos traducibles DEBE ofrecer un control tipo
  switch con las opciones "ES" / "EN" que determina en qué idioma se está leyendo o escribiendo el
  contenido de esos campos en ese momento.
- **FR-015**: Cambiar el switch de idioma DEBE mostrar el texto ya guardado (o vacío si no existe)
  para el idioma seleccionado, y DEBE conservar sin pérdida el texto que el administrador haya
  escrito para el otro idioma durante esa misma sesión de edición.
- **FR-016**: Al guardar el formulario, el sistema DEBE persistir el texto introducido para cada
  idioma que haya sido completado, asociado correctamente a su idioma y a la entidad editada.
- **FR-017**: El sistema DEBE impedir que se guarde cualquier elemento del catálogo (por ejemplo un
  modelo de gorra) si alguno de sus atributos traducibles obligatorios no tiene texto en ambos
  idiomas, señalando qué falta — de modo que ningún elemento llega a publicarse con un idioma
  incompleto.
- **FR-018**: La migración al nuevo almacenamiento de traducciones DEBE preservar sin pérdida ni
  alteración todo el contenido de español e inglés que existía antes del cambio.
- **FR-019**: Las páginas de cara al cliente (inicio, configurador) DEBEN seguir mostrando el texto
  correcto en el idioma activo del sitio exactamente igual que antes del cambio, sin regresión
  visible.

### Key Entities *(include if feature involves data)*

- **Cliente**: Persona que se registra e inicia sesión desde la página de inicio para ser
  reconocida por el sitio. Atributos: nombre, correo electrónico (identificador de inicio de
  sesión), contraseña, fecha de registro, estado (activa/inactiva), y un control interno de
  intentos de inicio de sesión fallidos usado solo para el bloqueo temporal de FR-010c. Es un
  tipo de cuenta separado del usuario administrativo del panel.
- **Sesión de cliente**: Representa que un Cliente está identificado mientras navega el sitio.
  Vincula la sesión activa con un Cliente concreto hasta que se cierre o expire.
- **Contenido traducible**: Por cada entidad del catálogo con atributos traducibles (Modelo de
  gorra, Color, Componente, Técnica), el texto de un atributo (por ejemplo nombre o descripción)
  en un idioma concreto (español o inglés), asociado a la entidad dueña del atributo. Reemplaza a
  las columnas paralelas por idioma que existen hoy en cada una de esas entidades.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un visitante nuevo puede crear una cuenta e iniciar sesión desde la página de inicio
  en menos de 2 minutos, sin ayuda externa.
- **SC-002**: Un cliente ya registrado puede iniciar sesión desde la página de inicio en menos de
  30 segundos.
- **SC-003**: El 100% de los formularios administrativos que hoy tienen campos duplicados por
  idioma (color, modelo de gorra, componente, técnica) muestran, después del cambio, un único
  campo por atributo traducible.
- **SC-004**: Un administrador puede completar la traducción de un elemento del catálogo a ambos
  idiomas usando solo el switch ES/EN, sin necesitar ver dos campos simultáneos para el mismo
  atributo.
- **SC-005**: Después de migrar los datos existentes, el 100% de los nombres y descripciones
  mostrados en el sitio público (en ambos idiomas) coinciden exactamente con lo que se mostraba
  antes del cambio.
- **SC-006**: Cero elementos del catálogo quedan publicados con un idioma incompleto después del
  cambio.

## Assumptions

- El inicio de sesión de cliente es un sistema separado del inicio de sesión administrativo del
  panel (`/panel/login`), que se mantiene sin cambios en esta funcionalidad.
- La recuperación de contraseña olvidada ("forgot password") no está incluida en esta versión;
  se documenta como mejora futura a especificar aparte, siguiendo el principio de no construir
  alcance no pedido.
- La verificación de correo electrónico por enlace de confirmación no está incluida en esta
  versión; una cuenta queda activa e identificable apenas se registra.
- El switch ES/EN de los formularios administrativos inicia mostrando el idioma activo actual del
  panel, pero el administrador puede cambiarlo libremente durante la edición.
- Las entidades alcanzadas por el cambio de traducciones son las que hoy tienen atributos
  paralelos por idioma en el modelo de datos: modelo de gorra (nombre, descripción), color
  (nombre), componente (nombre) y técnica (nombre).
- Esta funcionalidad amplía el alcance de la versión 1 descrito en la constitution del proyecto
  (que hoy excluye cuentas de cliente); al aprobarse esta spec, esa exclusión queda superada para
  el login de cliente y puede requerir una enmienda formal de la constitution antes de planear la
  implementación.
- El estado activa/inactiva de una cuenta de cliente es un dato interno del sistema; esta versión
  no incluye una pantalla administrativa para que el equipo gestione o desactive cuentas de
  clientes manualmente.
