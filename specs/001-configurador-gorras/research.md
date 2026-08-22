# Fase 0 — Investigación y decisiones técnicas

**Feature**: Configurador de gorras y solicitud de cotización | **Fecha**: 2026-08-12

La spec no dejó ningún marcador `NEEDS CLARIFICATION`: las doce preguntas abiertas se cerraron en la
sesión de clarificación del 2026-08-12. Este documento no resuelve ambigüedades de negocio, sino
las decisiones técnicas que el plan necesita, cada una con su alternativa descartada y el motivo.

Criterio que gobierna todas: **Principio I, la más simple que cumpla la spec**. Y dos restricciones
del responsable del producto: debe poder publicarse online enseguida, y debe funcionar bien en el
móvil.

---

## 1. Forma del producto y publicación

**Decisión**: una sola aplicación Next.js 15 (App Router) con React 19 y TypeScript, publicada en
Vercel. Cliente y panel comparten dirección y despliegue. Publicar = empujar los cambios.

**Rationale**: el producto es una tienda web con un panel interno; una única aplicación que renderiza
en el servidor da páginas rápidas en móvil sin trabajo extra, y las pocas rutas HTTP que hacen falta
viven en el mismo proyecto. La publicación automática cumple el "online enseguida" sin administrar
servidores.

**Alternativas consideradas**:

- **Frontend y backend separados** (React + API propia): dos despliegues, dos configuraciones y un
  contrato HTTP público para un producto que tiene un solo equipo y un solo ciclo. Rechazado por
  Principio I.
- **Astro o SvelteKit**: igual de válidos, pero el configurador es una pantalla intensamente
  interactiva (arrastrar, redimensionar, deshacer) y React tiene el ecosistema más trillado para
  eso. Sin ventaja que compense el cambio.
- **Sitio puramente estático**: imposible; hay que recibir solicitudes y proteger un panel.

---

## 2. Dónde se guardan las solicitudes y el catálogo

**Decisión**: Postgres gestionado (Neon) accedido con Drizzle ORM. Sin plataforma de servicios por
encima.

**Rationale**: los requisitos son literalmente los de una base de datos relacional: congelar una
solicitud (FR-053), filtrarla por estado y rango de fechas (FR-058), guardar un historial de
cambios con responsable y fecha (FR-062), garantizar que un código no se repita nunca (RN20) y
borrar datos personales a los 12 meses (FR-068). Neon se contrata en minutos, da una cadena de
conexión y aguanta conexiones desde funciones sin servidor, que es cómo se ejecuta la app.

**Alternativas consideradas**:

- **Supabase**: excluido explícitamente por el responsable del producto, y con razón para esta
  versión: trae autenticación, permisos por fila, almacenamiento y tiempo real, y de todo eso solo
  se usaría la base de datos. Es superficie que hay que entender y mantener sin recibir nada en
  cambio.
- **Solicitudes como archivos JSON en el almacenamiento de objetos**: parece más simple y no lo es.
  Filtrar por estado obliga a leer todos los archivos, y dos envíos simultáneos podrían recibir el
  mismo código porque nada lo impide. FR-054 (un solo registro aunque se pulse dos veces) también
  se apoya en una restricción de unicidad de la base de datos.
- **SQLite en el servidor**: el despliegue sin servidor no tiene disco persistente. Habría que
  cambiar de forma de publicar, que es justo lo que se quiere evitar.
- **Prisma en vez de Drizzle**: Prisma añade un paso de generación de código y un motor binario que
  pesa en el arranque de funciones sin servidor. Drizzle es SQL con tipos, sin proceso intermedio.

---

## 3. Dónde se guardan las imágenes y los logotipos

**Decisión**: almacenamiento de objetos (Vercel Blob), con subida directa desde el navegador
mediante una autorización que emite el servidor.

**Rationale**: son tres usos distintos y el mismo mecanismo sirve para los tres: imágenes de modelo
(~540 por modelo, FR-009), logotipos del cliente (FR-038) e imágenes congeladas de cada solicitud
(FR-053). La subida directa evita el límite de tamaño de las peticiones al servidor y hace la carga
masiva mucho más rápida.

**Alternativas consideradas**:

