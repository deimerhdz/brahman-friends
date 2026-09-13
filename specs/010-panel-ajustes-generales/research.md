# Research: Ajustes generales del sitio en el panel administrador

## 1. Dónde y cómo vive la configuración global del sitio

**Decision**: Una tabla nueva `site_settings`, con una única fila fija (id constante,
`SITE_SETTINGS_ID`, sembrada por la migración). El servidor nunca inserta una segunda fila: toda
lectura/escritura apunta a ese id conocido.

**Rationale**: Hoy no existe ninguna tabla de configuración global (confirmado revisando
`lib/db/schema.ts`): el nombre del sitio vive como texto fijo en `messages/es.json` /
`messages/en.json` (clave `common.siteName`), y no hay fila ni tabla equivalente para logo,
banner, SEO o redes sociales. Un id fijo sembrado por migración es más simple que una tabla con
lógica de "solo puede haber una fila" (constraint, trigger o chequeo en cada insert): el
Principio I pide la solución más simple, y aquí el caso de uso nunca necesita más de una fila.

**Alternatives considered**:
- Guardar la configuración como filas clave/valor genéricas (`site_setting_kv`): rechazada porque
  obliga a parsear/tipar cada valor en el código en vez de tener columnas tipadas; con un solo
  registro de configuración, una tabla de columnas fijas es más simple y más fácil de validar
  (Principio I).
- Reutilizar `messages/*.json` para el nombre del sitio y solo agregar tabla para lo demás:
  rechazada porque separaría la fuente de verdad del nombre del sitio en dos lugares (JSON estático
  para arrancar, base de datos después de la primera edición), complicando innecesariamente
  `NavBar`, `Footer` y `PanelNav`, que hoy leen ese valor con una sola llamada (`t("common.siteName")`).

## 2. Qué pasa con `common.siteName` una vez que el nombre es editable

**Decision**: `NavBar.tsx`, `Footer.tsx` y `PanelNav.tsx` dejan de leer `t("common.siteName")` y en
su lugar reciben el nombre del sitio (ya resuelto por idioma) leído de `site_settings`. La clave
`common.siteName` se retira de `messages/es.json` / `messages/en.json` una vez que ningún
componente la usa. La migración siembra `site_settings` con `site_name_es = "Brahman Friends"` y
`site_name_en = "Brahman Friends"` (mismo valor que tenía la clave estática), así ningún usuario ve
un cambio visible el día que se despliega esta funcionalidad.

**Rationale**: FR-002, FR-007 y el Assumption "el logotipo reemplaza el nombre en texto". Mantener
dos fuentes de verdad (JSON estático + fila editable) para el mismo dato sería alcance fantasma de
complejidad que el Principio I no permite: una vez que el nombre es editable desde Ajustes, el JSON
estático queda obsoleto para ese campo específico.

**Alternatives considered**: Mantener `common.siteName` como "valor por defecto" y que el código
prefiera el de la base de datos si existe — rechazada: con la fila sembrada por migración (ver
Decisión 1), `site_settings` siempre tiene un valor, así que la doble fuente nunca aporta nada y
solo agrega una rama de código que nunca se ejecuta.

## 3. Cómo se lee la configuración desde componentes de servidor sin repetir la consulta

**Decision**: Una función `obtenerAjustesSitio()` en `lib/ajustes/consultas.ts`, envuelta en
`cache()` de `react` (ya parte de React 19, sin dependencia nueva), que hace un único
`db.select().from(siteSettings).where(eq(siteSettings.id, SITE_SETTINGS_ID))`. `NavBar`, `Footer`,
`PanelNav`, el layout del panel y `generateMetadata` de la portada la llaman; `cache()` asegura que
dentro de un mismo request-render solo se ejecute una consulta aunque varios componentes la
invoquen.

**Rationale**: Sigue el mismo patrón ya usado por `lib/catalogo/consultas-traducidas.ts` (una
función de consulta reutilizable, sin repetir SQL en cada componente). `cache()` es la herramienta
estándar de React Server Components para esto, ya disponible en la versión de React que usa el
proyecto (19.1.0) — no hace falta ninguna librería de manejo de estado ni de datos.

**Alternatives considered**: Pasar los ajustes como prop desde el layout raíz hacia abajo —
rechazada porque `Footer` y `Hero` viven dentro de `page.tsx` de la portada (no del layout), y
`PanelNav` vive en un árbol de rutas completamente distinto (`/panel`); encadenar props por varios
niveles de componentes que hoy no se comunican así sería más complejo que una función de consulta
cacheada por request.

## 4. Cómo se editan los ajustes básicos, logo, banner y SEO desde el panel

