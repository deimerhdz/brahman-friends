# Fase 0 — Investigación y decisiones técnicas

**Feature**: Configurador en pasos | **Fecha**: 2026-09-02

La spec no dejó ningún marcador `NEEDS CLARIFICATION`: las siete preguntas abiertas se cerraron en
la sesión de clarificación del 2026-09-02. Este documento resuelve las decisiones técnicas que el
plan necesita para construir sobre lo que ya existe en `001-configurador-gorras`, cada una con su
alternativa descartada y el motivo.

Criterio que gobierna todas: **Principio I, la más simple que cumpla la spec**, y **no reabrir
motores ya validados** (spec, Assumption 1 y 2).

---

## 1. El sistema de diseño del mockup ya está instalado

**Hallazgo**: `detail-product/code.html` (el mockup de referencia) declara su propio
`tailwind.config` con colores, tipografía, espaciados y radios bajo los nombres
`on-surface-variant`, `surface-container-lowest`, `outline-variant`, `label-caps`, etc. Esos mismos
nombres, con los mismos valores hexadecimales, **ya existen** en `app/globals.css` como tokens
`@theme` de Tailwind v4 (`--color-on-surface-variant`, `--color-surface-container-lowest`,
`--font-label-caps`...), instalados cuando se migró la home (`003-pagina-inicio-landing`) al mismo
sistema "Atelier Precise" documentado en `detail-product/DESIGN.md`. El panel de administración ya
los usa hoy (`ambient-shadow`, `font-label-caps`, `text-on-surface-variant`, etc. aparecen en
`_PanelHeader.tsx`, `colores/page.tsx`, y otros).

**Decisión**: implementar el rediseño del configurador con las clases de utilidad que ya existen en
el proyecto (`bg-surface-container-lowest`, `border-outline-variant`, `text-on-surface-variant`,
`font-label-caps`, `rounded`, `ambient-shadow`...). No se toca `app/globals.css` ni se agrega ningún
token nuevo.

**Rationale**: implementar "tal cual el diseño" no exige traer un sistema de diseño nuevo, solo
reestructurar la marcación del panel de personalización con las clases que ya están disponibles.
Evita divergencia entre el mockup y el resto de la aplicación.

**Alternativas consideradas**:

- **Copiar el `<script id="tailwind-config">` del mockup dentro del proyecto**: duplicaría tokens
  que ya existen con otro nombre de variable, y el proyecto usa Tailwind v4 (`@theme` en CSS), no
  el plugin CDN de Tailwind v3 que usa el mockup. Rechazado por Principio I.
- **Crear componentes de diseño genéricos y reutilizables (`<Stepper>` como librería aparte)**: la
  spec no pide un sistema de stepper reutilizable en otras pantallas; se construye el componente
  puntual que este configurador necesita.

---

## 2. Catálogo de telas — construido y luego eliminado

**Nota (Enmienda 2026-09-06 (3) de spec.md)**: esta sección documentaba la decisión de agregar un
catálogo de telas (`fabric` / `fabric_translation` / `model_fabric`, patrón calcado de `technique`).
Se construyó, se probó y luego se eliminó por completo junto con el paso de tela del configurador,
por decisión de negocio de no mantener una función que no aportaba valor suficiente al alcance
actual (Principio I). Se conserva el número de sección para no romper las referencias
`research.md#N` de los demás documentos de esta feature.

---

## 3. Dónde vive la cantidad mínima de pedido (MOQ)

**Decisión**: columna `moq` (entero, nullable) en `cap_model`.

**Rationale**: es un atributo propio de cada modelo, igual que `image_width`/`image_height`, que ya
son columnas nullable en la misma tabla con la misma semántica ("no configurado todavía"). El valor
`null` se interpreta como 1 en el código (FR-012), sin necesitar una migración de datos que rellene
un valor por defecto en los modelos ya publicados (spec, Assumption 6).

**Alternativas consideradas**:

- **Variable de entorno global** (como `MAX_DECORATED_ZONES`): descartada explícitamente en la
  sesión de clarificación de la spec — el MOQ es por modelo, no un parámetro de despliegue.
- **Tabla aparte `model_moq`**: una tabla de una sola columna por modelo no aporta nada sobre una
  columna directa en `cap_model`; es complejidad sin beneficio (Principio I).

---

## 4. Cómo se pasa la cantidad "sugerida" del configurador a la pantalla de solicitud

**Decisión**: parámetro de consulta en la URL (`/solicitud?qty=<n>`). `SolicitudApp` ya es un
componente cliente; lee `useSearchParams().get("qty")` una vez al montar y, si es un entero válido
≥ 1, lo usa como valor inicial de `quantity` en vez de `0`.

**Rationale**: la cantidad del resumen del configurador (FR-021) es solo una sugerencia editable, no
un dato que deba sobrevivir a un cierre de pestaña ni viajar en el `Draft` de `localStorage`
(`lib/design/borrador.ts`), que hoy no tiene ningún campo de cantidad y cuyo contrato (`FR-053` de
`001-configurador-gorras`) es específicamente el diseño, no la cantidad. Un parámetro de URL es la
forma más simple de pasar un solo número entre dos páginas del mismo sitio sin tocar el esquema del
borrador.

