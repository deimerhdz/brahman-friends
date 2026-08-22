# Fase 0 — Investigación y decisiones técnicas

**Feature**: Login de cliente y traducciones por tabla independiente | **Fecha**: 2026-08-22

La spec no dejó ningún marcador `NEEDS CLARIFICATION` sin resolver: las dos preguntas abiertas se
cerraron en la sesión de clarificación del 2026-08-22. Este documento resuelve las decisiones
técnicas que el plan necesita, cada una con su alternativa descartada y el motivo.

Criterio que gobierna todas: **Principio I, la más simple que cumpla la spec**, y reutilizar lo que
`001-configurador-gorras` ya construyó y probó en producción (patrón de sesión por cookie firmada,
patrón de tabla hija con clave compuesta, lector de traducciones).

---

## 1. Sesión de cliente: módulo separado, no una generalización

**Decisión**: `lib/auth/customer-session.ts`, con el mismo mecanismo que `lib/auth/session.ts`
(cookie `HttpOnly`, `Secure`, `SameSite=Lax`, firmada con HMAC-SHA256 usando `SESSION_SECRET`),
pero cookie propia (`bf_customer_session`) y payload propio (`customerId`, `email`, `name`).

**Rationale**: FR-009 exige que iniciar sesión como cliente no dé acceso al panel ni viceversa. Dos
módulos de ~60 líneas cada uno, sin nada en común más que la firma HMAC, hacen esa separación
imposible de romper por accidente: no hay una rama de código compartida donde un error de lógica
mezcle los dos roles.

**Alternativas consideradas**:

- **Generalizar `session.ts` con un parámetro de rol** (`"admin" | "customer"`): un solo módulo,
  pero cualquier función que lo consuma tendría que acordarse de comprobar el rol correcto en cada
  sitio. Rechazado por Principio I: la abstracción no la pide ningún requisito, y el riesgo de
  seguridad de "olvidar comprobar el rol" es peor que las ~60 líneas duplicadas.
- **JWT de una librería externa**: cero necesidad. El proyecto ya resolvió sesión firmada con
  `node:crypto` puro para el panel; el mismo patrón sirve aquí sin dependencia nueva.

---

## 2. Registro y login de cliente: mismo patrón que el login del panel

**Decisión**: `POST /api/cliente/registro` y `POST /api/cliente/login` siguen exactamente el
patrón de `app/api/panel/login/route.ts`: mismo contrato de error genérico
(`401 credenciales_invalidas`), mismo truco de "hash señuelo" para que el tiempo de respuesta no
distinga entre correo inexistente y contraseña incorrecta (FR-005).

**Rationale**: es el único login que el proyecto tiene hoy, ya resuelve exactamente el problema de
seguridad que pide la spec (no revelar si un correo existe), y ya está probado en producción.
Repetir el patrón es más simple que inventar uno nuevo.

**Alternativas consideradas**:

- **Proveedor de autenticación externo (Auth.js, Clerk, etc.)**: resolvería login, pero traería
  registro, recuperación de contraseña, proveedores sociales y paneles de administración que nadie
  pidió — exactamente el tipo de superficie que el Principio I pide rechazar. El proyecto ya
  demostró que un login propio de ~40 líneas cumple lo que la spec pide.

---

## 3. Bloqueo temporal por intentos fallidos: contador en la propia fila, sin servicio nuevo

**Decisión**: dos columnas nuevas en `customer` (`failed_login_attempts`, `locked_until`).
`lib/auth/login-lockout.ts` centraliza la regla: 5 intentos fallidos consecutivos → bloqueo de 15
minutos. Durante el bloqueo, el login responde exactamente igual que una contraseña incorrecta
(`401 credenciales_invalidas`), sin mensaje distinto ni código de error nuevo.

**Rationale**: la spec (FR-010c, clarificación del 2026-08-22) solo pide que exista una espera
breve tras varios fallos, no un sistema de límite de tasa sofisticado. Guardar el contador junto al
cliente reutiliza la base de datos que ya existe; no responder distinto durante el bloqueo evita
revelar información nueva (coherente con FR-005, que ya exige no distinguir casos).

**Alternativas consideradas**:

- **Límite de tasa por IP con almacén en memoria** (p. ej. un mapa en el proceso): no funciona en
  funciones sin servidor, donde cada invocación puede correr en una instancia distinta sin memoria
  compartida.
- **Redis / servicio de límite de tasa administrado**: resolvería IP y cuenta a la vez, pero es una
  pieza de infraestructura nueva que ningún requisito obliga hoy. Documentado como límite conocido
  y aceptado en el plan; se reconsidera si el abuso por IP resulta ser un problema real.
- **CAPTCHA tras N fallos**: agrega una dependencia de terceros (y su propio consentimiento de
  privacidad) para un negocio pequeño que hoy no tiene evidencia de ataques automatizados. Se
  descartó explícitamente en la clarificación de la spec.

