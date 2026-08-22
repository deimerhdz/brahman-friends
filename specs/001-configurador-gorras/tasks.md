---

description: "Lista de tareas para la implementación de la funcionalidad"
---

# Tasks: Configurador de gorras y solicitud de cotización

**Input**: Documentos de diseño en `/specs/001-configurador-gorras/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md),
[data-model.md](./data-model.md), [contracts/api.md](./contracts/api.md),
[contracts/design-payload.md](./contracts/design-payload.md), [quickstart.md](./quickstart.md)

**Tests**: se incluyen tareas de prueba **solo** para los siete módulos que
[research.md, decisión 18](./research.md#18-estrategia-de-pruebas) declara probados con Vitest
(reglas de negocio puras y paridad de traducciones). Todo lo demás se verifica recorriendo la
aplicación según [quickstart.md](./quickstart.md), como exige el Principio IV.

**Organization**: las tareas se agrupan por historia de usuario para poder implementarlas y
verificarlas de forma independiente.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: puede ejecutarse en paralelo (archivos distintos, sin dependencias pendientes)
- **[Story]**: a qué historia de usuario pertenece (US1…US5)
- Cada tarea incluye la ruta exacta del archivo

## Path Conventions

Proyecto único Next.js en la raíz del repositorio (`app/`, `lib/`, `messages/`, `tests/`,
`drizzle/`, `scripts/`), según la sección **Project Structure** de [plan.md](./plan.md).

---

## Phase 1: Setup (infraestructura compartida)

**Purpose**: dejar el proyecto arrancable, publicable y con las comprobaciones automáticas en su
sitio. El repositorio está vacío hoy.

- [X] T001 Inicializar el proyecto Next.js 15 (App Router) + React 19 + TypeScript 5 en la raíz: `package.json`, `tsconfig.json`, `next.config.ts`, `app/layout.tsx` mínimo
- [X] T002 Inicializar el repositorio git y crear `.gitignore` con `.env*`, `node_modules/`, `.next/` antes del primer commit (Principio V)
- [X] T003 Instalar y fijar las dependencias justificadas en `package.json`: `drizzle-orm`, `drizzle-kit`, `@neondatabase/serverless`, `@vercel/blob`, `pdf-lib`, `isomorphic-dompurify`, `resend`, `vitest`
- [X] T004 [P] Configurar Tailwind CSS v4 en `app/globals.css` y `postcss.config.mjs`, con enfoque móvil primero desde 360 px
- [X] T005 [P] Configurar Vitest en `vitest.config.ts` y añadir los scripts `test`, `typecheck`, `lint` en `package.json`
- [X] T006 [P] Configurar ESLint y Prettier en `eslint.config.mjs` y `.prettierrc`
- [X] T007 [P] Crear `.env.example` con `DATABASE_URL`, `BLOB_READ_WRITE_TOKEN`, `RESEND_API_KEY`, `ADMIN_NOTIFY_EMAIL`, `SESSION_SECRET`, `CRON_SECRET`, `MAX_LOGO_MB`, `LOGO_FORMATS`, `DEFAULT_ZONE_TEXT_CHARS`, `MAX_DECORATED_ZONES`
- [X] T008 [P] Crear `vercel.json` con las dos tareas programadas: `/api/cron/retencion` diaria y `/api/cron/correos` cada hora
- [X] T009 [P] Crear `README.md` con los pasos de arranque local de [quickstart.md](./quickstart.md) Parte 1

---

## Phase 2: Foundational (prerequisitos bloqueantes)

**Purpose**: base de datos, idioma, sesión del panel y almacenamiento. Sin esto ninguna historia
puede empezar: US1 es íntegramente panel autenticado y las cinco historias son bilingües.

**⚠️ CRITICAL**: ninguna historia de usuario puede comenzar hasta terminar esta fase

- [X] T010 Crear el lector de variables de entorno con valores por defecto de la spec en `lib/config/env.ts` (`MAX_LOGO_MB` 5, `LOGO_FORMATS` png,svg,jpg, `MAX_DECORATED_ZONES` 3, y `DEFAULT_ZONE_TEXT_CHARS` 20 **solo** como valor por defecto al crear una zona; el límite efectivo es `decoration_zone.max_text_chars`)
- [X] T011 Definir todas las tablas de [data-model.md](./data-model.md) en `lib/db/schema.ts`: `admin_user`, `color`, `cap_model`, `model_view`, `component`, `component_color`, `component_image`, `model_size`, `decoration_zone`, `technique`, `model_technique`, `logo_asset`, `request`, `request_image`, `request_size`, `request_status_history`, con sus claves únicas e índices
- [X] T012 Crear la conexión a Postgres en `lib/db/index.ts`
- [X] T013 Configurar `drizzle.config.ts`, generar la migración inicial en `drizzle/` y añadir el script `db:migrate` en `package.json`
- [X] T014 [P] Implementar el lector de traducciones `t()` en `lib/i18n/t.ts` (~30 líneas, sin librería)
- [X] T015 [P] Crear `messages/es.json` y `messages/en.json` con las claves comunes (navegación, botones, errores del contrato de API)
- [X] T016 [P] Crear la prueba de paridad de claves entre ambos idiomas en `tests/traducciones.test.ts` (Principio II)
- [X] T017 [P] Definir la lista fija de materiales bilingüe en `lib/catalogo/materiales.ts` (tela, hilo de bordado, plástico, metal)
- [X] T018 [P] Crear el ayudante de respuestas de error `{ error, detail }` con sus códigos HTTP en `lib/http/errors.ts` según [contracts/api.md](./contracts/api.md#convenciones)
- [X] T019 Implementar el layout de idioma con cookie y selector en `app/[locale]/layout.tsx` y `app/_components/SelectorIdioma.tsx` (FR-001, FR-002)
- [X] T020 [P] Redirigir la raíz al idioma guardado o `/es` en `app/page.tsx` y `middleware.ts`
- [X] T021 Implementar la cookie de sesión firmada (`HttpOnly`, `Secure`, `SameSite=Lax`) y su verificación en `lib/auth/session.ts` (FR-057)
- [X] T022 [P] Implementar el hash y la verificación de contraseña en `lib/auth/password.ts`
- [X] T023 Crear el comando de alta de usuarios del panel en `scripts/crear-admin.ts` y su script `crear-admin` en `package.json` (Assumption 13, sin registro público)
- [X] T024 Implementar `POST /api/panel/login` y `POST /api/panel/logout` en `app/api/panel/login/route.ts` y `app/api/panel/logout/route.ts`, con mismo mensaje y mismo tiempo de respuesta para correo inexistente y contraseña errada
- [X] T025 Crear la pantalla de login en `app/[locale]/panel/login/page.tsx`
- [X] T026 Proteger todas las pantallas del panel verificando la sesión en `app/[locale]/panel/layout.tsx`, redirigiendo al login si no hay sesión (SC-022)
- [X] T027 [P] Implementar la subida al almacenamiento de objetos en `lib/media/storage.ts` (Vercel Blob), con el permiso de origen cruzado que el canvas necesitará

**Checkpoint**: base lista — las historias de usuario pueden empezar

---

## Phase 3: User Story 1 - Publicar un modelo en el catálogo (Priority: P1) 🎯 MVP

**Goal**: el administrador registra un modelo con sus componentes, colores, imágenes, zonas y
tallas, y lo publica solo cuando está completo.

**Independent Test**: recorrido A de [quickstart.md](./quickstart.md#a-el-administrador-publica-un-modelo-historia-1) — entrar al panel, crear un modelo con un componente y dos colores, cargar sus imágenes y publicarlo. Cubre SC-004, SC-022, SC-023, SC-024, SC-030, SC-033.

### Tests para User Story 1 ⚠️

> Escribir primero y comprobar que fallan antes de implementar

- [X] T028 [P] [US1] Prueba de igualdad de dimensiones de las imágenes de un modelo en `tests/dimensiones.test.ts` (FR-011, RN5)
- [X] T029 [P] [US1] Prueba de qué combinaciones faltan para publicar en `tests/publicacion.test.ts` (FR-012, RN2, RN9, FR-006)
- [X] T030 [P] [US1] Prueba de que la deformación no saca el elemento de su zona en `tests/warp.test.ts` (FR-035, SC-013)

### Implementación para User Story 1

- [X] T031 [P] [US1] Implementar la validación de dimensiones en `lib/media/dimensiones.ts` (FR-011, RN5)
- [X] T032 [P] [US1] Implementar la deformación por arco, inclinación y estrechamiento en `lib/design/warp.ts` (~50 líneas, sin dependencias; FR-035)
- [X] T033 [US1] Implementar la comprobación de publicación en `lib/catalogo/publicacion.ts`: imágenes faltantes por componente/color/vista, vistas base sin imagen, componentes sin color habilitado, color por defecto disponible, vista `front` activa (FR-012, RN2, RN9)
- [X] T034 [US1] Crear el listado de colores en `app/[locale]/panel/colores/page.tsx` (FR-016, FR-017)
- [X] T035 [US1] Crear el formulario de alta y edición de color en `app/[locale]/panel/colores/[id]/page.tsx`: nombre bilingüe, referencia de proveedor, material, foto de la muestra, disponibilidad (FR-016, FR-017, FR-021)
- [X] T036 [US1] Implementar las rutas de color en `app/api/panel/colores/route.ts` y `app/api/panel/colores/[id]/route.ts`, impidiendo eliminar un color usado y ofreciendo descontinuarlo (FR-023, RN8)
- [X] T037 [US1] Crear el listado de modelos en `app/[locale]/panel/modelos/page.tsx` (FR-005, FR-013)
- [X] T038 [US1] Crear el alta de modelo (código interno, nombre y descripción bilingües) en `app/[locale]/panel/modelos/nuevo/page.tsx` y `app/api/panel/modelos/route.ts` (FR-005)
- [X] T039 [US1] Crear la pantalla de edición del modelo con sus secciones en `app/[locale]/panel/modelos/[id]/page.tsx`
- [X] T040 [US1] Implementar la activación de vistas y la carga de la imagen base por vista en `app/[locale]/panel/modelos/[id]/vistas/page.tsx` y `app/api/panel/modelos/[id]/vistas/route.ts`, con `front` obligatoria (FR-006, FR-008)
- [X] T041 [US1] Implementar el alta de componentes (nombre bilingüe, material, personalizable, orden de capa, color por defecto) en `app/[locale]/panel/modelos/[id]/componentes/page.tsx` y `app/api/panel/modelos/[id]/componentes/route.ts` (FR-007)
- [X] T042 [US1] Implementar la habilitación de colores por componente en `app/api/panel/componentes/[id]/colores/route.ts`, rechazando cuando el material del color no coincide con el del componente (FR-019, RN6, SC-004)
- [X] T043 [US1] Implementar `POST /api/panel/subidas/autorizar` en `app/api/panel/subidas/autorizar/route.ts` para que el navegador suba directo al almacenamiento
- [X] T044 [US1] Implementar la carga masiva en `app/[locale]/panel/modelos/[id]/imagenes/page.tsx`: soltar una carpeta, interpretar el convenio `vista_componente_color.png`, mostrar la matriz de cargadas y faltantes y listar aparte los archivos que no encajan (FR-010, decisión 14)
- [X] T045 [US1] Leer las dimensiones de cada archivo en el navegador y rechazar antes de subir las que no coincidan con las del modelo, en `app/[locale]/panel/modelos/[id]/imagenes/_lib/leer-dimensiones.ts` (FR-011, SC-024)
- [X] T046 [US1] Implementar `POST /api/panel/modelos/:id/imagenes` en `app/api/panel/modelos/[id]/imagenes/route.ts`: registro por lotes que se rechaza entero si alguna dimensión no coincide, indicando cuáles (FR-009, FR-011, SC-024)
- [X] T047 [US1] Implementar `POST /api/panel/modelos/:id/publicar` y la despublicación en `app/api/panel/modelos/[id]/publicar/route.ts`, devolviendo `publicacion_incompleta` con `missing`, `missingBaseViews` y `componentsWithoutColors` (FR-012, FR-013, SC-023)
- [X] T048 [US1] Mostrar en pantalla la lista exacta de combinaciones faltantes al intentar publicar, en `app/[locale]/panel/modelos/[id]/_components/EstadoPublicacion.tsx` (FR-012, SC-023)
- [X] T049 [US1] Crear el editor de zonas decorables en `app/[locale]/panel/modelos/[id]/zonas/page.tsx`: posición, medidas en cm (11 × 5,5 por defecto en la frontal), caja en píxeles, las tres perillas de curvatura y el límite de caracteres de la zona (20 por defecto, editable por zona) (FR-034, FR-035, FR-044)
- [X] T050 [US1] Mostrar la vista previa en vivo del efecto de la curvatura sobre la imagen base usando `lib/design/warp.ts`, en `app/[locale]/panel/modelos/[id]/zonas/_components/PreviaCurvatura.tsx` (FR-035a, SC-033)
- [X] T051 [US1] Implementar las rutas de zonas en `app/api/panel/modelos/[id]/zonas/route.ts`
- [X] T052 [US1] Implementar el alta de tallas del modelo en `app/[locale]/panel/modelos/[id]/tallas/page.tsx` y `app/api/panel/modelos/[id]/tallas/route.ts` (FR-015)
- [X] T053 [US1] Implementar el alta de técnicas de decoración y su asociación al modelo en `app/[locale]/panel/tecnicas/page.tsx` y `app/api/panel/tecnicas/route.ts` (FR-036)
- [X] T054 [US1] Añadir todas las claves de texto del panel de catálogo a `messages/es.json` y `messages/en.json` (FR-001, SC-030)

**Checkpoint**: US1 completa y verificable sola con el recorrido A

---

## Phase 4: User Story 2 - Diseñar la gorra eligiendo colores (Priority: P1)

**Goal**: el cliente abre un modelo publicado, cambia colores, recorre las vistas y su diseño
sobrevive a una recarga.

**Independent Test**: recorrido B de [quickstart.md](./quickstart.md#b-el-cliente-diseña-la-gorra-historia-2), en un teléfono real con datos móviles. Cubre SC-001, SC-002, SC-003, SC-005, SC-007, SC-008, SC-029.

**Depende de**: US1 solo para tener datos con que probar; el código no depende de US1.

### Implementación para User Story 2

- [X] T055 [US2] Crear el listado de modelos publicados con su estado vacío en `app/[locale]/page.tsx` (FR-014, edge case «no hay modelos publicados»)
- [X] T056 [US2] Implementar `GET /api/imagenes-modelo/:modelId` en `app/api/imagenes-modelo/[modelId]/route.ts`, devolviendo el mapa componente/color/vista ordenado con la vista frontal y los colores por defecto primero (FR-031a)
- [X] T057 [P] [US2] Implementar el borrador en `localStorage` con clave `bf.design.v1` y `submissionId` estable en `lib/design/borrador.ts`, con la forma 1 de [design-payload.md](./contracts/design-payload.md) (FR-032, FR-054)
- [X] T058 [US2] Crear la página del configurador con la vista frontal y los colores por defecto ya renderizados en el servidor, en `app/[locale]/configurador/[modelId]/page.tsx` (FR-029, FR-031a)
- [X] T059 [US2] Implementar el apilado de capas de imagen por `layer_order` en `app/[locale]/configurador/[modelId]/_components/CapasGorra.tsx` (FR-024, decisión 6)
- [X] T060 [US2] Implementar el selector de color por componente con nombre comercial, foto de la muestra y aviso de color aproximado, en `app/[locale]/configurador/[modelId]/_components/SelectorColor.tsx` (FR-020, FR-021, FR-022, RN10)
- [X] T061 [US2] Implementar el cambio de vista con miniaturas y botones de avance y retroceso, incluyendo el lateral derecho reflejado horizontalmente, en `app/[locale]/configurador/[modelId]/_components/Vistas.tsx` (FR-025, FR-026, FR-027, SC-005)
- [X] T062 [US2] Implementar la descarga en segundo plano del resto de vistas y colores, y el indicador de progreso por componente cuando su imagen aún no está lista, en `app/[locale]/configurador/[modelId]/_components/Precarga.tsx` (FR-031, FR-031a, FR-031b, SC-008)
- [X] T063 [US2] Implementar restablecer el diseño con confirmación previa en `app/[locale]/configurador/[modelId]/_components/Restablecer.tsx` (FR-030, SC-007)
- [X] T064 [US2] Restaurar el borrador al abrir y validar sus invariantes (versión, modelo publicado, colores disponibles) señalando qué corregir, en `lib/design/borrador.ts` y `app/[locale]/configurador/[modelId]/_components/AvisoDisponibilidad.tsx` (FR-032, FR-033, SC-009)
- [X] T065 [US2] Informar del fallo al descargar imágenes del modelo y ofrecer reintentar sin perder la configuración, en `app/[locale]/configurador/[modelId]/_components/ErrorImagenes.tsx` (edge case de la spec)
- [X] T066 [US2] Ajustar el configurador a 360 px de ancho con los controles principales anclados abajo al alcance del pulgar, en `app/[locale]/configurador/[modelId]/_components/BarraControles.tsx` (FR-004, SC-029)
- [X] T067 [US2] Añadir las claves de texto del configurador a `messages/es.json` y `messages/en.json` (FR-001, SC-030)

**Checkpoint**: US1 y US2 funcionan de forma independiente — ya hay producto demostrable

---

## Phase 5: User Story 3 - Decorar con logotipo y texto (Priority: P2)

**Goal**: el cliente sube un logotipo o escribe un texto, lo ubica en una zona permitida, lo
dimensiona y lo ve adaptado a la curvatura.

**Independent Test**: recorrido C de [quickstart.md](./quickstart.md#c-el-cliente-decora-historia-3). Cubre SC-006, SC-010, SC-011, SC-012, SC-013, SC-014, SC-015, SC-016, SC-028a, SC-009.

**Depende de**: US2 (necesita el lienzo del configurador) y de las zonas definidas en US1.

### Tests para User Story 3 ⚠️

- [X] T068 [P] [US3] Prueba de los límites de decoración en `tests/design-rules.test.ts`: dentro de la zona, un elemento por zona, máximo tres zonas (RN11, RN12, RN13)

### Implementación para User Story 3

- [X] T069 [US3] Implementar las reglas de decoración en `lib/design/rules.ts` (FR-043, FR-045, RN11, RN12, RN13)
- [X] T070 [P] [US3] Implementar el saneo de SVG con `isomorphic-dompurify` en `lib/media/sanitize-svg.ts`, rechazando el archivo si tras la limpieza deja de ser un dibujo válido (FR-037a, FR-037b)
- [X] T071 [US3] Implementar `POST /api/logos` en `app/api/logos/route.ts`: validar formato (`400 formato_no_permitido`), peso (`413 archivo_demasiado_grande` con `detail.maxMb`), sanear el SVG (`422 svg_no_valido_tras_saneo`) y devolver `logoAssetId`, `url`, dimensiones y `warnings` (FR-037, FR-037a, FR-038, SC-011, SC-028a)
- [X] T072 [US3] Crear la carga del logotipo con sus avisos de baja resolución y fondo no transparente, y el aviso de que el cliente es responsable de los derechos de uso del archivo y de que Brahman Friends puede rechazar contenido que infrinja derechos de terceros o resulte ofensivo, en `app/[locale]/configurador/[modelId]/_components/SubirLogo.tsx` (FR-037, RN16, edge cases de la spec)
- [X] T073 [US3] Dibujar cada elemento decorativo deformado en un `<canvas>` con `lib/design/warp.ts`, sobre la zona correspondiente, en `app/[locale]/configurador/[modelId]/_components/Decoracion.tsx` (FR-041, SC-013)
- [X] T074 [US3] Implementar el arrastre con eventos de puntero y el regreso a la posición válida más cercana al salir de la zona, en `app/[locale]/configurador/[modelId]/_components/ArrastrarElemento.tsx` (FR-040, decisión 16)
- [X] T075 [US3] Implementar el redimensionado con pellizco y con deslizador visible, deteniéndose en el máximo de la zona, en `app/[locale]/configurador/[modelId]/_components/RedimensionarElemento.tsx` (FR-043, SC-014)
- [X] T076 [US3] Implementar el elemento de texto con contenido, tipografía del conjunto curado, color y tamaño, dentro del límite de caracteres de la zona leído de `decoration_zone.max_text_chars` —nunca de `lib/config/env.ts`—, en `app/[locale]/configurador/[modelId]/_components/EditorTexto.tsx` (FR-044, Assumption 14)
- [X] T077 [US3] Mostrar cada elemento solo en las vistas donde su zona es visible, sin reflejar los elementos en la vista del lateral derecho, en `app/[locale]/configurador/[modelId]/_components/Decoracion.tsx` (FR-026, FR-042, SC-006, SC-012)
- [X] T078 [US3] Implementar eliminar un elemento decorativo y liberar su zona en `app/[locale]/configurador/[modelId]/_components/Decoracion.tsx` (FR-046, SC-016)
- [X] T079 [US3] Implementar el selector de técnica, único para todo el diseño, en `app/[locale]/configurador/[modelId]/_components/SelectorTecnica.tsx` (FR-047, RN14)
- [X] T080 [US3] Aplicar en la interfaz el máximo de zonas decoradas y el único elemento por zona con sus mensajes, usando `lib/config/env.ts` y `lib/design/rules.ts` (FR-045, SC-015)
- [X] T081 [US3] Persistir las decoraciones —incluido `logoAssetId`— en el borrador de `lib/design/borrador.ts` y restaurarlas tras una recarga (FR-032, SC-009)
- [X] T082 [US3] Añadir las claves de texto de decoración a `messages/es.json` y `messages/en.json` (FR-001, SC-030)

**Checkpoint**: el diseño completo del cliente funciona de extremo a extremo, sin envío

---

## Phase 6: User Story 4 - Enviar la solicitud de cotización (Priority: P2)

**Goal**: el cliente indica cantidad y tallas, revisa el resumen, deja sus datos y recibe un código.

**Independent Test**: recorrido D de [quickstart.md](./quickstart.md#d-el-cliente-envía-la-solicitud-historia-4). Cubre SC-017, SC-018, SC-019, SC-020, SC-020a.

**Depende de**: US2 y US3 para tener un diseño que enviar.

### Tests para User Story 4 ⚠️

- [X] T083 [P] [US4] Prueba del cuadre entre cantidad total y distribución por tallas en `tests/tallas.test.ts` (FR-048, RN17)

### Implementación para User Story 4

- [X] T084 [US4] Implementar el cuadre de tallas en `lib/solicitud/tallas.ts` (FR-048, RN17)
- [X] T085 [P] [US4] Implementar la generación del código único e irrepetible en `lib/solicitud/codigo.ts`, apoyada en la unicidad de la base de datos (FR-052, RN20)
- [X] T086 [US4] Implementar la composición de una imagen PNG por vista en el navegador con `crossOrigin="anonymous"` en `lib/design/compose.ts`, reutilizando `lib/design/warp.ts` (FR-053, decisión 9)
- [X] T087 [US4] Subir las imágenes compuestas al almacenamiento antes de registrar la solicitud, en `app/[locale]/solicitud/_lib/subir-vistas.ts` (FR-053)
- [X] T088 [US4] Crear la pantalla de cantidad y distribución por tallas, con el bloqueo mientras no cuadren, en `app/[locale]/solicitud/page.tsx` (FR-048, SC-017)
- [X] T089 [US4] Mostrar el resumen con modelo, color por componente, elementos decorativos, técnica, cantidad y tallas, junto a la advertencia de que enviar la solicitud no genera precio automático ni constituye compromiso de venta, en `app/[locale]/solicitud/_components/Resumen.tsx` (FR-049, RN18, SC-018)
- [X] T090 [US4] Crear el formulario de contacto con nombre, correo, teléfono, comentarios opcionales, enlace a `/[locale]/politica-privacidad` (T090a) y aceptación del tratamiento de datos, en `app/[locale]/solicitud/_components/FormularioContacto.tsx` (FR-050, FR-051, FR-065, FR-066, FR-067, SC-019)
- [X] T090a [US4] Crear la página de política de tratamiento de datos personales en `app/[locale]/politica-privacidad/page.tsx`, con las claves de texto en `messages/es.json` y `messages/en.json`: qué datos se piden, para qué se usan, cuánto se conservan (12 meses tras estado final) y cómo pedir la anonimización (FR-066, FR-067, RN22, RN23)
- [X] T091 [US4] Construir el diseño congelado copiando los valores del catálogo —nunca solo identificadores— en `lib/solicitud/snapshot.ts`, según la forma 2 de [design-payload.md](./contracts/design-payload.md) (FR-053, FR-060, RN19, SC-021)
- [X] T092 [US4] Implementar `POST /api/solicitudes` en `app/api/solicitudes/route.ts` con las seis comprobaciones en orden (`submissionId` repetido, modelo publicado, colores disponibles, tallas, contacto, decoración) y la escritura de `request`, `request_size`, `request_image` y el `logo_asset` en una sola transacción (FR-052, FR-054, RN4, RN17, RN19)
- [X] T093 [US4] Implementar el envío del correo al cliente y al administrador en ambos idiomas en `lib/email/enviar.ts` con el SDK de Resend (FR-056)
- [X] T094 [US4] Disparar la notificación después de responder al cliente y registrar `notification_status` y `notification_attempts` sin afectar la respuesta, en `app/api/solicitudes/route.ts` (FR-056a, RN20a)
- [X] T095 [US4] Crear la pantalla de confirmación con el código y el aviso de posible demora cuando `notificationPending` es verdadero y la aclaración de que el equipo comercial responderá con la cotización por fuera del sistema, en `app/[locale]/solicitud/[codigo]/page.tsx` (FR-052, FR-056a, RN18, SC-020, SC-020a)
- [X] T096 [US4] Bloquear el doble envío y conservar el diseño para reintentar tras un fallo de red, en `app/[locale]/solicitud/_components/BotonEnviar.tsx` (FR-054, FR-055)
- [X] T097 [US4] Implementar `POST /api/cron/correos` protegido con `CRON_SECRET` en `app/api/cron/correos/route.ts`, reintentando las notificaciones pendientes y fallidas (FR-056b)
- [X] T098 [US4] Añadir las claves de texto de la solicitud y de los correos a `messages/es.json` y `messages/en.json` (FR-001, SC-030)

**Checkpoint**: el ciclo del cliente está cerrado — hay producto entregable sin US5

---

## Phase 7: User Story 5 - Gestionar y cotizar las solicitudes (Priority: P3)

**Goal**: el equipo lista, abre, descarga y cambia el estado de las solicitudes, y puede
anonimizarlas.

**Independent Test**: recorrido E de [quickstart.md](./quickstart.md#e-el-equipo-gestiona-las-solicitudes-historia-5). Cubre SC-021, SC-025, SC-026, SC-027, SC-028, SC-032, SC-034.

**Depende de**: US4 para tener solicitudes que gestionar.

### Tests para User Story 5 ⚠️

- [X] T099 [P] [US5] Prueba de las transiciones permitidas y prohibidas de la solicitud en `tests/estados.test.ts` (FR-063, RN21, SC-026)

### Implementación para User Story 5

- [X] T100 [US5] Implementar la máquina de estados en `lib/solicitud/estados.ts` (FR-063, RN21)
- [X] T101 [US5] Crear el listado de solicitudes con código, fecha, cliente, cantidad y estado, filtros por estado y rango de fechas, y la señal de notificación pendiente, en `app/[locale]/panel/solicitudes/page.tsx` (FR-058, FR-056b, SC-020a)
- [X] T102 [US5] Crear el detalle con las imágenes congeladas del diseño y la ficha técnica —referencia de material por componente y medidas en cm de cada elemento— leída de `design_snapshot`, en `app/[locale]/panel/solicitudes/[id]/page.tsx` (FR-059, FR-060, SC-025, SC-021)
- [X] T103 [US5] Implementar `PATCH /api/panel/solicitudes/:id/estado` en `app/api/panel/solicitudes/[id]/estado/route.ts`, devolviendo `409 transicion_no_permitida` con `detail.allowed` y escribiendo la fila de historial con usuario y fecha (FR-062, FR-063, SC-026, SC-027)
- [X] T104 [US5] Mostrar el cambio de estado y el historial con fecha y nombre del responsable en `app/[locale]/panel/solicitudes/[id]/_components/Historial.tsx` (FR-062, SC-027)
- [X] T105 [US5] Implementar `GET /api/panel/solicitudes/:id/logo` en `app/api/panel/solicitudes/[id]/logo/route.ts`: mapas de bits en su resolución original, SVG en su forma saneada, sin reescalar ni recomprimir, y `410 logo_eliminado` si está anonimizada (FR-061, FR-037b, SC-028, SC-034)
- [X] T106 [US5] Generar la ficha técnica en PDF desde `design_snapshot` con `pdf-lib` en `app/api/panel/solicitudes/[id]/ficha.pdf/route.ts` (FR-064, SC-025)
- [X] T107 [US5] Exportar el listado en CSV con los mismos filtros de la pantalla en `app/api/panel/solicitudes.csv/route.ts` (FR-058, FR-064)
- [X] T108 [US5] Implementar `POST /api/panel/solicitudes/:id/anonimizar` en `app/api/panel/solicitudes/[id]/anonimizar/route.ts`: borrar nombre, correo, teléfono y logotipo, registrar `anonymized_at` y `anonymized_by`, y `409 ya_anonimizada` si ya lo estaba (FR-069, FR-070)
- [X] T109 [US5] Añadir la confirmación explícita de irreversibilidad y ocultar los datos de contacto y la descarga del logotipo tras anonimizar, en `app/[locale]/panel/solicitudes/[id]/_components/Anonimizar.tsx` (RN23, SC-034)
- [X] T110 [US5] Implementar `POST /api/cron/retencion` protegido con `CRON_SECRET` en `app/api/cron/retencion/route.ts`: anonimizar solicitudes con estado final de más de 12 meses y borrar logotipos huérfanos de más de 30 días (FR-039, FR-068, FR-070)
- [X] T111 [US5] Añadir las claves de texto del panel de solicitudes a `messages/es.json` y `messages/en.json` (FR-001, SC-030)

**Checkpoint**: las cinco historias funcionan de forma independiente

---

## Phase 8: Polish & Cross-Cutting Concerns

- [X] T112 [P] Documentar en `README.md` la publicación en Vercel, las variables de entorno y la programación de las dos tareas
- [X] T113 [P] Revisar que no haya secretos en el repositorio ni campos de datos que la spec no pida (Principio V, paso 5 del Flujo de Trabajo)
- [ ] T114 Medir el presupuesto de 5 s en 4G con un teléfono real y ajustar el orden de descarga en `app/[locale]/configurador/[modelId]/_components/Precarga.tsx` si no se cumple (SC-008)
- [ ] T115 Recorrer todas las pantallas a 360 px de ancho y corregir los desbordes horizontales (FR-004, SC-029)
- [ ] T116 [P] Verificar que la subida al almacenamiento permite el origen cruzado y que el canvas exporta sin quedar «manchado» (decisión 9, riesgo abierto)
- [X] T117 Ejecutar `npm test`, `npm run typecheck` y `npm run lint` y dejarlos en verde
- [ ] T118 Recorrer completos los itinerarios A a E de [quickstart.md](./quickstart.md) en español y en inglés
- [ ] T119 Ejecutar el recorrido F de [quickstart.md](./quickstart.md#f-la-prueba-final-alguien-de-fuera) con una persona ajena al equipo (SC-031)
- [ ] T120 Confirmar con la fábrica los valores marcados con ⚠ y actualizarlos en `.env.example` y en el proyecto de Vercel antes de dar por terminada la historia 3

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Fase 1)**: sin dependencias
- **Foundational (Fase 2)**: depende de la Fase 1 — **bloquea todas las historias**
- **US1 (Fase 3)**: depende de la Fase 2
- **US2 (Fase 4)**: depende de la Fase 2; necesita datos de US1 solo para probarse
- **US3 (Fase 5)**: depende de US2 (lienzo del configurador) y de las zonas de US1
- **US4 (Fase 6)**: depende de US2 y US3 (un diseño que enviar)
- **US5 (Fase 7)**: depende de US4 (solicitudes que gestionar)
- **Polish (Fase 8)**: depende de las historias que se quieran entregar

### Dentro de cada historia

- Las pruebas de reglas puras se escriben antes que su implementación
- Módulos de `lib/` antes que las rutas de `app/api/`, y estas antes que las pantallas
- Las claves de traducción cierran cada historia

### Parallel Opportunities

- Fase 1: T004–T009 en paralelo tras T001–T003
- Fase 2: T014–T018, T020, T022 y T027 en paralelo; T011→T012→T013 en secuencia
- US1: T028, T029 y T030 en paralelo; luego T031 y T032 en paralelo
- US1: la rama de colores (T034–T036) y la rama de modelos (T037–T041) son independientes
- US2: T057 en paralelo con T055 y T056
- US3: T068 y T070 en paralelo
- US4: T083 y T085 en paralelo
- Con equipo: una persona en US1 (panel) y otra en US2 (cliente) desde el final de la Fase 2

---

## Parallel Example: User Story 1

```bash
# Las tres pruebas de reglas puras, juntas:
Task: "Prueba de dimensiones en tests/dimensiones.test.ts"
Task: "Prueba de publicación en tests/publicacion.test.ts"
Task: "Prueba de deformación en tests/warp.test.ts"

