# Guía de verificación

**Feature**: Configurador de gorras y solicitud de cotización | **Fecha**: 2026-08-12

Dos partes. La **primera** es para quien pone la aplicación a funcionar (una vez). La **segunda** son
los recorridos que comprueban que la versión 1 está terminada, escritos para que los haga cualquier
persona del equipo sin leer código, como exige el Principio IV de la constitution.

---

## Parte 1 — Poner la aplicación a funcionar

### Requisitos previos

- Node.js 22 o superior.
- Una base de datos Postgres (Neon: cuenta gratuita, se crea en 2 minutos y da una cadena de
  conexión).
- Una cuenta de Vercel conectada al repositorio, con el almacenamiento de archivos activado.
- Una cuenta de Resend con el dominio verificado para enviar correo.

### Variables de entorno

Copiar `.env.example` a `.env.local` y rellenar. **Ningún valor de estos entra al repositorio**
(Principio V).

| Variable | Para qué |
|----------|----------|
| `DATABASE_URL` | Conexión a la base de datos |
| `BLOB_READ_WRITE_TOKEN` | Guardar imágenes y logotipos |
| `RESEND_API_KEY` | Enviar los correos de notificación |
| `ADMIN_NOTIFY_EMAIL` | A quién le llega el aviso de solicitud nueva |
| `SESSION_SECRET` | Firmar la sesión del panel |
| `CRON_SECRET` | Proteger las tareas programadas |
| `MAX_LOGO_MB` | 5 (pendiente de confirmar con la fábrica) |
| `LOGO_FORMATS` | `png,svg,jpg` (pendiente de confirmar) |
| `MAX_TEXT_CHARS` | 20 (pendiente de confirmar) |
| `MAX_DECORATED_ZONES` | 3 (pendiente de confirmar) |

### Arrancar en local

```bash
npm install
npm run db:migrate          # crea las tablas
npm run crear-admin         # pregunta nombre, correo y contraseña del primer usuario del panel
npm run dev                 # queda en http://localhost:3000
```

### Comprobaciones automáticas

```bash
npm test                    # reglas de negocio y paridad de traducciones
npm run typecheck
npm run lint
```

`npm test` incluye la prueba que falla si `messages/es.json` y `messages/en.json` no tienen las
mismas claves. Si falla, hay una pantalla con un idioma a medias (Principio II).

### Publicar

Empujar a la rama principal. Vercel publica solo. Antes del primer despliegue, cargar las mismas
variables de entorno en el proyecto de Vercel y dejar programadas las dos tareas: retención (diaria)
y reintento de correos (cada hora).

**Comprobación mínima de que quedó bien publicado**: abrir la dirección desde un teléfono en datos
móviles, y que la portada cargue en ambos idiomas.

---

## Parte 2 — Recorridos de verificación

Antes de empezar hace falta: **un modelo publicado** con al menos un componente personalizable, dos
colores del mismo material, la vista frontal y la lateral activas, una zona frontal definida y dos
tallas. El recorrido A lo crea.

Cada recorrido dice qué hacer, qué debe verse, y qué criterios de éxito de la spec cubre. Un
recorrido con un solo paso que no se cumple **no está terminado**.

---

### A. El administrador publica un modelo *(historia 1)*

1. Entrar a `/es/panel` sin haber iniciado sesión. **Debe negar el acceso** y llevar al login.
   → SC-022
2. Iniciar sesión con el usuario creado por comando.
3. Crear un modelo con nombre y descripción **en español y en inglés**, y su código interno.
4. Activar las vistas frontal y lateral. Comprobar que **la frontal no se puede desactivar**.
5. Registrar dos componentes: uno personalizable de material tela ("Corona") y uno no personalizable.
6. Ir a colores. Crear dos colores de material **tela** y uno de material **hilo de bordado**, cada
   uno con nombre en los dos idiomas, referencia de proveedor y foto de la muestra.
7. Volver al modelo e intentar habilitar el color de hilo de bordado en la Corona.
   **No debe permitirlo.** → SC-004
