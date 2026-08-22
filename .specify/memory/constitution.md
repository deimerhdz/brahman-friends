<!--
Sync Impact Report
- Version change: 1.0.0 → 2.0.0
- Motivo del MAJOR: redefinición del alcance de la versión 1. Se retiran carrito, pago en línea y
  confirmación de pedido, y se sustituyen por configurador y solicitud de cotización, para que la
  constitution deje de contradecir la especificación 001-configurador-gorras.
- Principios modificados:
  - II. Idioma y mercado — las reglas de moneda quedan condicionadas a que existan precios en el
    producto; la versión 1 no muestra ninguno. Las reglas de idioma no cambian.
- Principios sin cambios: I, III, IV, V
- Secciones modificadas: Alcance del Producto (v1), Flujo de Trabajo (paso 4)
- Secciones añadidas: ninguna
- Secciones eliminadas: ninguna
- TODOs pendientes: ninguno

Historial
- 1.0.0 (2026-08-12): ratificación inicial con los cinco principios.
-->

# Brahman Friends Constitution

Brahman Friends es una tienda web para vender gorras: diseños ya establecidos y gorras que el
cliente personaliza desde la página. Este documento define las reglas que gobiernan cómo se
construye el producto. Está escrito para que cualquier persona del equipo, técnica o no, pueda
leerlo y usarlo.

## Core Principles

### I. Simplicidad ante todo

Ante dos soluciones que resuelven lo mismo, se elige SIEMPRE la más simple. Esta es la versión 1
del producto: no se anticipa complejidad para necesidades futuras que todavía no existen.

Reglas concretas:

- Toda herramienta, librería o servicio externo nuevo DEBE justificarse por escrito en el plan;
  sin justificación aceptada, no entra.
- No se construyen abstracciones, capas de configuración ni "puntos de extensión" para casos que
  la spec no pide hoy.
- Si una solución simple tiene un límite conocido (por ejemplo, no escala a mucho volumen), se
  documenta el límite y se avanza; no se resuelve por adelantado.

Razón: cada pieza extra es código que alguien tiene que entender, probar y mantener. En una
versión 1 el costo de equivocarse por complejidad es mayor que el de rehacer algo simple.

### II. Idioma y mercado

El producto está pensado para dos idiomas: inglés y español. Y, cuando muestre precios, para dos
monedas: dólar estadounidense (USD) y peso colombiano (COP).

Reglas concretas:

- Todo texto visible DEBE existir en inglés y en español, tanto para el cliente como para el
  equipo interno. No se lanza una pantalla con un idioma a medias.
- Ningún texto visible se escribe fijo dentro del código; siempre sale del sistema de traducción.
- El cliente DEBE poder cambiar de idioma desde la página, y su elección se respeta mientras
  navega.
- En cuanto el producto muestre un precio, ese precio DEBE llevar su moneda clara (USD o COP) y
  el formato de número propio de cada país. No se muestran cifras sin moneda. La versión 1 no
  muestra precios, así que esta regla todavía no tiene efecto.

Razón: el mercado es bilingüe desde el día uno; agregar idioma después obliga a reescribir
pantallas enteras. La regla de moneda se deja escrita para que, cuando llegue la cotización en
línea, nadie tenga que volver a discutirla.

### III. Cero alcance fantasma

NO se implementa ninguna funcionalidad que no esté escrita en la spec. Si surge una idea nueva,
se propone; no se construye.

Reglas concretas:

- Cada cambio en el código DEBE poder señalar el punto de la spec que lo pide.
- Una idea nueva se anota como propuesta para una versión siguiente y se decide aparte.
- Si al construir se descubre que la spec está incompleta, se detiene el trabajo, se actualiza la
  spec y luego se continúa. No se rellena el hueco improvisando.

Razón: el alcance que nadie pidió es el que nadie prueba, nadie mantiene y nadie usa.

### IV. Verificable por una persona no técnica

Cada criterio de éxito DEBE poder comprobarse usando la aplicación, sin leer código.

Reglas concretas:

- Los criterios se escriben como pasos observables: qué hace la persona, qué ve en pantalla.
- Un criterio que solo se puede verificar mirando código, base de datos o logs NO es válido como
  criterio de éxito; se reescribe.
- Antes de dar una funcionalidad por terminada, alguien la recorre en la app siguiendo esos pasos.

Razón: si el dueño del producto no puede confirmar por sí mismo que algo funciona, no hay forma
honesta de saber que está terminado.

### V. Datos del usuario con respeto

Se pide al cliente solo lo imprescindible para cumplir con lo que compró. Y nunca se ponen claves
ni secretos dentro del código.

Reglas concretas:

- Cada dato personal solicitado DEBE tener un uso concreto ya escrito en la spec (por ejemplo: la
  dirección, para enviar el pedido). Sin uso escrito, no se pide.
- No se pide crear cuenta para acciones que no la necesitan.
- Claves, tokens y contraseñas de servicios viven en variables de entorno, nunca en el
  repositorio. Un secreto filtrado se rota de inmediato.
- Datos de pago sensibles (tarjetas) los maneja el proveedor de pagos; la aplicación no los
  guarda.

Razón: pedir de menos protege al cliente y reduce lo que el proyecto tiene que custodiar.

## Alcance del Producto (v1)

- La versión 1 cubre: elegir un modelo de gorra, personalizarlo, ver el resultado y enviar una
  solicitud de cotización con la información que producción necesita.
- La versión 1 NO incluye carrito, pago en línea ni cálculo de precio. El precio depende de la
  cantidad, la técnica y la disponibilidad del material, y lo establece el equipo comercial por
  fuera del sistema.
- El cliente DEBE poder ver su gorra antes de enviar la solicitud. Lo que ve es lo que se cotiza y
  se produce.
- Cada solicitud enviada DEBE quedar congelada: los cambios posteriores en el catálogo no la
  alteran.
- Todo lo demás (por ejemplo pago en línea, cuentas de cliente, visualización en 3D, programas de
  fidelidad) queda fuera hasta que exista una spec aprobada que lo incluya.

## Flujo de Trabajo

1. Se escribe la spec de la funcionalidad, con criterios de éxito verificables por una persona no
   técnica (Principio IV).
2. Se hace el plan, eligiendo la solución más simple que cumpla la spec (Principio I).
3. Se implementa solo lo que la spec pide (Principio III).
4. Se verifica recorriendo la app en ambos idiomas, y comprobando precios en ambas monedas si la
   pantalla muestra precios (Principio II).
5. Antes de dar por cerrado el trabajo, se revisa que no se hayan agregado secretos al
   repositorio ni campos de datos que la spec no pida (Principio V).

Cualquier persona del equipo puede detener un cambio que viole un principio, indicando cuál.

## Governance

Esta constitution está por encima de cualquier otra práctica o costumbre del proyecto. Si una
herramienta, una guía o una preferencia personal la contradice, gana la constitution.

- **Enmiendas**: se proponen por escrito, explicando qué principio cambia y por qué. Se aplican
  cuando el responsable del producto las aprueba.
- **Versionado**: MAJOR cuando se elimina o se redefine un principio de forma incompatible; MINOR
  cuando se agrega un principio o una sección nueva; PATCH para aclaraciones y correcciones de
  redacción que no cambian el significado.
- **Cumplimiento**: cada revisión de cambios verifica los cinco principios. Una excepción se
  acepta solo si queda escrita en el plan de la funcionalidad, con su motivo y su fecha de
  revisión.

**Version**: 2.0.0 | **Ratified**: 2026-08-12 | **Last Amended**: 2026-08-12