# Después, los dos módulos independientes:
Task: "lib/media/dimensiones.ts"
Task: "lib/design/warp.ts"
```

---

## Implementation Strategy

### MVP (US1 + US2)

El MVP son **dos** historias, no una: ambas son P1 y ninguna entrega valor sola —un catálogo
publicado que nadie puede ver, o un configurador sin modelos que mostrar.

1. Fase 1: Setup
2. Fase 2: Foundational
3. Fase 3: US1 → recorrido A
4. Fase 4: US2 → recorrido B en un teléfono real
5. **PARAR Y VALIDAR**: el cliente ve su gorra y cambia colores

### Entrega incremental

1. Setup + Foundational → base lista
2. + US1 y US2 → catálogo y configurador (MVP demostrable)
3. + US3 → el cliente decora → recorrido C
4. + US4 → llegan solicitudes por el sistema, no por chat → recorrido D
5. + US5 → el equipo deja de trabajar desde el correo → recorrido E
6. Polish → recorrido F decide si la versión 1 sale

**Recomendación de [research.md](./research.md#riesgos-abiertos)**: publicar con **un** modelo
cargado y sumar los demás después. Las ~540 imágenes por modelo son el trabajo real de esta versión.

---

## Notes

- `[P]` = archivos distintos, sin dependencias pendientes
- Cada tarea apunta al requisito que la pide (Principio III): una tarea sin requisito es alcance
  fantasma
- Las historias 1 y 2 son ambas P1; el resto sigue el orden P2 → P2 → P3 de la spec
- Confirmar cada checkpoint recorriendo el itinerario correspondiente de
  [quickstart.md](./quickstart.md) antes de pasar a la historia siguiente (Principio IV)
