# Research: Modelos de producto fijo junto a modelos configurables

## 1. Cómo representar el "tipo" de modelo

**Decision**: Agregar una columna `type` (enum Postgres `model_type`: `"configurable"` |
`"fixed_product"`) a `cap_model`, `NOT NULL DEFAULT 'configurable'`.

**Rationale**: Un `DEFAULT` cubre FR-009 (los modelos existentes quedan como "Configurable") sin
escribir un script de backfill aparte — la migración de Drizzle ya deja la columna poblada para las
filas existentes. Es el cambio mínimo: no se toca ninguna tabla más, y la columna vive junto al
resto de atributos de encabezado del modelo (código, precio, estado) que ya están en `cap_model`.

**Alternatives considered**:
- Tabla `cap_model_type` aparte o una segunda tabla `fixed_product` con sus propios campos: rechazada
  por el Principio I (simplicidad) — no hay ningún atributo exclusivo de "producto fijo" que no sean
  ya campos existentes de `cap_model` (precio, fotos vía `model_view`).
- Un booleano `customizable`: rechazado porque el nombre del tipo ("Configurable" / "Producto fijo")
  es parte del vocabulario de la spec y un enum de dos valores dice lo mismo que un booleano pero es
  más legible en consultas y en el admin (`m.type === "fixed_product"` en vez de `!m.customizable`).

## 2. Qué pasos del configurador aplican por tipo

**Decision**: El stepper de edición (`ModeloConfigurador.tsx`) sigue teniendo el paso "Vistas"
(fotos) para ambos tipos. Para `fixed_product` se ocultan los pasos "Colores" y "Personalización"
(la pestaña 2 y 3 del stepper actual) — el modelo pasa a tener efectivamente un único paso de
configuración post-creación: subir fotos.

**Rationale**: FR-004 y FR-005. `PasoColores` y `PasoPersonalizacion` dependen enteramente de
`component`/`color`/`componentColor`/`zone_*`, que no tienen sentido sin componentes personalizables;
un modelo `fixed_product` nunca tendrá filas en esas tablas. Reutilizar `PasoVistas` sin cambios es
lo más simple: ya sube/activa fotos por vista (frontal/lateral/trasera) sin depender de colores.

**Alternatives considered**: Construir una pantalla de "fotos de producto" nueva, tipo galería sin
las 3 vistas fijas — rechazada por Principio I: `PasoVistas` ya hace exactamente lo que pide FR-005
("mismo mecanismo de vistas"), y la spec no pidió una galería con más de 3 fotos.

## 3. Validación de publicación por tipo

**Decision**: `lib/catalogo/publicacion.ts` gana una segunda función pura,
`checkPublicacionProductoFijo(input: { price: string | null; viewsWithBaseImage: View[] })`, que
devuelve qué falta (`missingPrice: boolean`, `missingPhoto: boolean`). La ruta
`POST /api/panel/modelos/[id]/publicar` decide cuál de las dos funciones llamar según
`model.type`, sin tocar `checkPublicacion` (la de modelos configurables sigue igual, FR-007).

**Rationale**: FR-002 y FR-006 piden una regla de publicación completamente distinta (precio +
1 foto) a la que ya existe (colores/componentes completos). Son reglas independientes: mezclarlas
en una sola función con banderas de tipo la haría más difícil de leer que tener dos funciones puras
chicas, cada una con su propio test (Principio I).

**Alternatives considered**: Extender `checkPublicacion` con un parámetro `type` y ramas internas —
rechazada porque casi ninguna de las comprobaciones actuales (colores por componente) aplica al caso
nuevo; hubiera quedado una función con dos mitades que no comparten lógica real.

## 4. Cómo llega un modelo "Producto fijo" al catálogo público y qué ve el cliente

**Decision**:
- `capModelConNombreYPortada` (o una consulta hermana) se extiende para traer también `type` y
  `price`; la página de inicio arma `href` como `/producto/[id]` cuando `type === "fixed_product"` y
  `/configurador/[id]` cuando es `"configurable"`, igual que hoy.
- Se agrega una ruta pública nueva y mínima `app/[locale]/(site)/producto/[modelId]/page.tsx`: carga
  el modelo publicado (nombre/descripción/precio/fotos por vista) y, si no está publicado o no es
  `fixed_product`, responde 404 — sin motor de configurador, sin `localStorage`, sin manifest de
  colores/zonas.
- Debajo de las fotos y el precio, esa página monta un formulario de pedido nuevo y chico
  (cantidad + `FormularioContacto` ya existente + botón enviar), en vez de todo `SolicitudApp`
  (que asume un borrador de diseño en `localStorage`, cosa que un producto fijo no tiene).

**Rationale**: FR-011 a FR-013. `SolicitudApp`/`Resumen` están armados alrededor de un `Draft` con
colores/decoraciones/técnica (`lib/design/borrador.ts`) que no existe para un producto fijo; forzar
ese flujo para un caso sin diseño personalizable sería más complejo que una pantalla nueva y chica
que reutiliza solo la pieza que sí aplica (`FormularioContacto`).

