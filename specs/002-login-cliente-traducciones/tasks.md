---

description: "Task list template for feature implementation"
---

# Tasks: Login de cliente y traducciones por tabla independiente

**Input**: Design documents from `/specs/002-login-cliente-traducciones/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/api.md](./contracts/api.md), [quickstart.md](./quickstart.md)

**Tests**: incluidas solo donde el plan las pide explícitamente (reglas de negocio puras: umbral de
bloqueo por intentos fallidos, y validación de que ambos idiomas estén presentes al guardar). El
resto de la funcionalidad se verifica recorriendo la app según [quickstart.md](./quickstart.md)
(Principio IV de la constitution).

**Organización**: las tareas están agrupadas por historia de usuario, para poder implementar y
probar cada una por separado. Ambas historias son independientes entre sí (spec: "No bloquea la
Historia 1"); no hay Fase de Setup ni Fase Fundacional con tareas propias, porque esta
funcionalidad no agrega ninguna dependencia ni pieza compartida nueva — reutiliza por completo lo
que `001-configurador-gorras` ya construyó (lector de i18n, contrato de errores, patrón de sesión
firmada, `scrypt`). Ver [research.md](./research.md#justificación-de-dependencias-principio-i).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: puede ejecutarse en paralelo (archivos distintos, sin dependencias pendientes)
- **[Story]**: a qué historia de usuario pertenece (US1, US2)
- Cada tarea incluye la ruta exacta del archivo

---

## Phase 1: Setup

*No aplica.* Ninguna dependencia, variable de entorno ni configuración de proyecto nueva (ver
[research.md](./research.md#justificación-de-dependencias-principio-i)); se reutiliza el proyecto
Next.js/Drizzle/Vitest ya configurado en `001-configurador-gorras`.

## Phase 2: Foundational

*No aplica.* Las dos historias no comparten ninguna pieza nueva: la Historia 1 (cuenta y sesión de
cliente) y la Historia 2 (tablas de traducción) tocan tablas, rutas y componentes distintos. Cada
una define lo que necesita dentro de su propia fase, tal como recomienda esta plantilla cuando no
hay un prerrequisito real que bloquee a ambas.

---

## Phase 3: User Story 1 - Un cliente inicia sesión desde la página de inicio (Priority: P1) 🎯 MVP

**Goal**: un visitante puede registrarse o iniciar sesión desde cualquier página del sitio (incluida
la de inicio) y queda identificado mientras navega, con una cuenta separada de la del panel.

**Independent Test**: recorridos A, B y C de [quickstart.md](./quickstart.md#a-un-visitante-nuevo-se-registra-desde-la-página-de-inicio-historia-1).

### Tests para User Story 1 ⚠️

> Escribir esta prueba primero y confirmar que falla antes de implementar.

- [X] T001 [P] [US1] Prueba del umbral y la expiración del bloqueo por intentos fallidos en `tests/login-lockout.test.ts` (FR-010c)

### Implementación para User Story 1

- [X] T002 [P] [US1] Agregar la tabla `customer` a `lib/db/schema.ts`: `id`, `name`, `email` único, `password_hash`, `active`, `failed_login_attempts`, `locked_until`, `created_at` (data-model.md#bloque-1--cliente-y-sesión, FR-002, FR-008, FR-010c)
- [X] T003 [US1] Generar y aplicar la migración de la tabla `customer` con `drizzle-kit generate` en `drizzle/` y `npm run db:migrate` (depende de T002) — **nota de implementación**: T002 y T015 se editaron antes de generar, así que `drizzle-kit generate` produjo un solo archivo (`drizzle/0001_customer_and_translations.sql`) con `customer` y las tablas de traducción juntas; aplicar ese archivo cubre T003 y T016 a la vez. Pendiente de aplicar contra la base de datos real — requiere confirmación explícita por el `DROP COLUMN` que incluye.
- [X] T004 [US1] Implementar `lib/auth/login-lockout.ts`: umbral de 5 intentos fallidos consecutivos → bloqueo de 15 minutos, con funciones puras para registrar un intento fallido, comprobar si está bloqueado, y reiniciar el contador (`failedLoginAttempts` a 0, `lockedUntil` a null) tras un login exitoso (FR-010c) (depende de T001)
- [X] T005 [P] [US1] Implementar `lib/auth/customer-session.ts`: cookie `bf_customer_session` (`HttpOnly`, `Secure`, `SameSite=Lax`), firmada con `SESSION_SECRET`, payload `{ customerId, email, name }` — mismo patrón que `lib/auth/session.ts`, módulo separado (FR-006, FR-007, FR-009)
- [X] T006 [P] [US1] Agregar el código de error `correo_ya_registrado` (409) a `lib/http/errors.ts` (FR-003)
- [X] T007 [US1] Implementar `POST /api/cliente/registro` en `app/api/cliente/registro/route.ts`: crea la cuenta, rechaza correo duplicado, deja la sesión de cliente puesta (FR-002, FR-003, FR-008) (depende de T002, T003, T005, T006)
- [X] T008 [US1] Implementar `POST /api/cliente/login` en `app/api/cliente/login/route.ts`: mismo contrato de error genérico y mismo truco de hash señuelo que `app/api/panel/login/route.ts`, consultando `lib/auth/login-lockout.ts` antes de verificar la contraseña, y reiniciando el contador de intentos al autenticar con éxito (FR-004, FR-005, FR-010c) (depende de T002, T003, T004, T005)
- [X] T009 [US1] Implementar `POST /api/cliente/logout` en `app/api/cliente/logout/route.ts` (FR-007) (depende de T005)
- [X] T010 [US1] Crear la página y el formulario de inicio de sesión de cliente en `app/[locale]/cuenta/ingresar/page.tsx` y `app/[locale]/cuenta/ingresar/_LoginForm.tsx` (FR-004, FR-005, FR-010) (depende de T008)
- [X] T011 [US1] Crear la página y el formulario de registro de cliente en `app/[locale]/cuenta/registro/page.tsx` y `app/[locale]/cuenta/registro/_RegistroForm.tsx` (FR-002, FR-003, FR-010) (depende de T007)
- [X] T012 [US1] Agregar el control de cuenta al encabezado compartido en `app/[locale]/layout.tsx`: enlaces a ingresar/registrarse sin sesión, nombre del cliente y cerrar sesión con sesión activa, leyendo la sesión de cliente en el servidor (FR-001, FR-006, FR-007) (depende de T005, T009)
- [X] T013 [P] [US1] Agregar las claves de texto del espacio `cuenta` (login, registro, errores) a `messages/es.json` y `messages/en.json` (FR-010)

**Checkpoint**: la Historia 1 es funcional y comprobable de forma independiente (recorridos A–C de
quickstart.md), sin depender de nada de la Historia 2.

---

## Phase 4: User Story 2 - Un administrador edita textos traducibles sin campos duplicados (Priority: P2)

**Goal**: los formularios de modelo, color, componente y técnica muestran un solo campo por
atributo traducible con un switch ES/EN, respaldado por una tabla de traducción propia de cada
entidad, sin perder contenido existente.

**Independent Test**: recorridos D, E y F de [quickstart.md](./quickstart.md#d-un-administrador-edita-un-color-sin-campos-duplicados-historia-2).

### Tests para User Story 2 ⚠️

> Escribir esta prueba primero y confirmar que falla antes de implementar.

- [X] T014 [P] [US2] Prueba de que ambos idiomas son obligatorios al guardar un atributo traducible en `tests/traduccion-completa.test.ts` (FR-011 a FR-016)

### Datos: tablas de traducción y migración

- [X] T015 [P] [US2] Agregar el enum `locale` y las tablas `cap_model_translation`, `color_translation`, `component_translation`, `technique_translation` a `lib/db/schema.ts`; eliminar `name_es`/`name_en` (y `description_es`/`description_en` en `cap_model`) de las cuatro tablas existentes (data-model.md#bloque-2--traducciones-por-tabla-independiente, FR-011)
- [X] T016 [US2] Generar la migración con `drizzle-kit generate` en `drizzle/` y completarla a mano para que, en este orden (el driver `neon-http` no soporta transacciones, así que el orden es lo que la hace segura): cree las tablas nuevas, copie cada `name_es`/`name_en` (y `description_es`/`description_en`) existente a una fila `es` y una fila `en`, y solo entonces elimine las columnas viejas; aplicar con `npm run db:migrate` (FR-018) (depende de T015)
- [X] T017 [US2] Implementar `lib/catalogo/traduccion.ts`: valida que el nombre de un atributo traducible venga completo en `es` y en `en` antes de guardar, rechazando con `datos_invalidos` si falta alguno (FR-011 a FR-016) (depende de T014)

### Capa de lectura: mismo dato de siempre, ahora desde la tabla de traducción

- [X] T018 [P] [US2] Implementar `lib/catalogo/consultas-traducidas.ts` con cuatro consultas Drizzle (`capModelConNombre`, `colorConNombre`, `componentConNombre`, `techniqueConNombre`) que unen cada tabla con su tabla de traducción (un alias por idioma) y devuelven las mismas columnas `nameEs`/`nameEn` (y `descriptionEs`/`descriptionEn` en modelo) que existían antes de la migración, para que quien las consume no cambie (FR-019) (depende de T015)
- [X] T019 [P] [US2] Reemplazar `db.select().from(capModel)` por `capModelConNombre` en `lib/catalogo/model-manifest.ts` (también sus consultas de `component`, `color` y `technique` en el mismo archivo, por `componentConNombre`, `colorConNombre`, `techniqueConNombre`) (FR-019) (depende de T018)
- [X] T020 [P] [US2] Reemplazar `db.select().from(capModel)` por `capModelConNombre` en `app/[locale]/page.tsx` (FR-019) (depende de T018)
- [X] T021 [P] [US2] Reemplazar las consultas de `capModel`, `component`, `color` y `technique` por sus equivalentes con nombre en las páginas del panel de modelos: `app/[locale]/panel/(protected)/modelos/page.tsx`, `modelos/[id]/page.tsx`, `modelos/[id]/tallas/page.tsx`, `modelos/[id]/vistas/page.tsx`, `modelos/[id]/zonas/page.tsx`, `modelos/[id]/imagenes/page.tsx`, `modelos/[id]/componentes/page.tsx` (FR-019) (depende de T018)
- [X] T022 [P] [US2] Reemplazar `db.select().from(color)` por `colorConNombre` en `app/[locale]/panel/(protected)/colores/page.tsx` y `colores/[id]/page.tsx` (FR-019) (depende de T018)
- [X] T023 [P] [US2] Reemplazar `db.select().from(technique)` por `techniqueConNombre` en `app/[locale]/panel/(protected)/tecnicas/page.tsx` (FR-019) (depende de T018)
- [X] T024 [P] [US2] Reemplazar las consultas de `capModel`, `component` y `color` por sus equivalentes con nombre en las rutas del panel: `app/api/panel/modelos/[id]/imagenes/route.ts`, `app/api/panel/modelos/[id]/publicar/route.ts`, `app/api/panel/modelos/[id]/vistas/route.ts`, `app/api/panel/componentes/[id]/colores/route.ts` (FR-019) (depende de T018)

### Interfaz: un campo por atributo, con switch ES/EN

- [X] T025 [P] [US2] Crear el componente reutilizable `app/[locale]/panel/_components/CampoTraducible.tsx`: un único input/textarea con un switch "ES"/"EN"; mantiene `{ es, en }` en memoria y muestra el lado activo sin perder el otro al cambiar (FR-013, FR-014, FR-015)
- [X] T026 [US2] Usar `CampoTraducible` para nombre y descripción en `app/[locale]/panel/(protected)/modelos/nuevo/_NuevoModeloForm.tsx`, enviando `{ name: { es, en }, description: { es, en } }` (FR-013, FR-016) (depende de T025, T030)
- [X] T027 [US2] Usar `CampoTraducible` para el nombre en `app/[locale]/panel/(protected)/colores/[id]/_ColorForm.tsx` (alta y edición) (FR-013, FR-016) (depende de T025, T031)
- [X] T028 [US2] Usar `CampoTraducible` para el nombre en el alta de componente de `app/[locale]/panel/(protected)/modelos/[id]/componentes/_ComponentesManager.tsx` (FR-013, FR-016) (depende de T025, T032)
- [X] T029 [US2] Usar `CampoTraducible` para el nombre en `app/[locale]/panel/(protected)/tecnicas/_TecnicasForm.tsx` (FR-013, FR-016) (depende de T025, T033)

### Escritura: las rutas del panel guardan en la tabla de traducción

- [X] T030 [P] [US2] Actualizar `POST /api/panel/modelos` en `app/api/panel/modelos/route.ts` para aceptar `{ name: {es,en}, description: {es,en} }`, validar con `lib/catalogo/traduccion.ts` e insertar en `cap_model_translation` (FR-011, FR-016) (depende de T015, T016, T017)
- [X] T031 [P] [US2] Actualizar `POST /api/panel/colores` (name requerido) y `PATCH /api/panel/colores/:id` (name opcional, igual que hoy con `supplierRef`/`status`; si se envía, valida ambos idiomas) en `app/api/panel/colores/route.ts` y `app/api/panel/colores/[id]/route.ts` para `{ name: {es,en} }` sobre `color_translation` (FR-011, FR-016) (depende de T015, T016, T017)
- [X] T032 [P] [US2] Actualizar `POST /api/panel/modelos/:id/componentes` en `app/api/panel/modelos/[id]/componentes/route.ts` para `{ name: {es,en} }` sobre `component_translation` (FR-011, FR-016) (depende de T015, T016, T017)
- [X] T033 [P] [US2] Actualizar `POST /api/panel/tecnicas` en `app/api/panel/tecnicas/route.ts` para `{ name: {es,en} }` sobre `technique_translation` (FR-011, FR-016) (depende de T015, T016, T017)
- [X] T034 [P] [US2] Agregar las claves del switch "ES"/"EN" (`panel.switchIdioma.es`, `panel.switchIdioma.en`) a `messages/es.json` y `messages/en.json` (FR-014)

**Checkpoint**: la Historia 2 es funcional y comprobable de forma independiente (recorridos D–F de
quickstart.md), sin haber tocado nada de la Historia 1.

---

## Phase 5: Polish & Cross-Cutting Concerns

- [X] T035 [P] Actualizar `README.md` con el paso nuevo de migración (`npm run db:migrate` crea `customer` y las tablas de traducción); confirmar que no hace falta ninguna variable de entorno nueva
- [X] T036 Recorrer [quickstart.md](./quickstart.md) completo (A–F) y confirmar que los seis criterios de éxito (SC-001 a SC-006) pasan
- [X] T037 [P] Ejecutar `npm run typecheck` y `npm run lint` sobre todo el cambio

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup / Foundational**: no aplica (ver arriba).
- **User Story 1 (Phase 3)**: sin dependencia de otra historia; puede empezar de inmediato.
- **User Story 2 (Phase 4)**: sin dependencia de la Historia 1; puede empezar de inmediato, en
  paralelo con la Historia 1 si hay más de una persona trabajando.
- **Polish (Phase 5)**: depende de que las historias que se vayan a entregar estén completas.

### Dentro de cada historia

- **US1**: T001 (prueba) → T004 (implementación que la hace pasar). T002 → T003 (migración). T007
  necesita T002, T005, T006. T008 necesita T002, T004, T005. T010 necesita T008; T011 necesita
  T007; T012 necesita T005 y T009.
- **US2**: T014 (prueba) → T017 (implementación que la hace pasar). T015 → T016 (migración) y →
  T018 (consultas). T019–T024 necesitan T018. T025 es independiente (componente de interfaz sin
  datos). T026–T029 necesitan T025 y su ruta de escritura correspondiente (T030–T033). T030–T033
  necesitan T015 y T017.

### Oportunidades de paralelismo

- Dentro de US1: T002, T005, T006 en paralelo entre sí; T013 en cualquier momento.
- Dentro de US2: T015 primero; luego T018 (consultas) puede ir en paralelo con T017 (validación);
  T019–T024 (seis tareas, archivos disjuntos) todas en paralelo una vez lista T018; T025 en
  paralelo desde el principio; T030–T033 (cuatro archivos disjuntos) en paralelo una vez listas
  T015 y T017.
- Las historias US1 y US2 completas pueden trabajarse en paralelo por dos personas distintas: no
  comparten ni un archivo.

---

## Parallel Example: User Story 2

```bash
# Una vez lista T018 (lib/catalogo/consultas-traducidas.ts), lanzar juntas las seis tareas de lectura:
Task: "Reemplazar consultas en lib/catalogo/model-manifest.ts"
Task: "Reemplazar consultas en app/[locale]/page.tsx"
Task: "Reemplazar consultas en las páginas del panel de modelos"
Task: "Reemplazar consultas en las páginas del panel de colores"
Task: "Reemplazar consultas en app/[locale]/panel/(protected)/tecnicas/page.tsx"
Task: "Reemplazar consultas en las rutas de API del panel"
```

---

## Implementation Strategy

### MVP primero (solo User Story 1)

1. Completar Phase 3 (User Story 1).
2. **Detenerse y validar**: recorridos A–C de quickstart.md.
3. Desplegar/mostrar si está listo — el login de cliente ya es valioso por sí solo, sin esperar a
   la Historia 2.

### Entrega incremental

1. User Story 1 → validar de forma independiente → desplegar (MVP).
2. User Story 2 → validar de forma independiente → desplegar. No depende de que la Historia 1 ya
   esté en producción.
3. Polish al final, una vez estén las historias que se vayan a entregar juntas.

### Estrategia con más de una persona

Sin fase fundacional que esperar: una persona puede tomar la Historia 1 completa y otra la
Historia 2 completa desde el primer día, porque no comparten ningún archivo.