8. Habilitar los dos colores de tela en la Corona y elegir uno como color por defecto.
9. Cargar la imagen base de cada vista activa.
10. Arrastrar la carpeta con las imágenes de componente. La pantalla debe mostrar **una matriz con lo
    que quedó cargado y lo que falta**.
11. Meter a propósito una imagen de tamaño distinto al resto. **Debe rechazarla e indicar la
    discrepancia.** → SC-024
12. Con una combinación aún sin imagen, intentar publicar. **Debe impedirlo y listar exactamente qué
    falta** (componente, color y vista). → SC-023
13. Completar las imágenes que faltan y publicar. El modelo debe aparecer en la portada del cliente.
14. Definir la zona frontal: medidas en centímetros y las tres perillas de curvatura. Mientras se
    mueven, **la vista previa sobre la imagen del modelo debe cambiar en el momento**. Guardar.
    → SC-033
15. Definir dos tallas.
16. Recorrer los pasos 3 a 15 otra vez en `/en/panel`. **Ningún texto sin traducir.** → SC-030

---

### B. El cliente diseña la gorra *(historia 2)*

Hacerlo **en un teléfono real, con datos móviles**, no en el escritorio.

1. Abrir la portada y entrar al modelo publicado. Cronometrar desde el toque hasta poder cambiar un
   color. **5 segundos o menos**, mostrando el progreso mientras tanto. → SC-008, FR-031
2. Comprobar que el ancho del teléfono no obliga a desplazar la pantalla en horizontal y que todos
   los controles se alcanzan con el pulgar. → SC-029
3. Abrir el selector de la Corona. Debe mostrar **el nombre comercial y la foto de la muestra** de
   cada color, y solo colores de tela.
4. Elegir un color. La gorra debe cambiar **en menos de un segundo y sin recargar la página**.
   → SC-001
5. Comprobar que aparece el aviso de que el color en pantalla es aproximado.
6. Pasar a la vista lateral y volver. **Los colores se conservan.** → SC-002
7. Comprobar que hay una miniatura por vista disponible más botones de avanzar y retroceder.
   → SC-005
8. Desde el panel, marcar como agotado uno de los colores. Recargar el configurador: **ese color no
   aparece en ningún selector**. → SC-003
9. Pulsar restablecer. **Debe pedir confirmación**; al confirmar, la gorra vuelve a los colores por
   defecto. → SC-007

---

### C. El cliente decora *(historia 3)*

1. Subir un PNG válido a la zona frontal. Debe aparecer **adaptado a la curvatura**, no pegado plano.
   → SC-010
2. Pasar a la vista lateral. El logotipo del frente **no debe verse**. → SC-012
3. Poner un logotipo en la zona lateral y comprobar en la vista lateral que **se ve curvado y sin
   cortes en el borde de la zona**. → SC-013
4. Ir a la vista del lateral derecho. **La gorra se ve reflejada y el logotipo se lee normal**, no al
   revés. → SC-006
5. Agrandar un logotipo más allá del límite de su zona. **El redimensionado se detiene.** → SC-014
6. Arrastrar un elemento fuera de su zona. **Vuelve a la posición válida más cercana.**
7. Intentar añadir texto en una zona que ya tiene logotipo. **Debe pedir elegir uno de los dos.**
8. Con tres zonas decoradas, intentar decorar una cuarta. **Debe impedirlo e indicar el máximo.**
   → SC-015
9. Añadir un texto, luego eliminarlo. **Desaparece de todas las vistas y su zona queda libre.**
   → SC-016
10. Intentar subir un archivo de más de 5 MB. **Se rechaza indicando el límite.** → SC-011
11. Subir un SVG con una acción automática dentro (por ejemplo, uno que abriría una ventana
    emergente). **O se rechaza al cargarlo, o se acepta sin que la acción ocurra**, ni en el
    configurador ni al abrirlo después desde el panel. → SC-028a
12. Subir un logotipo con fondo blanco: se muestra tal cual **con la advertencia** de que el fondo se
    producirá.
13. Elegir la técnica de decoración. Comprobar que **es una sola para todo el diseño**.
14. **Recargar la página a propósito.** El diseño debe restaurarse completo, incluido el logotipo.
    → SC-009