**Alternativas consideradas**:

- **Agregar `quantity` al `Draft` de `localStorage`**: infla el contrato de una estructura que ya
  está probada y versionada (`DESIGN_VERSION`), para un valor que ni siquiera es parte del diseño
  (RN18: la cantidad no fija precio ni compromiso). Rechazado por Principio I.
- **Estado global (Context/Zustand) compartido entre configurador y solicitud**: el proyecto no usa
  gestión de estado global en ningún punto (research.md de `001-configurador-gorras` la descarta
  explícitamente); traerla para pasar un solo número contradice esa decisión ya tomada.

---

## 5. Cómo reutilizar el motor de decoración y de color sin reescribirlo

**Decisión**: los componentes existentes `SelectorColor.tsx`, `PanelDecoracion.tsx`,
`SelectorTecnica.tsx`, `Decoracion.tsx`, `ArrastrarElemento.tsx` y `RedimensionarElemento.tsx` se
reutilizan sin cambios de comportamiento. Lo único nuevo es el contenedor que decide **cuál** paso
del stepper los muestra y **cuándo**. Los "botones de posición" del mockup (Front Center / Left /
Right / Back) se implementan como un atajo que llama a la misma función que ya usa
`PanelDecoracion` para fijar la zona activa antes de arrastrar, sin nueva lógica de colocación.

**Rationale**: la Clarification de la spec ya decidió que el arrastre/resize libre se conserva; el
trabajo de este feature es de presentación (stepper), no de motor. Reescribir esos componentes
duplicaría lo que `001-configurador-gorras` ya construyó y probó.

**Alternativas consideradas**: ninguna evaluada — la spec ya cerró esta decisión en clarificación
(ver spec.md, Session 2026-09-02, pregunta sobre colocación de logo).

---

## 6. Reglas puras nuevas que sí necesitan prueba automática (Principio IV)

**Decisión**: dos funciones puras nuevas, probadas con Vitest junto a las que ya existen en
`tests/`:

- `puedeAvanzarPaso(paso, draft)` en `lib/design/rules.ts` (junto a `canPlaceDecoration`, que ya
  vive ahí): implementa FR-018 (al menos un color por componente personalizable en el paso 1, el
  paso 2 —logo— nunca bloquea).
- `moqEfectivo(moq)` en el mismo archivo o en `lib/catalogo/materiales.ts`: implementa FR-012 (`null`
  → 1).

**Rationale**: son exactamente el tipo de regla que `001-configurador-gorras` ya decidió probar con
Vitest (transiciones de estado, cuadre de tallas, límites de zona) — lógica de negocio pura, sin UI,
donde una prueba automática es más barata y más confiable que un recorrido manual. El resto del
feature (navegación visual, estética del stepper, CRUD del panel) se verifica con
[quickstart.md](./quickstart.md), como exige el Principio IV.

---

## 7. Cómo se detecta que el modelo se despublicó a mitad de la sesión (FR-022)

**Decisión**: al llegar al último paso (resumen), `ConfiguradorApp.tsx` vuelve a pedir
`GET /api/imagenes-modelo/:modelId`. Un `404` significa que el modelo ya no está publicado; se
muestra el aviso de no disponible y se deshabilita "Solicitar cotización".

**Rationale**: el `manifest` que usa el configurador llega una sola vez, renderizado en el servidor
al abrir la página (`001-configurador-gorras` FR-031a); nada lo vuelve a consultar después, así que
el configurador no tiene forma de enterarse de un cambio de estado del modelo ocurrido durante la
sesión salvo preguntándole otra vez al servidor. `AvisoDisponibilidad` (el componente que ya existe
para colores agotados) no sirve para esto: solo compara el `manifest` ya cargado contra el
borrador, nunca vuelve a pedir nada. `SolicitudApp.tsx` ya resuelve este mismo problema pidiendo
ese mismo endpoint y capturando el error — este feature repite ese patrón un paso antes, dentro del
propio configurador, para poder avisar en el resumen en vez de recién al enviar.

**Alternativas consideradas**:

- **No revisar nada en el configurador y dejar que `SolicitudApp` lo detecte al enviar**: es lo que
  ya pasa hoy, pero no cumple FR-022 ni el Acceptance Scenario 4 de la Historia 3, que piden el
  aviso **en el paso de resumen**, antes de salir del configurador.
- **Suscripción en tiempo real (WebSocket/polling continuo) al estado del modelo**: muchísimo más
  de lo que la spec pide — una sola revisión al llegar al último paso es suficiente y no agrega
  infraestructura nueva (Principio I).

## Justificación de dependencias (Principio I)

**Ninguna dependencia nueva.** Todo lo que este feature necesita —subida de imágenes (R2, ya
integrado vía `SubidaArchivo.tsx`), formularios bilingües (`CampoTraducible.tsx`), ORM (Drizzle),
pruebas (Vitest)— ya está instalado y en uso en `001-configurador-gorras`. Se descartó explícitamente
traer una librería de manejo de formularios multi-paso (tipo `react-hook-form` con wizard) porque
tres pasos con estado ya centralizado en `ConfiguradorApp` no lo necesitan (Principio I).