- **Imágenes en el repositorio**: habilitar un color nuevo exigiría un despliegue, y la historia 1
  dejaría de ser autónoma para el administrador.
- **Cloudflare R2 o AWS S3**: más baratos a gran volumen y perfectamente válidos, pero suman una
  cuenta, unas credenciales y una configuración de CORS aparte. A esta escala no compensa; si el
  volumen creciera, cambiar de almacenamiento afecta un solo archivo (`lib/media/storage.ts`).
- **Guardar el logotipo solo en el navegador**: rompe FR-038 y FR-055, porque un reintento de envío
  tras un fallo de red debe poder recuperar el archivo.

---

## 4. Cómo se protege el panel

**Decisión**: usuarios del equipo en una tabla, contraseña guardada como hash, sesión en una cookie
firmada que solo el servidor puede leer. Las cuentas se crean con un comando (`npm run crear-admin`).
Sin librería de autenticación y sin registro público.

**Rationale**: la spec pide exactamente dos cosas —que el panel no esté abierto (FR-057) y que cada
cambio de estado diga quién lo hizo (FR-062)— y las cuentas las crea el propio equipo
(Assumption 13). Eso son unas 60 líneas: verificar contraseña, firmar cookie, leerla en cada
petición del panel.

**Cliente: sin cuentas, en ninguna forma.** No hay registro, ni login, ni contraseña, ni
recuperación de diseños por usuario. El diseño vive en el navegador (FR-032) y la constancia del
envío es el código (RN20a).

**Alternativas consideradas**:

- **NextAuth / Auth.js**: resuelve proveedores externos, verificación de correo y refresco de
  tokens. Nada de eso se necesita: son cuatro personas del equipo con contraseña. Rechazado por
  Principio I.
- **Una única contraseña compartida en variable de entorno**: cumpliría FR-057 con menos código,
  pero no FR-062: sin usuarios no se puede registrar quién rechazó una solicitud. Se descartó por
  requisito, no por gusto.

---

## 5. Cómo se manejan los dos idiomas

**Decisión**: el idioma es parte de la dirección (`/es/...`, `/en/...`). Los textos viven en
`messages/es.json` y `messages/en.json`, y se leen con una función `t()` propia de unas 30 líneas.
Una prueba automática falla si los dos archivos no tienen exactamente las mismas claves.

**Rationale**: el Principio II exige que ninguna pantalla salga con un idioma a medias. Teniendo el
idioma en la ruta, esa comprobación es trivial: se abre `/en/panel/modelos` y se ve. Con dos idiomas
y textos planos, una librería aporta configuración pero no capacidad. Los formatos de fecha y número
los da el navegador (`Intl`), que ya viene incluido.

**Alternativas consideradas**:

- **next-intl / i18next**: la opción estándar y una elección razonable en un proyecto grande. Aquí
  suma una dependencia, un archivo de configuración y un intermediario de peticiones para sustituir
  30 líneas. Rechazada por Principio I; si el proyecto sumara un tercer idioma con plurales
  complejos, se reconsidera.
- **Detección automática de idioma sin idioma en la ruta**: hace imposible enlazar una pantalla en
  un idioma concreto y complica la verificación del Principio II.

**Moneda**: no se construye nada. La versión 1 no muestra precios, así que la regla de USD/COP del
Principio II todavía no tiene efecto.

---

## 6. Cómo se dibuja la gorra

**Decisión**: capas de imágenes apiladas. Un contenedor con la proporción de la imagen y, dentro,
una imagen por componente en el color elegido, superpuestas en orden. Cambiar de color es cambiar
la dirección de una imagen.

**Rationale**: la spec ya decidió que hay una foto por combinación (Assumption 3). Dado eso, esta es
la técnica más simple que existe, y es la que mejor cumple SC-001 (<1 s): la imagen del color ya
está descargada o se descarga sola, sin ningún cálculo. Funciona igual en cualquier móvil, sin
depender de la potencia del dispositivo.

**Alternativas consideradas**:

- **Máscaras teñidas por código** (una imagen en gris que se colorea): ahorraría el 95 % de las
  imágenes, pero pierde la fidelidad del material real —la textura de la tela y su reflejo cambian
  con el color— y la spec eligió fidelidad conscientemente. Además obligaría a un componente de
  dibujo por canvas para todo, no solo para la decoración.
- **Canvas o WebGL para la gorra completa**: innecesario. La gorra base no se deforma; solo los
  elementos decorativos lo hacen.

---

## 7. Cómo se cumple el plazo de 5 segundos en 4G

**Decisión**: presupuesto de carga en tres pasos.

1. La página del configurador llega ya con la vista frontal y los colores por defecto marcados como
   prioritarios (FR-031a).
2. Mientras el cliente mira, se descargan en segundo plano las otras vistas y las imágenes de los
   demás colores del componente que está abierto.
3. Si el cliente se adelanta y elige un color cuya imagen aún no llegó, se muestra el progreso de
   **ese componente**, no del configurador entero (FR-031b).

Las imágenes se sirven optimizadas (WebP/AVIF según el navegador) por el optimizador de imágenes de
Next.js, que las convierte al vuelo desde el PNG que subió el administrador. No hay proceso de
preparación de imágenes que mantener.

**Rationale**: en 4G el cuello de botella son los bytes, no el procesador. Con la vista frontal en
WebP a una resolución razonable, el primer render entra cómodamente en el presupuesto; el resto es
invisible porque llega mientras el cliente decide.

**Alternativas consideradas**:

- **Descargar las 540 imágenes al abrir**: rompe el plazo por dos órdenes de magnitud.
- **Convertir a WebP al subir y guardar las dos versiones**: duplica el almacenamiento y añade un
  paso al proceso de carga masiva, para ahorrar un servicio que ya viene incluido.
- **Vídeo o sprite con todas las combinaciones**: imposible de mantener con 30 colores y una carga
  de imágenes por parte del administrador.

**Cómo se verifica sin leer código** (Principio IV): con las herramientas del navegador en modo
"Fast 4G", o directamente con un teléfono en datos móviles, cronometrando desde el toque hasta que
se puede cambiar un color. Está escrito así en [quickstart.md](./quickstart.md).

---

## 8. Cómo se adapta un logotipo a la curvatura de la gorra

**Decisión**: deformación por tres parámetros por zona, definidos por el administrador
(FR-034/FR-035): **arco** (cuánto se curva verticalmente), **inclinación** (cuánto se aleja el borde
superior) y **estrechamiento** (cuánto se comprime hacia los lados). El elemento decorativo se
dibuja en un `<canvas>` cortándolo en franjas verticales; cada franja se desplaza y escala según una
curva calculada con esos tres valores. Son ~50 líneas en `lib/design/warp.ts`, sin dependencias.