---

### D. El cliente envía la solicitud *(historia 4)*

1. Indicar 60 unidades y repartir solo 55 entre las tallas. **No debe permitir continuar** hasta
   cuadrar las 5 restantes. → SC-017
2. Cuadrar las 60. Revisar el resumen: debe mostrar **modelo, color de cada componente, elementos
   decorativos, técnica, cantidad y tallas**. → SC-018
3. Escribir un correo inválido, o no marcar la aceptación del tratamiento de datos. **El envío sigue
   bloqueado.** → SC-019
4. Comprobar que el formulario enlaza a la política de privacidad y que pide **solo** nombre, correo,
   teléfono y comentarios opcionales.
5. Completar y **pulsar enviar dos veces rápido**. Debe registrarse **una sola** solicitud.
6. Debe aparecer un código en pantalla y llegar el correo de confirmación. → SC-020
7. **Prueba del correo caído**: dejar la clave de Resend inválida a propósito y enviar otra
   solicitud. El cliente **ve su código igual**, con el aviso de que el correo puede demorar, y en el
   panel esa solicitud aparece **señalada como notificación pendiente**. → SC-020a
8. **Prueba del modelo despublicado**: con el configurador abierto, despublicar el modelo desde el
   panel; intentar enviar. Debe informar que ya no está disponible y **bloquear el envío**.
9. **Prueba de red caída**: activar el modo avión a mitad del envío. El diseño se conserva y se puede
   reintentar sin volver a configurar nada.

---

### E. El equipo gestiona las solicitudes *(historia 5)*

1. En el panel, ver el listado con código, fecha, cliente, cantidad y estado. Filtrar por estado y
   por rango de fechas.
2. Abrir el detalle. Debe mostrar **las imágenes del diseño, la referencia de material de cada
   componente y las medidas en centímetros de cada elemento decorativo**. → SC-025
3. Con esa pantalla delante, responder: *¿podría cotizar esto sin preguntarle nada más al cliente?*
   Si la respuesta es no, falta algo en la ficha. → SC-032
4. Descargar el logotipo. Un PNG debe conservar su resolución original; un SVG, su dibujo completo.
   → SC-028
5. Descargar la ficha técnica en PDF y comprobar que dice lo mismo que la pantalla.
6. Con la solicitud en estado Nueva, intentar pasarla a Cerrada. **No debe permitirlo.** Pasarla a
   Rechazada: **sí debe permitirlo.** → SC-026
7. Comprobar que cada cambio de estado muestra **su fecha y el nombre de quién lo hizo**. → SC-027
8. **Prueba del congelado**: reemplazar las imágenes del modelo y cambiar el nombre de un color desde
   el panel. Abrir la solicitud anterior: **conserva sus imágenes y sus datos originales**. → SC-021
9. **Prueba de anonimización**: anonimizar una solicitud. Su detalle deja de mostrar nombre, correo y
   teléfono, ya no permite descargar el logotipo, y **conserva código, diseño y ficha técnica**.
   → SC-034
10. Intentar borrar un color usado en una solicitud. **Debe impedirlo y ofrecer descontinuarlo.**
11. Exportar el listado y abrirlo en una hoja de cálculo.
12. Recorrer todo este apartado en inglés. **Ningún texto sin traducir.** → SC-030

---

### F. La prueba final: alguien de fuera

1. Buscar a una persona que **nunca haya visto la herramienta** y que no sea del equipo de
   desarrollo.
2. Darle solo la dirección web, como si llegara desde Instagram.
3. **No ayudarla, no explicarle nada, no responder preguntas.** Solo mirar.
4. Debe completar un diseño y enviar su solicitud sola. → SC-031

Si se atasca, el punto donde se atascó es trabajo pendiente, no un problema de la persona. Este
recorrido es el que decide si la versión 1 está lista para salir.

---

## Cobertura

Los 35 criterios de éxito de la spec (SC-001 a SC-034, más SC-020a y SC-028a) están cubiertos por
los recorridos A a F. Los criterios sin verificar en un recorrido serían alcance que nadie comprueba,
y eso es lo que el Principio IV existe para evitar.