**Alternatives considered**: Reutilizar `/solicitud` para ambos casos con un `if` grande según el
tipo de modelo — rechazada: hubiera mezclado dos flujos con muy poco en común (draft+manifest de
colores vs. modelo+fotos fijas) en un mismo componente, violando el Principio I.

## 5. Cómo se registra el pedido de un producto fijo

**Decision**: Se extiende `POST /api/solicitudes` (no se crea un endpoint aparte): el body acepta
un `design` con forma `{ modelId, kind: "fixed_product" }` además de la forma actual
(`{ modelId, colors, technique, decorations }`, ahora con `kind: "configurable"` implícito). La ruta
carga el modelo por `modelId`, lee su `type` en la base de datos (nunca confía en lo que mande el
cliente) y si no coincide con el `kind` recibido, responde el mismo error `modelo_no_disponible` que
ya existe. Para el caso `fixed_product` no corre ninguna de las validaciones de colores/zonas/
decoraciones (no aplican) y arma el `designSnapshot` con `buildFixedProductSnapshot` (nueva función
en `lib/solicitud/snapshot.ts`): copia nombre/descripción/precio/fotos del modelo *tal como están en
ese momento* (mismo principio de "congelado" que ya usa `buildDesignSnapshot`). Las fotos del
producto (URLs de `model_view.base_image_url`) se guardan directo en `request_image` — no hace falta
componer/subir nada nuevo, porque no hay logo ni decoración que superponer.

**Rationale**: FR-013, FR-014 y el requisito ya existente ("cada solicitud enviada debe quedar
congelada", Alcance del Producto v1). Reusar el mismo endpoint, tabla (`request`/`request_image`) y
generador de código (`generateRequestCode`) evita duplicar la transacción por lotes, el reintento
por colisión de código y el envío de notificación (`sendRequestNotifications`) que ya existen y
funcionan igual para ambos tipos de pedido — solo cambia qué validación corre y qué snapshot se
arma. Las URLs de `model_view.base_image_url` ya son estables una vez subidas (cada subida genera
una clave nueva en R2; ver `vistas/route.ts`), así que referenciarlas directo en `request_image`
cumple "congelado" sin necesitar copiar el archivo.

**Alternatives considered**: Endpoint `POST /api/solicitudes-producto-fijo` aparte — rechazada:
hubiera duplicado la generación de código único, el guardado en batch y el disparo de notificación
por correo, que no cambian entre los dos casos (Principio I).

## 6. Moneda al mostrar el precio (Principio II de la constitution)

**Decision**: El precio se muestra siempre formateado como USD (símbolo `$` + separador de miles),
en ambos idiomas, tanto en el panel (ya así hoy) como en el catálogo público y en la página de
producto fijo.

**Rationale**: `cap_model.price` ya está documentado en el esquema como "Precio base del modelo en
USD" — no existe (ni esta funcionalidad la pide) una segunda columna o tasa de cambio para calcular
un equivalente en COP. La regla de la constitution ("cuando muestre precios, ese precio DEBE llevar
su moneda clara") queda satisfecha mostrando el símbolo/código de moneda; agregar conversión a COP
es un alcance que ninguna FR de esta spec pidió (Principio III) y se deja para una funcionalidad
aparte si el negocio lo pide.

**Alternatives considered**: Mostrar el número sin moneda (como hoy en el panel) — rechazada porque
la constitution es explícita: "No se muestran cifras sin moneda" en cuanto haya un precio visible
para el cliente, y esta funcionalidad es la primera en mostrarle un precio a un cliente.

## 7. Vistas del panel que ya asumen que toda solicitud tiene diseño/colores

**Decision**: Las pantallas de solicitudes del panel que arman el "resumen" del pedido (detalle en
`/panel/solicitudes/[id]`, ficha PDF, export CSV) deben distinguir `designSnapshot.kind` antes de
leer campos de colores/decoraciones/técnica, y mostrar en su lugar las fotos/nombre/precio cuando el
pedido es de un `fixed_product`. No se rediseñan esas pantallas; solo se les agrega la rama que falta
para no romper con el nuevo tipo de snapshot.

**Rationale**: Son consumidores existentes de `request.designSnapshot`, que hasta hoy solo tenía una
forma posible. Esta funcionalidad introduce una segunda forma; cualquier lugar que lea ese campo sin
verificar `kind` se rompe con un pedido de producto fijo. Se identifica aquí como punto de
integración obligatorio; el detalle de cada pantalla se resuelve en `tasks.md`.

**Alternatives considered**: Ninguna — no es opcional, es un requisito de no-regresión (Principio
III: no se puede "romper" un flujo existente como efecto colateral de esta funcionalidad).