**Decision**: Una sola pantalla `/panel/ajustes` con un formulario que edita todo (nombre ES/EN,
correo, teléfono, logo, banner, SEO ES/EN e imagen de SEO) y se guarda con `PUT /api/panel/ajustes`
(reemplaza todos los campos editables de la fila única). El logo, el banner y la imagen de SEO
usan el componente ya existente `SubidaArchivo` (`app/[locale]/panel/_components/SubidaArchivo.tsx`),
igual que ya lo usan otras pantallas del panel para subir imágenes — sube directo a R2 vía
`subirDirecto` + el endpoint de presign ya existente (`app/api/panel/subidas/presignar/route.ts`) y
solo entrega la URL pública al formulario; el `PUT` guarda esa URL como texto.

**Rationale**: FR-001 a FR-011, FR-015, FR-016. Un solo formulario y un solo `PUT` es más simple
que separar en varias pantallas o varios endpoints (Principio I): todos estos campos pertenecen a
la misma fila única y se editan con la misma frecuencia (ocasional, por una sola persona a la vez
en la práctica). Reutilizar `SubidaArchivo` evita reinventar la lógica de selección, vista previa,
subida y manejo de error de archivo que ya existe y ya se prueba en otras pantallas.

**Alternatives considered**: Un endpoint `PATCH` que acepte solo los campos cambiados — rechazada:
el formulario de Ajustes siempre muestra y guarda el estado completo (no hay edición parcial
concurrente esperada de esta pantalla), así que un `PUT` que reemplaza todo es más simple de
razonar y de probar que una lógica de "merge parcial" que esta funcionalidad no necesita.

## 5. Cómo se administran las redes sociales (lista fija de plataformas)

**Decision**: `site_social_link` es una tabla aparte (no un array/jsonb en `site_settings`), con
columnas `platform` (enum `social_platform`: `instagram | facebook | tiktok | whatsapp | x |
youtube | linkedin`) y `url`. Se administra con el mismo patrón REST ya usado para `color` en un
modelo: `POST /api/panel/ajustes/redes` (crear), `PATCH /api/panel/ajustes/redes/[id]` (editar
plataforma o url), `DELETE /api/panel/ajustes/redes/[id]` (quitar). El orden mostrado es por
`created_at` ascendente (orden de creación, FR/edge case "en el orden en que se agregaron"): no
hace falta una columna de posición porque nadie reordena una vez agregada.

**Rationale**: FR-012 a FR-014. Un enum de Postgres impide en el nivel de datos que se guarde una
plataforma fuera de la lista fija decidida en `/speckit-clarify` (defensa además de la validación
en la API). Una tabla aparte (en vez de un campo jsonb con la lista completa) permite reutilizar
exactamente el mismo patrón CRUD por-fila que ya existe y ya se probó para `color`
(`app/api/panel/colores/[id]/route.ts`), en vez de inventar lógica de "reemplazar el array
completo" que el resto del proyecto no usa para listas editables de este tipo.

