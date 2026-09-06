# Fase 0 — Investigación

**Feature**: Colores propios por modelo | **Fecha**: 2026-09-06

No quedó ningún `NEEDS CLARIFICATION` en `spec.md`: las tres decisiones de alcance ambiguas se
resolvieron directamente con el usuario antes de escribir la especificación (migración automática,
sin reutilización entre modelos, eliminación de la sección global — ver spec.md#assumptions). Este
documento registra las decisiones técnicas necesarias para llegar de ahí al diseño de Fase 1.

---

## 1. Cómo dejar de compartir `color` entre modelos

**Decisión**: agregar `color.model_id` (uuid, FK a `cap_model.id`, `onDelete: cascade`) y tratar
`color` como una entidad propiedad exclusiva de un modelo, igual que ya lo es `component`.

**Rationale**: es la relación más simple que cumple FR-002 (un color no debe poder seleccionarse ni
mostrarse desde otro modelo) y FR-010 (borrar un modelo borra sus colores). `component` ya usa
exactamente este patrón (`component.model_id` con cascade); no hace falta inventar uno nuevo.

**Alternativas consideradas**:
- *Catálogo compartido + tabla de "visibilidad por modelo"* (una tabla puente `model_color` que
  restrinja qué modelos ven qué colores compartidos): se rechaza porque el usuario confirmó
  explícitamente que no quiere reutilización entre modelos (spec.md, pregunta "Reutilización entre
  modelos" → "Sin reutilización"); construir una tabla puente para un caso que no debe ocurrir viola
  el Principio I (sin abstracciones para casos que la spec no pide).
- *Bandera `shared: boolean` en `color`, sin FK a modelo*: no resuelve FR-002 (seguiría sin haber
  forma de saber a qué modelo pertenece un color no compartido) y no permite el cascade de FR-010.

---

## 2. Migración de los colores ya existentes

**Decisión**: script de un solo uso (`scripts/migrar-colores-por-modelo.ts`, ejecutado con `tsx`,
mismo patrón que `scripts/crear-admin.ts`) que corre **antes** de imponer `NOT NULL` en
`color.model_id`:

1. Por cada color existente, calcular el conjunto de modelos que lo usan hoy (vía
   `component_color` → `component.model_id`).
2. Sin modelos que lo usen (huérfano): se descarta (FR-009) — se borra el color y sus traducciones.
3. Un solo modelo: se le asigna ese `model_id` directamente, sin duplicar nada.
4. Varios modelos: el primero (por `cap_model.created_at` más antiguo, para que sea determinista —
   `component` no tiene su propia fecha de creación) se queda con la fila original; por cada modelo
   adicional se crea una copia nueva del color y de sus traducciones, y se reapuntan hacia esa copia
   las filas de `component_color`, `component_image` y `component.default_color_id` que pertenecen a
   ese modelo (FR-006, FR-007).

**Rationale**: el usuario confirmó esta estrategia exacta ("Duplicar automáticamente") al resolver
la spec. Usar un script en TypeScript sobre el mismo cliente Drizzle es más simple de escribir y de
revisar que backfill en SQL puro, y sigue el patrón ya existente en el repo para tareas de un solo
uso (`scripts/crear-admin.ts`).

**Alternativas consideradas**:
- *Migración manual asistida (reporte + decisión caso por caso)*: se ofreció como opción en la
  pregunta de clarificación y el usuario la descartó a favor de la automática.
- *Dejar los colores compartidos como "legado" y aplicar el cambio solo hacia adelante*: también se
  ofreció y se descartó — el usuario quiere que el catálogo global deje de existir, no que conviva
  con el nuevo modelo indefinidamente.

**Restricción de la base de datos gestionada**: el driver HTTP de Neon no soporta transacciones
interactivas de varias idas y vueltas (mismo comentario ya documentado en
`app/api/solicitudes/route.ts`). El script agrupa los escrituras de cada color (la copia, sus
traducciones y los reapuntes) en un único `db.batch(...)` por color, igual que ya hace la ruta de
solicitudes, para que cada color se migre de forma atómica aunque el script completo no sea una sola
transacción.

**Secuencia de despliegue** (2 migraciones + 1 script, no 1 sola migración):

1. Migración `0004`: agrega `color.model_id` como **nullable**, con su FK.
2. Se corre `scripts/migrar-colores-por-modelo.ts` — deja todo `color.model_id` poblado.
3. Migración `0005`: `ALTER COLUMN model_id SET NOT NULL`.

Es la única forma de poblar una columna con datos calculados (no un valor por defecto fijo) antes de
volverla obligatoria; `drizzle-kit generate` no genera backfills con lógica, solo diffs de esquema.

---

## 3. Volumen esperado tras la migración

**Decisión**: no se necesita ningún índice nuevo. `color.model_id` se consulta siempre junto a
`cap_model.id` (una ficha de modelo a la vez), con un volumen por modelo comparable al que ya maneja
`component` (decenas de colores, no miles) — mismo orden de magnitud que `001-configurador-gorras`
data-model.md#Assumption 3 ya documentaba para el catálogo completo, ahora repartido por modelo.

**Rationale**: ninguna tabla FK hija existente (`component.model_id`, `model_view.model_id`,
`decoration_zone.model_id`) tiene un índice explícito sobre esa columna; seguir el mismo criterio
evita anticipar una necesidad de rendimiento que no existe hoy (Principio I).

---

## 4. Dónde vive la gestión de colores en el panel

**Decisión**: nueva sección `/panel/modelos/:id/colores` (lista + crear/editar), con tarjeta propia
en el hub del modelo (`/panel/modelos/:id`), exactamente al lado de `componentes`, `zonas` y
`tallas`. Se retira `/panel/colores` completo y su entrada en `_PanelNav.tsx`.

**Rationale**: `componentes`, `zonas` y `tallas` ya establecen el patrón de "todo recurso que
pertenece a un modelo se gestiona dentro de la ficha de ese modelo, no en una sección de nivel
superior". Colores pasa a ser exactamente ese tipo de recurso; no hay razón para tratarlo distinto
ni para inventar un patrón de navegación nuevo (FR-001, FR-005).

**Alternativas consideradas**:
- *Insertar el formulario de color dentro de la pestaña `componentes` existente*: se rechaza porque
  un color no pertenece a un componente, pertenece al modelo completo (varios componentes con el
  mismo material comparten la misma paleta, como ya ocurre hoy) — mezclar ambos conceptos en una
  sola pantalla la sobrecarga. Mantenerlos como dos pestañas separadas conserva la relación real:
  "colores" define qué existe, "componentes" define dónde se habilita.
- *Mantener `/panel/colores` como reporte de solo lectura*: se ofreció como opción en la pregunta de
  clarificación y el usuario la descartó a favor de eliminarla por completo.

---

## 5. Impacto en solicitudes de cliente ya enviadas

**Decisión**: ninguno. No se toca `request` ni `request_image`.

**Rationale**: se verificó en `lib/solicitud/snapshot.ts` (`buildDesignSnapshot`) que
`request.design_snapshot` ya copia el nombre, material y muestra del color elegido en el momento del
envío — nunca solo su `colorId`. Reasignar o duplicar filas de `color` después de ese momento no
altera ese JSON congelado (FR-011). Esto no es una suposición: es lo que hace el código hoy.

---

## Justificación de dependencias

Ninguna dependencia nueva. Se reutilizan Drizzle ORM, el cliente S3 de `@aws-sdk/client-s3` ya
integrado (`SubidaArchivo.tsx`) y `tsx` (ya usado para `scripts/crear-admin.ts`) para correr el
script de migración.