---

## 4. Dónde vive el control de cuenta en la interfaz

**Decisión**: se agrega al encabezado compartido de `app/[locale]/layout.tsx`, junto al selector de
idioma (`SelectorIdioma`). Sin sesión: enlaces a "Ingresar" / "Registrarme". Con sesión: nombre del
cliente y "Cerrar sesión".

**Rationale**: FR-001 exige que el control sea visible desde la página de inicio sin navegar a otra
sección. El encabezado ya es compartido por todas las páginas (incluida la de inicio), así que
ponerlo ahí cumple el requisito con holgura y sin duplicar el control por página, igual que ya pasa
con el idioma.

**Alternativas consideradas**:

- **Modal de login que se abre desde un botón en la portada**: exigiría una librería de diálogos o
  construir el manejo de foco/accesibilidad de un modal a mano. Una página propia (`/cuenta/ingresar`)
  usa exactamente el mismo patrón de formulario que ya existe en `/panel/login`, sin pieza nueva.

---

## 5. Registro e ingreso viven en páginas propias, no en un modal

**Decisión**: `app/[locale]/cuenta/ingresar/page.tsx` y `app/[locale]/cuenta/registro/page.tsx`,
formularios de servidor+cliente igual que `app/[locale]/panel/login/page.tsx` +
`_LoginForm.tsx`.

**Rationale**: cumple la exigencia de bilingüismo (FR-010) con el mismo lector de traducciones que
ya usa el resto del sitio, y no requiere ninguna librería de UI (diálogos, portales, manejo de
scroll del fondo) que un modal sí exigiría.

---

## 6. Cuatro tablas de traducción, una por entidad — no una tabla genérica

**Decisión**: `cap_model_translation`, `color_translation`, `component_translation`,
`technique_translation`. Cada una con clave compuesta `(entidad_id, locale)`, igual patrón que
`model_view` (`(model_id, view)`) ya usa hoy en el esquema.