**Rationale**: la spec ya acotó el problema (Assumption 4: "unos pocos parámetros, no una malla
editable"). Tres parámetros bastan para una superficie curva simple como el frente o el lateral de
una gorra, se calibran en minutos con la vista previa que pide FR-035a, y la misma función se
reutiliza en tres sitios: el configurador, la vista previa del panel y la imagen congelada de la
solicitud. Al ser una función matemática pura, se prueba automáticamente.

**Alternativas consideradas**:

- **Solo transformaciones CSS** (`perspective`, `rotateX`): gratis y sin canvas, pero no puede
  arquear una imagen —solo inclinarla en bloque—, así que el logo se vería pegado plano y SC-013
  fallaría.
- **Filtro SVG con mapa de desplazamiento**: puede arquear, pero se comporta distinto entre
  navegadores móviles y es difícil de razonar al calibrar. Peor para el administrador.
- **WebGL con una malla real**: la solución "correcta" en un configurador 3D, y desproporcionada
  aquí: la spec descartó el 3D explícitamente y esto suma una dependencia gráfica, un modelo por
  gorra y un modo de fallo nuevo en móviles antiguos.
- **Texto curvado con SVG `textPath`**: excelente para texto, pero haría que texto y logotipo se
  deformaran por caminos distintos y se vieran inconsistentes en la misma gorra. Se usa la misma
  deformación para ambos.

---

## 9. Cómo se produce la imagen que queda guardada en la solicitud

**Decisión**: el navegador del cliente compone cada vista en un `<canvas>` —las capas de la gorra
más los elementos decorativos ya deformados— y sube el resultado como PNG antes de registrar la
solicitud (FR-053).

**Rationale**: garantiza que lo que el equipo comercial abre meses después es exactamente lo que el
cliente vio, que es el compromiso del Alcance del Producto ("lo que ve es lo que se cotiza"). Y
evita por completo tener que volver a dibujar la gorra en el servidor.

**Alternativas consideradas**:

- **Navegador sin ventana en el servidor** (Puppeteer/Playwright): el enfoque habitual para
  "captura de pantalla del lado servidor". Añade un servicio pesado, lento y caro de mantener, para
  reproducir lo que el navegador del cliente ya tiene en pantalla.
- **Composición con una librería de imágenes en el servidor** (sharp): habría que reimplementar la
  deformación y el apilado en el servidor, es decir, dos versiones de la misma lógica que pueden
  divergir. Justo el riesgo que señala la tabla de trazabilidad del plan.
- **Guardar solo la descripción del diseño y volver a dibujarlo al abrirlo**: rompe RN19 y SC-021,
  porque si el administrador reemplaza las imágenes del modelo, la solicitud antigua cambiaría.

**Detalle a cuidar al implementar**: para que el canvas pueda leer las imágenes del almacenamiento
hay que servirlas con permiso de origen cruzado y cargarlas con `crossOrigin="anonymous"`; si no, el
canvas queda "manchado" y no deja exportar. Es la trampa clásica de este enfoque.

---

## 10. Cómo se limpia un logotipo SVG

**Decisión**: `isomorphic-dompurify` en el servidor, en el momento de la subida. Se guarda solo la
versión limpia; si tras la limpieza el archivo ya no es un SVG con contenido dibujable, se rechaza
indicando el motivo (FR-037a, FR-037b).

**Rationale**: es la única decisión de este plan donde la simplicidad cede ante otro criterio: un
SVG malicioso subido por un cliente se ejecutaría en el navegador del administrador al abrir el
panel. Escribir el saneador a mano es un error conocido —las listas de vectores de ataque son largas
y cambian—, así que se usa la librería estándar de la industria y se mantiene actualizada.

**Alternativas consideradas**:

- **Rechazar SVG y aceptar solo PNG/JPG**: sería lo más simple, pero la sesión de clarificación
  decidió conservar el SVG saneado, porque un logo vectorial es exactamente lo que producción
  quiere recibir.
- **Filtro propio con expresiones regulares**: falso ahorro. Los vectores de ataque en SVG incluyen
  entidades, referencias externas y atributos de evento en mayúsculas mezcladas; una expresión
  regular los pierde.
- **Convertir el SVG a PNG al subirlo**: destruye la ventaja del vector, que es justo lo que FR-061
  quiere entregar a producción.

---

## 11. Cómo se genera la ficha técnica en PDF

**Decisión**: `pdf-lib` en una ruta del servidor. Recibe el código de la solicitud, arma el
documento con los datos ya guardados y devuelve el archivo (FR-064).

**Rationale**: es una librería pequeña, sin dependencias del sistema, que corre en el mismo entorno
sin servidor que el resto de la app. La ficha es un documento de estructura fija —datos, tabla de
componentes, medidas, imágenes—, así que no hace falta motor de plantillas.

**Alternativas consideradas**:

- **Una página con estilos de impresión y "Guardar como PDF" del navegador**: cero dependencias,
  pero FR-064 pide *descargar la ficha en PDF*, y depender de que cada persona configure bien el
  diálogo de impresión produce fichas distintas según quién la genere. Producción trabaja con ese
  documento; conviene que sea siempre el mismo.
- **Navegador sin ventana para imprimir a PDF**: mismo problema de peso que en la decisión 9.
- **jsPDF en el navegador**: viable, pero pone la generación en el móvil del administrador y hace
  imposible enviar la ficha adjunta por correo más adelante.

**Exportación del listado** (también FR-064): archivo CSV generado en el servidor, sin librería.
Abre en Excel y en Google Sheets.

---

## 12. Correo de notificación y su reintento

**Decisión**: Resend para enviar (FR-056). La solicitud guarda el estado de su notificación:
`pendiente`, `enviada` o `fallida`. Una tarea programada cada hora reintenta las pendientes y
fallidas. El panel marca visualmente las que siguen sin notificar (FR-056b).

**Rationale**: registrar la solicitud y avisar por correo son independientes por decisión de la spec
(FR-056a, RN20a). Con una columna de estado y un reintento programado se cumple el requisito
completo sin ninguna pieza de infraestructura adicional.

**Alternativas consideradas**:

- **Cola de mensajes** (SQS, Upstash QStash, Inngest): la respuesta estándar a "reintentar en
  segundo plano". Para decenas de solicitudes al mes es un servicio entero, unas credenciales y un
  panel más que vigilar, haciendo lo que hace una columna y una tarea horaria.
- **SMTP propio**: entregar correo transaccional sin caer en spam exige reputación de dominio y
  configuración de DNS que un servicio ya resuelve.
- **Enviar el correo dentro del registro de la solicitud**: violaría FR-056a, porque un fallo del
  correo tumbaría el envío del cliente.

---

## 13. Retención y olvido de datos personales

**Decisión**: una tarea programada diaria (Vercel Cron) que hace dos cosas: anonimiza las
solicitudes que llevan 12 meses en estado final (FR-068) y borra los logotipos que nunca llegaron a
formar parte de una solicitud pasados 30 días (FR-039). El administrador puede anonimizar antes a
petición del titular (FR-069), y anonimizar borra el logotipo (FR-070).

**Rationale**: el Principio V habla de respeto por los datos, y respeto quiere decir construido, no
prometido. Programado, ocurre solo; a mano, depende de que alguien se acuerde.

**Alternativas consideradas**:

- **Borrar la solicitud completa a los 12 meses**: la spec eligió anonimizar (Assumption 16) para
  conservar el histórico de qué se cotizó y en qué volumen, que no es dato personal.
- **Hacerlo a mano cuando el cliente lo pida**: no cumple FR-068, que es un plazo automático.

**Nota de implementación**: la ruta de la tarea programada se protege con un secreto en variable de
entorno, para que no se pueda disparar desde fuera.

---

## 14. Carga masiva de imágenes del modelo

**Decisión**: el administrador arrastra una carpeta completa. El navegador lee los nombres de
archivo con el convenio `vista_componente_color.png`, muestra una matriz con lo que quedó asignado y
lo que falta, valida que todas las dimensiones coincidan (FR-011) y sube en paralelo directo al
almacenamiento. Los archivos que no encajan en el convenio se listan aparte para asignarlos a mano.

**Rationale**: es el mayor esfuerzo real de la versión 1 —el checklist de la spec ya lo señaló— y la
diferencia entre una tarde y una semana de trabajo del administrador está en poder soltar la carpeta
entera. La matriz de faltantes es además lo que hace verificable FR-012 y SC-023.

**Alternativas consideradas**:

- **Un formulario por imagen**: 540 formularios por modelo. Inviable.
- **Deducir la combinación analizando el contenido de la imagen**: fantasía, y alcance que la spec
  no pide.
- **Validar dimensiones en el servidor**: se hace en el navegador (leyendo el encabezado de la
  imagen antes de subir) para rechazar en el momento y no gastar la subida. El servidor vuelve a
  comprobarlo al registrar, porque un cliente no es una fuente confiable.

---

## 15. Cómo sobrevive el diseño a una recarga

**Decisión**: el diseño en curso se guarda en el navegador (`localStorage`) como una descripción
compacta: modelo, color por componente, técnica y, por cada elemento decorativo, su zona, tamaño,
posición y —si es un logotipo— la referencia del archivo ya subido al servidor. Al volver, se
reconstruye desde ahí (FR-032, FR-055).

**Rationale**: cumple el requisito sin necesitar ninguna sesión de cliente ni ningún registro en el
servidor. El logotipo es la única pieza que no puede vivir en el navegador con garantías, y por eso
la spec decidió subirlo en el momento (Assumption 9).

**Alternativas consideradas**:

- **Guardar el logotipo en el navegador** (IndexedDB, base64): un archivo de 5 MB en base64 revienta
  el límite de `localStorage`, e IndexedDB añade complejidad para un archivo que de todos modos hay
  que subir al enviar.
- **Guardar el borrador en el servidor**: exigiría identificar al cliente, es decir, cuentas o
  cookies de seguimiento. Contradice el Principio V y el alcance de la spec.
- **No guardar nada**: el edge case de la recarga accidental está escrito en la spec y SC-009 lo
  mide.

---

## 16. Interacción táctil en móvil

**Decisión**: arrastrar y redimensionar con eventos de puntero (`pointerdown/move/up`), que unifican
ratón y dedo en una sola implementación. Redimensión con dos dedos (pellizco) y, además, un
deslizador visible como alternativa accesible. Controles principales anclados abajo, al alcance del
pulgar, en una franja fija. Diseño verificado a 360 px de ancho (FR-004, SC-029).

**Rationale**: el cliente llega desde Instagram o WhatsApp, es decir, desde el móvil. Los eventos de
puntero son nativos del navegador y evitan una librería de arrastre. El deslizador existe porque el
pellizco es difícil de hacer con precisión y porque no todo el mundo puede usar dos dedos.

**Alternativas consideradas**:

- **Librería de arrastre y redimensión** (react-dnd, interact.js): resuelven casos que aquí no
  existen (listas ordenables, colisiones, múltiples contenedores). El caso real es un elemento
  dentro de un rectángulo. Rechazadas por Principio I.
- **Solo pellizco, sin deslizador**: SC-014 (el redimensionado se detiene en el límite) es difícil de
  percibir con pellizco, y deja fuera a quien no puede hacer el gesto.

---

## 17. Estilos

**Decisión**: Tailwind CSS v4, sin librería de componentes.

**Rationale**: la versión 4 no necesita archivo de configuración, y el enfoque de clases en el
marcado hace que el diseño móvil-primero sea explícito en cada elemento. Las pantallas son pocas y
específicas; no hay un sistema de diseño que justificar.

**Alternativas consideradas**:

- **Librería de componentes** (MUI, shadcn/ui, Chakra): trae decenas de componentes de los que se
  usarían cinco, y en el caso de las librerías con estilos propios, un peso que compite con el
  presupuesto de 5 segundos en 4G.
- **CSS sin librería**: perfectamente válido, pero con dos personas tocando estilos aparecen
  colisiones de nombres y hojas que nadie se atreve a borrar. Tailwind es una dependencia de tiempo
  de construcción: no llega al navegador del cliente como código.

---

## 18. Estrategia de pruebas

**Decisión**: Vitest sobre las reglas de negocio puras, y verificación manual del resto siguiendo
[quickstart.md](./quickstart.md).

Se prueban automáticamente, porque son funciones con entrada y salida y romperlas es silencioso:

| Módulo | Regla |
|--------|-------|
| `lib/solicitud/estados.ts` | FR-063, RN21 — transiciones permitidas y prohibidas |
| `lib/solicitud/tallas.ts` | FR-048, RN17 — la suma por tallas iguala el total |
| `lib/design/rules.ts` | RN11–RN13 — dentro de la zona, un elemento por zona, máximo tres zonas |
| `lib/design/warp.ts` | FR-035 — la deformación no saca el elemento de su zona |
| `lib/catalogo/publicacion.ts` | FR-012, RN2 — qué combinaciones faltan para publicar |
| `lib/media/dimensiones.ts` | FR-011, RN5 — todas las imágenes del modelo miden igual |
| `messages/*.json` | Principio II — ambos idiomas tienen las mismas claves |

**Rationale**: el Principio IV dice que el criterio de éxito lo comprueba una persona no técnica
usando la app. Las pruebas automáticas no sustituyen eso; cubren las reglas donde un error no se ve
en pantalla hasta que ya causó daño (una solicitud mal congelada, un estado imposible, un logo
fuera de zona).

**Alternativas consideradas**:

- **Pruebas de extremo a extremo con Playwright**: valiosas, y candidatas claras para la versión 2 —
  sobre todo para el envío de la solicitud. En la versión 1 son una infraestructura de pruebas que
  hay que mantener mientras las pantallas todavía cambian de forma cada semana. Se anota como
  propuesta, no se construye.
- **Cobertura de pruebas amplia sobre componentes de interfaz**: se rompen con cada ajuste visual y
  no protegen ninguna regla de negocio.

---

## Justificación de cada dependencia (Principio I)

El Principio I exige justificar por escrito toda librería o servicio externo. Esta es la lista
completa; nada más entra sin pasar por aquí.

### Librerías

| Dependencia | Qué requisito la obliga | Por qué no se hace a mano |
|-------------|-------------------------|---------------------------|
| Next.js + React | Toda la aplicación | Un servidor y un enrutador propios serían el proyecto entero. |
| TypeScript | Trazabilidad del Principio III | Los tipos son lo que hace que renombrar un campo del diseño no rompa la solicitud en silencio. |
| Tailwind CSS v4 | FR-004, SC-029 (móvil desde 360 px) | Ver decisión 17. No llega al navegador como código. |
| Drizzle ORM | Todas las de base de datos | SQL a mano funciona, pero sin migraciones versionadas ni tipos; un cambio de columna se descubre en producción. |
| `isomorphic-dompurify` | FR-037a (limpiar SVG) | Es seguridad. Hacerlo a mano es el error conocido de este problema. Ver decisión 10. |
| `pdf-lib` | FR-064 (ficha en PDF) | Escribir un generador de PDF no es alcance de este producto. |
| SDK de Resend | FR-056 (notificar por correo) | Tres líneas frente a montar y mantener reputación de correo. |
| Vitest | Decisión 18 | Ejecutor de pruebas; no llega a producción. |

### Servicios externos

| Servicio | Qué requisito lo obliga | Alternativa descartada |
|----------|------------------------|------------------------|
| Vercel (publicación + tareas programadas) | "Publicable online enseguida"; FR-039, FR-056b, FR-068 | Un servidor propio: hay que administrarlo, actualizarlo y vigilarlo. |
| Neon (Postgres) | FR-053, FR-058, FR-062, FR-068, RN20 | Supabase (excluido, y se usaría solo su base de datos); archivos sueltos (ver decisión 2). |
| Vercel Blob | FR-009, FR-038, FR-053 | R2/S3: una cuenta y una configuración más a esta escala. |
| Resend | FR-056 | SMTP propio: reputación y DNS. |

**Rechazadas explícitamente**: librerías de autenticación, de internacionalización, de estado
global, de formularios, de arrastrar y soltar, de componentes de interfaz, de procesamiento de
imágenes en servidor, motores de plantillas, colas de mensajes y sistemas de captura de pantalla en
servidor. Cada rechazo tiene su motivo en la decisión correspondiente.

### Variables de entorno (Principio V: nunca en el repositorio)

`DATABASE_URL`, `BLOB_READ_WRITE_TOKEN`, `RESEND_API_KEY`, `SESSION_SECRET`, `CRON_SECRET`,
`ADMIN_NOTIFY_EMAIL`, y los parámetros ⚠ de la spec: `MAX_LOGO_MB` (5), `LOGO_FORMATS`
(png,svg,jpg), `MAX_TEXT_CHARS` (20), `MAX_DECORATED_ZONES` (3).

---

## Riesgos abiertos

| Riesgo | Impacto | Cómo se contiene |
|--------|---------|------------------|
| La carga de ~540 imágenes por modelo es el trabajo real de la versión 1 | El catálogo tarda más de lo previsto en llenarse | La carga masiva es funcionalidad de primera clase (decisión 14). Se recomienda publicar con **un** modelo y sumar los demás después. |
| Calibrar la curvatura puede necesitar varias vueltas | El logo se ve pegado plano y SC-013 no pasa | La vista previa de FR-035a permite iterar sin desarrollo. Los tres parámetros están pensados para eso. |
| El canvas no puede exportar si las imágenes no permiten origen cruzado | El envío falla al generar la imagen congelada | Se configura el permiso en el almacenamiento y se verifica en el primer envío de prueba (decisión 9). |
| Los valores ⚠ siguen sin confirmar con la fábrica | Habría que cambiar límites después de desarrollar | Viven en variables de entorno: cambiarlos no requiere tocar código. |