**Alternatives considered**:
- Campo `text` libre para la plataforma: rechazado por la clarificación explícita ("lista fija con
  iconos", no nombre libre).
- `jsonb` con el array completo de redes dentro de `site_settings`: rechazado porque el proyecto no
  tiene un precedente de editar sub-listas dentro de un jsonb desde el panel (los precedentes reales
  — colores, técnicas, vistas — son siempre tablas aparte con su propio CRUD), y mezclarlo con el
  `PUT` de ajustes básicos complicaría ese único endpoint con lógica de diff de array.

## 6. Iconos de las plataformas de redes sociales

**Decision**: Un mapa estático `SOCIAL_PLATFORM_ICONS` en el código (SVG en línea, uno por cada una
de las 7 plataformas de la lista fija), sin agregar ninguna librería de iconos nueva.

**Rationale**: Principio I — cualquier librería nueva debe justificarse por escrito, y la fuente de
íconos que ya carga el proyecto (Material Symbols, vía `<link>` en `app/layout.tsx`) no incluye
logos de marca (Instagram, TikTok, etc.), solo iconos genéricos. Con una lista fija de exactamente
7 plataformas que no cambia sin tocar código (ver Decisión 5), 7 SVGs en línea es más simple que
sumar una dependencia (`simple-icons`, `react-icons`) solo para eso.

**Alternatives considered**: Agregar `react-icons` o `simple-icons` — rechazada: son librerías
completas (miles de iconos) para resolver un caso de 7 iconos fijos; no se justifica el peso ni la
dependencia nueva frente a 7 SVGs propios (Principio I).

## 7. Tamaño y formato máximo de logo, banner e imagen de SEO

**Decision**: Se reutiliza el mismo límite y los mismos formatos ya usados por el endpoint de
presign del panel (`app/api/panel/subidas/presignar/route.ts`): PNG, JPEG, SVG o WEBP. Ese
endpoint hoy no valida tamaño máximo (a diferencia del presign público, que sí limita a 10 MB vía
`MAX_SIZE_BYTES`); esta funcionalidad le agrega la misma validación de tamaño máximo que ya existe
para el logo del cliente (`env.maxLogoMb`, por defecto 5 MB, configurable por `MAX_LOGO_MB`),
reutilizando la variable de entorno existente en vez de crear una nueva solo para este caso.

**Rationale**: FR-006. Evita inventar un número nuevo sin criterio de negocio (la spec no pidió uno
específico) y reutiliza exactamente el límite que el proyecto ya usa y ya documenta como "pendiente
de confirmar con la fábrica" — este feature no necesita resolver esa pregunta de negocio, solo no
dejar el endpoint de administración sin ningún límite (hoy no tiene ninguno).

**Alternatives considered**: Definir un límite distinto para banner (imagen más grande que un
logo) — rechazado por Principio III: la spec no distingue un límite por tipo de imagen, y agregar
esa distinción sin que se haya pedido sería alcance fantasma.

## 8. Dónde se aplica el banner en la página de inicio

**Decision**: El banner reemplaza, como imagen de fondo, el bloque marcador de posición que hoy
existe en `Hero.tsx` (línea con `role="img"` y clase `bg-surface-container`, dentro del contenedor
que también muestra el indicador "ARRASTRÁ PARA ROTAR"). Cuando no hay banner configurado, ese
bloque se sigue viendo exactamente como hoy (fondo sólido, sin imagen rota). El indicador "arrastrá
para rotar" no se toca: es parte de una futura vista 3D, fuera del alcance de esta spec (Principio
III), y sigue mostrándose igual que hoy independientemente del banner.

**Rationale**: FR-005, FR-008 y la clarificación de sesión 2026-09-13 ("imagen destacada solo en la
página de inicio, reemplaza el espacio de vista 3D/marcador de posición actual"). Es exactamente el
elemento que la clarificación describe.

**Alternatives considered**: Quitar también el indicador "arrastrá para rotar" cuando hay banner —
rechazado: ninguna FR de esta spec lo pide, y esa etiqueta pertenece a una funcionalidad futura (la
vista 3D) que esta spec no toca (Principio III).

## 9. SEO de la página de inicio (`generateMetadata`)

**Decision**: `app/[locale]/(site)/page.tsx` exporta `generateMetadata` (función async de Next.js),
que lee `obtenerAjustesSitio()` y arma `{ title, description, openGraph: { title, description,
images } }` en el idioma de la ruta. Si el título o la descripción de SEO no están configurados,
se usan valores por defecto ya existentes: el nombre del sitio (`site_settings.site_name_*`, que
siempre tiene valor) como título, y el texto ya existente `landing.hero.subtitle` (de
`messages/es.json` / `messages/en.json`) como descripción — no se inventa un texto nuevo.
`app/layout.tsx` (metadata raíz, estática) queda como respaldo final si `generateMetadata` fallara,
sin cambios.

**Rationale**: FR-009 a FR-011. Next.js combina metadata de layout y de página automáticamente, así
que no hace falta tocar el layout raíz. Usar `landing.hero.subtitle` como descripción por defecto
cumple FR-011 sin escribir un texto nuevo que alguien tendría que mantener sincronizado con el
mensaje real de la portada (Principio I: reusar antes que duplicar).

**Alternatives considered**: Dejar `description` ausente cuando no está configurada — rechazada:
FR-011 pide explícitamente un valor por defecto para descripción, no solo para título.

## 10. Tests automatizados de esta funcionalidad

**Decision**: Un test unitario nuevo, `tests/ajustes-sitio.test.ts`, para la función pura de
validación de los ajustes básicos (nombre ES/EN obligatorio, formato de URL de red social), siguiendo
el patrón de `tests/design-rules.test.ts`. La verificación principal sigue siendo manual en el
navegador (Principio IV), documentada en `quickstart.md`.

**Rationale**: El resto de la lógica (subida a R2, lectura/escritura en base de datos) ya está
cubierta por los patrones existentes reutilizados (`SubidaArchivo`, `subirDirecto`,
`crearUrlPrefirmada`) y no se le agregan tests nuevos por esta funcionalidad — solo la validación
nueva y específica de esta pantalla amerita una prueba unitaria propia.
