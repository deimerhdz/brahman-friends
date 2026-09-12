# Research: Formulario de creación de modelo alineado con edición

No quedaron marcadores `NEEDS CLARIFICATION` en el Technical Context del plan: el stack, el
almacenamiento y el patrón de UI ya existen en el repo y se reutilizan tal cual. Este documento
registra las decisiones de diseño tomadas para resolver la spec con el mínimo cambio posible
(Principio I).

## Decisión 1 — Reutilizar `EncabezadoModelo` en vez de duplicar su marcado

**Decisión**: Extender `EncabezadoModelo.tsx` con dos props opcionales — una para permitir editar el
código (en vez de mostrarlo de solo lectura) y otra para ocultar el bloque de `EstadoPublicacion` —
en lugar de crear un segundo componente con el mismo diseño para la pantalla de creación.

**Rationale**: El pedido explícito de la spec es que ambas pantallas "se vean igual". La forma más
simple de garantizar eso para siempre (y no solo en el momento de construirlo) es que compartan el
mismo componente: cualquier cambio futuro de estilo al encabezado de edición se refleja
automáticamente en el de creación. Duplicar el JSX en un componente aparte viola el Principio I
(no se anticipan dos fuentes de verdad para el mismo diseño) y es la forma más común en que estas
dos pantallas se desincronizan con el tiempo.

**Alternatives considered**:
- *Crear un componente nuevo `EncabezadoModeloNuevo`*: descartado — duplica markup y estilos, y es
  exactamente el problema que la spec pide resolver (las dos pantallas divergiendo).
- *Reescribir `_ModeloForm.tsx` a mano copiando las clases de Tailwind de `EncabezadoModelo`*:
  descartado por la misma razón; además el código intentaría reinventar la lógica de
  `CampoTraducible` que `EncabezadoModelo` ya resuelve.

## Decisión 2 — El código es editable solo en modo creación

**Decisión**: `EncabezadoModelo` recibe una prop (p. ej. `codeEditable` o se infiere de que no hay
`modelId`/`status` todavía) que decide si el campo de código se muestra como `<input>` o como texto
de solo lectura, tal como ya distingue `_ModeloForm.tsx` hoy con su bandera `isNew`.

**Rationale**: El código es el identificador único que se define una sola vez al crear el modelo
(constraint `unique` en `cap_model.code`); una vez creado no tiene sentido editarlo desde esta
pantalla, y esto ya es el comportamiento actual de `_ModeloForm.tsx` (edita en creación, bloqueado
después). Se conserva esa regla, solo que ahora vive dentro del componente compartido.

**Alternatives considered**: Permitir editar el código siempre — descartado, no lo pide la spec y
cambia comportamiento ya establecido sin necesidad (alcance fantasma, Principio III).

## Decisión 3 — El control de publicación no aparece en creación

**Decisión**: Cuando `EncabezadoModelo` se usa en modo creación, no se renderiza
`EstadoPublicacion`, en vez de renderizarlo deshabilitado o con un estado "borrador" ficticio.

**Rationale**: `EstadoPublicacion` depende de un `modelId` real para consultar/mutar el estado de
publicación contra la API; un modelo que aún no existe no tiene ese id. Mostrarlo deshabilitado
agregaría un estado visual nuevo sin ningún uso (viola Principio III). La spec (FR-004) pide
explícitamente que no aparezca.

**Alternatives considered**: Mostrar el control deshabilitado con tooltip explicativo — descartado,
es alcance no pedido por la spec y agrega texto/traducciones nuevas sin necesidad.

## Decisión 4 — Agregar `price` a `POST /api/panel/modelos` reusando la validación de `PATCH`

**Decisión**: La ruta `POST /api/panel/modelos` (`app/api/panel/modelos/route.ts`) acepta un campo
opcional `price` en el cuerpo, validado igual que ya lo hace
`PATCH /api/panel/modelos/[id]/route.ts` (número finito ≥ 0, o `null`/ausente → sin precio
definido), y lo guarda en la fila `cap_model` insertada.

**Rationale**: El esquema de base de datos (`lib/db/schema.ts`) ya tiene la columna `price` en
`cap_model` desde una funcionalidad anterior; no se requiere migración. La validación en `PATCH` ya
resuelve las reglas de negocio para este campo (numérico, no negativo, opcional), así que crear una
segunda implementación de esa validación en `POST` sería divergencia innecesaria — se replica la
misma regla, no una nueva.

**Alternatives considered**: Crear el modelo sin precio en `POST` y forzar un `PATCH` inmediato
después desde el cliente para fijarlo — descartado, agrega una segunda llamada de red y una ventana
donde el modelo existe sin precio aunque la persona ya lo haya escrito en el formulario.

## Decisión 5 — El flujo de creación sigue terminando en el configurador existente

**Decisión**: Tras guardar el formulario de creación, la aplicación sigue redirigiendo a
`/panel/modelos/[id]` (la página que ya arma `ModeloConfigurador`), sin cambios en esa página ni en
sus tres pasos (Vistas, Colores, Personalización).

**Rationale**: Es el comportamiento ya validado hoy y lo que la spec pide en FR-006/FR-008: solo se
iguala el encabezado, no se extiende el stepper a la creación (decisión ya tomada con la persona
usuaria al redactar la spec).

**Alternatives considered**: N/A — está fijado por la spec, no es una decisión técnica abierta.