**Rationale**: es literalmente lo que pidió el usuario ("una tabla independiente para cada
entidad"), y además es la opción más simple de las dos: cada tabla tiene su propia clave foránea
tipada hacia su entidad dueña con `onDelete: "cascade"`, igual que el resto del esquema. Drizzle
resuelve el join sin nada especial.

**Alternativas consideradas**:

- **Tabla genérica `translation` con columnas `entity_type` + `entity_id` + `field` + `locale` +
  `value`**: es el diseño "polimórfico" clásico. Se rechaza por dos motivos: (1) el usuario pidió
  explícitamente lo contrario; (2) `entity_id` no podría ser una clave foránea real hacia cuatro
  tablas distintas, así que Postgres no podría garantizar que apunte a una fila que existe ni
  aplicar `cascade` al borrar — exactamente el tipo de garantía que el esquema actual sí tiene en
  cada tabla hija.

---

## 7. Nuevo enum `locale`

**Decisión**: `pgEnum("locale", ["es", "en"])`, reutilizado en las cuatro tablas de traducción.

**Rationale**: mismo conjunto que ya define `lib/i18n/t.ts` (`locales = ["es", "en"] as const`).
Un enum de Postgres impide guardar un tercer valor por error, igual que ya hacen `view`,
`request_status`, etc. en el esquema actual.

---

## 8. Completitud de la traducción: se exige al guardar, no en un paso de "publicar" nuevo

**Decisión**: `lib/catalogo/traduccion.ts` expone una función que, dado un mapa `{ es, en }` de un
atributo, falla si a alguno le falta el nombre. Las rutas de alta/edición la llaman antes de
escribir en la base de datos.

**Rationale**: hoy las columnas `name_es`/`name_en` son `NOT NULL` en las cuatro entidades — es
decir, **ya es imposible crear un color, modelo, componente o técnica sin ambos idiomas**, aunque
el formulario los pida en dos campos visibles. Al mover el dato a filas, esa misma garantía ya no
la da Postgres directamente (una fila puede faltar sin que la tabla se queje), así que se recupera
en la capa de aplicación, en el mismo punto donde hoy ya se valida `nameEs`/`nameEn` no vacíos. No
hace falta un gate de "publicación" nuevo para color/componente/técnica: el modelo de gorra
conserva el suyo (`lib/catalogo/publicacion.ts`), que valida imágenes y zonas, no nombres, y no
cambia.

**Alternativas consideradas**:

- **`NOT NULL` a nivel de base de datos sobre la fila de traducción**: no evita que falte la fila
  completa (por ejemplo, que nunca se inserte la fila `en`). Se necesitaría además una restricción
  "deben existir exactamente 2 filas por entidad", que Postgres no expresa de forma simple sin
  disparadores — más piezas que la validación de aplicación que ya existía.

---

## 9. El switch ES/EN es estado de React local, sin librería de formularios

**Decisión**: cada formulario mantiene `{ es: string, en: string }` en memoria por atributo
traducible; el switch decide cuál de los dos se muestra en el único `<input>`/`<textarea>`. Al
enviar, se mandan ambos valores juntos, igual que hoy envían `nameEs` y `nameEn` por separado.

**Rationale**: es exactamente el patrón que ya usa `_ColorForm.tsx` (estado controlado con
`useState`), extendido de "dos campos, un estado cada uno" a "un campo, un switch que decide qué
mitad del mismo estado se ve". Cero dependencias nuevas.

**Alternativas consideradas**:

- **Guardar cada idioma con una petición al servidor por cada cambio de switch**: más peticiones,
  más estados de carga y de error que mostrar, y ningún requisito lo pide — FR-016 solo exige que
  el guardado final persista lo que se escribió, no que cada tecla viaje al servidor.

---

## 10. Migración de datos

**Decisión**: una sola migración SQL (generada con `drizzle-kit generate` y completada a mano) que,
en este orden: (1) crea el enum `locale` y las cuatro tablas nuevas; (2) copia `name_es` → fila
`es`, `name_en` → fila `en` (y `description_es`/`description_en` para el modelo) de cada fila
existente; (3) elimina las columnas viejas. Los pasos 1–3 corren en el mismo archivo de migración,
ejecutado con `db:migrate` como ya hace el proyecto.

**Rationale**: FR-018 exige que no se pierda contenido. Un solo archivo evita que el sitio público
quede sirviendo de un lado (columnas) mientras el panel ya escribe del otro (tablas) — ese estado
intermedio es exactamente donde se perdería o duplicaría contenido.

**Precisión importante (descubierta al implementar)**: el driver de Neon que usa el proyecto
(`neon-http`, ver `lib/db/index.ts`) no soporta transacciones interactivas — el migrador de
Drizzle ejecuta cada sentencia del archivo por separado, sin envolverlas en `BEGIN`/`COMMIT`. Por
eso el orden de las sentencias no es cosmético: las cuatro parejas de `INSERT ... SELECT` (copiar a
la tabla de traducción) van **todas** antes que cualquier `DROP COLUMN`. Si algo falla a mitad de
la migración, el peor caso dentro de los pasos 1–2 dejaría tablas nuevas parcialmente pobladas,
pero las columnas viejas siguen intactas (el paso 3 nunca se alcanzó) — no hay pérdida de datos,
solo una migración a reintentar tras corregir la causa del fallo.

**Alternativas consideradas**:

- **Mantener las columnas viejas junto a las tablas nuevas "por si acaso" y borrarlas después**:
  crea dos fuentes de verdad simultáneas; el código tendría que decidir cuál leer, y un descuido
  dejaría contenido desactualizado en un lado. Rechazado por Principio I.

---

## Justificación de dependencias (Principio I)

**No hay dependencias nuevas que agregar.** Toda esta funcionalidad se construye con lo que
`001-configurador-gorras` ya trajo y justificó: Next.js, React, TypeScript, Drizzle ORM, y
`node:crypto` de la librería estándar de Node para hashing y firma.

**Rechazadas explícitamente** (mismas categorías que 001, reafirmadas aquí porque esta
funcionalidad es la que más tentación tendría de traerlas): librerías de autenticación completas,
de límite de tasa/Redis, de formularios, de diálogos/modales y de captcha.

### Variables de entorno

Ninguna nueva. La cookie de cliente reutiliza `SESSION_SECRET`, ya presente desde
001-configurador-gorras.

---

## Riesgos abiertos

| Riesgo | Impacto | Cómo se contiene |
|--------|---------|------------------|
| La migración de datos corre una sola vez sobre datos reales, y el driver HTTP de Neon no soporta transacciones | Contenido traducido incorrecto o perdido si algo falla a mitad de camino | Orden de sentencias que hace el fallo seguro por construcción (decisión 10: copiar todo antes de borrar); se ejecuta primero contra una copia/staging antes de producción, siguiendo la práctica ya usada para migraciones de 001. |
| El umbral de bloqueo (5 intentos / 15 min) es una suposición razonable, no un valor pedido por la spec | Podría resultar muy laxo (no frena abuso) o muy agresivo (frustra a clientes reales) | Aislado como constante en `lib/auth/login-lockout.ts`; ajustarlo no toca el resto del flujo. Si hiciera falta, se convierte en variable de entorno como los valores ⚠ de 001. |
| Cuatro formularios administrativos cambian su forma de guardar datos a la vez | Un error de migración de un solo formulario (por ejemplo, técnica) pasa desapercibido si no se prueba cada uno | `quickstart.md` incluye un recorrido explícito por cada uno de los cuatro formularios, no solo por uno representativo. |
