---

description: "Task list template for feature implementation"
---

# Tasks: Migración de subida de archivos a Cloudflare R2

**Input**: Design documents from `/specs/005-migrar-subida-archivos-r2/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: No se solicitaron tareas de test automatizado en la spec; la validación de cada historia
es manual, guiada por `quickstart.md` (Principio IV: verificable por una persona no técnica).

**Organization**: Las tareas están agrupadas por historia de usuario (spec.md) para poder
implementar y validar cada una de forma independiente.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Puede ejecutarse en paralelo (archivos distintos, sin dependencias pendientes)
- **[Story]**: Historia de usuario a la que pertenece (US1, US2, US3)
- Cada tarea incluye la ruta exacta del archivo a crear/editar

## Path Conventions

Proyecto Next.js de un solo módulo (App Router); las rutas de API y la UI conviven bajo `app/`, y
la lógica compartida vive bajo `lib/`. Ver "Project Structure" en [plan.md](./plan.md).

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Preparar dependencias y configuración base antes de tocar la lógica de subida.

- [X] T001 [P] Agregar `@aws-sdk/client-s3` y `@aws-sdk/s3-request-presigner` como dependencias en `package.json` (`npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner`)
- [X] T002 [P] Actualizar `.env.example`: reemplazar `BLOB_READ_WRITE_TOKEN` por `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME` y `R2_PUBLIC_BASE_URL`, con un comentario explicando cada una
- [X] T003 [P] Agregar el hostname público de R2 (`R2_PUBLIC_BASE_URL`) a `images.remotePatterns` en `next.config.ts`, sin retirar el hostname de Vercel Blob ya presente (FR-011)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Capa de almacenamiento y de URLs prefirmadas que usan todas las historias.

**⚠️ CRITICAL**: Ninguna historia de usuario puede empezar hasta completar esta fase.

- [X] T004 Agregar a `lib/config/env.ts` los getters `r2AccountId`, `r2AccessKeyId`, `r2SecretAccessKey`, `r2Bucket` y `r2PublicBaseUrl` (patrón `required(...)` ya existente); eliminar el getter `blobReadWriteToken` (depende de T001, T002)
- [X] T005 Crear `lib/media/r2-client.ts` que exporte un `S3Client` configurado contra el endpoint de R2 (`https://{r2AccountId}.r2.cloudflarestorage.com`) usando las credenciales de `lib/config/env.ts` (depende de T004)
- [X] T006 Reescribir `lib/media/storage.ts`: reemplazar `put`/`del` de `@vercel/blob` por `PutObjectCommand`/`DeleteObjectCommand` contra el cliente de `lib/media/r2-client.ts`, conservando exactamente las firmas actuales de `uploadPublicFile` y `deletePublicFile` (depende de T005) — este cambio migra de forma transparente el flujo de logotipo (`/api/logos`, `/api/panel/solicitudes/[id]/anonimizar`, `/api/cron/retencion`)
- [X] T007 [P] Crear `lib/media/presign.ts` con una función que reciba `(pathname, contentType)` y devuelva `{ uploadUrl, publicUrl, expiresInSeconds }`, usando `@aws-sdk/s3-request-presigner` contra el cliente de `lib/media/r2-client.ts` (depende de T005)
- [X] T008 [P] Crear `app/api/panel/subidas/presignar/route.ts`: ruta autenticada (`getSession()`, `401` si no hay sesión) que valida `contentType` contra `["image/png","image/jpeg","image/svg+xml","image/webp"]` y devuelve el resultado de `lib/media/presign.ts`, según [contracts/subidas-presignadas.md](./contracts/subidas-presignadas.md) (depende de T007)
- [X] T009 [P] Crear `app/api/subidas/presignar/route.ts`: ruta pública/anónima que valida `contentType === "image/png"` y un tamaño máximo de 10 MB, y devuelve el resultado de `lib/media/presign.ts`, según [contracts/subidas-presignadas.md](./contracts/subidas-presignadas.md) (depende de T007)

**Checkpoint**: Fundación lista — almacenamiento y URLs prefirmadas operativos contra R2; las
historias de usuario pueden empezar.

---

## Phase 3: User Story 1 - Subir la imagen de un color con confirmación explícita (Priority: P1) 🎯 MVP

**Goal**: precarga local → botón "Subir" → alerta de éxito/error, con la URL resultante asociada al
color solo tras confirmar éxito (FR-002 a FR-006).

**Independent Test**: quickstart.md → "Escenario 1".

### Implementation for User Story 1

- [X] T010 [US1] Crear el componente reutilizable `SubidaArchivo` en `app/[locale]/panel/_components/SubidaArchivo.tsx`, implementando los estados y props de [contracts/componente-subida.md](./contracts/componente-subida.md) (`idle → seleccionado → subiendo → éxito/error`, vista previa local con `URL.createObjectURL`, botón deshabilitado durante la subida, `onUploaded` solo tras éxito)
- [X] T011 [US1] Reescribir `app/[locale]/panel/(protected)/colores/[id]/_ColorForm.tsx` para usar `SubidaArchivo` (`presignEndpoint: "/api/panel/subidas/presignar"`, `pathPrefix: "colores"`) en vez de la llamada directa a `upload()` de `@vercel/blob/client`; el botón de guardar debe seguir deshabilitado mientras no exista una subida exitosa (FR-006, comportamiento ya existente) (depende de T010, T008)
- [ ] T012 [US1] Validación manual: recorrer quickstart.md → "Escenario 1" completo (subida exitosa y subida fallida) contra un bucket R2 real

**Checkpoint**: Colores migrados a R2 con el componente reutilizable funcionando de punta a punta.

---

## Phase 4: User Story 2 - Subir la imagen de una vista de modelo con el mismo componente (Priority: P2)

**Goal**: mismo componente reutilizable de US1, aplicado a las vistas de un modelo, probando que es
realmente reutilizable entre pantallas (FR-002).

**Independent Test**: quickstart.md → "Escenario 2".

### Implementation for User Story 2

- [X] T013 [US2] Reescribir `app/[locale]/panel/(protected)/modelos/[id]/vistas/_VistasForm.tsx` para usar `SubidaArchivo` (`presignEndpoint: "/api/panel/subidas/presignar"`, `pathPrefix: "modelos/${modelId}"`) en vez de la llamada directa a `upload()` de `@vercel/blob/client`, conservando el comportamiento actual de persistir la vista inmediatamente tras una subida exitosa (`POST /api/panel/modelos/[id]/vistas`) (depende de T010, T008)
- [ ] T014 [US2] Validación manual: recorrer quickstart.md → "Escenario 2" completo (subida y reemplazo de imagen de una vista)

**Checkpoint**: Colores y vistas de modelo migrados; el componente reutilizable queda probado en dos
pantallas distintas.

---

## Phase 5: User Story 3 - Continuidad de las subidas automáticas y masivas sobre el nuevo almacenamiento (Priority: P3)

**Goal**: carga masiva y vistas compuestas de solicitud siguen funcionando igual, pero escribiendo
en R2 (FR-001, FR-012).

**Independent Test**: quickstart.md → "Escenario 3" y "Escenario 4".

### Implementation for User Story 3

- [X] T015 [P] [US3] Actualizar `app/[locale]/panel/(protected)/modelos/[id]/imagenes/_CargaMasiva.tsx` para pedir la URL prefirmada a `/api/panel/subidas/presignar` y subir cada archivo con `fetch(uploadUrl, { method: "PUT", ... })` en vez de `upload()` de `@vercel/blob/client`, sin cambiar su flujo de lote/matriz (FR-012) (depende de T008)
- [X] T016 [P] [US3] Actualizar `app/[locale]/(site)/solicitud/_lib/subir-vistas.ts` para pedir la URL prefirmada a `/api/subidas/presignar` y subir cada vista compuesta con `fetch(uploadUrl, { method: "PUT", ... })` en vez de `upload()` de `@vercel/blob/client` (depende de T009)
- [ ] T017 [US3] Validación manual: recorrer quickstart.md → "Escenario 3" (carga masiva), "Escenario 4" (solicitud de cotización) y "Escenario 5" (logotipo, ya cubierto por T006 — solo confirmar)

**Checkpoint**: Todos los flujos de subida (color, vista de modelo, carga masiva, solicitud,
logotipo) escriben en R2.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: retirar el código y la dependencia que quedan sin uso, y entregar la guía de
configuración pedida en la spec (FR-010).

- [X] T018 [P] Eliminar `app/api/panel/subidas/autorizar/route.ts` (reemplazada por `app/api/panel/subidas/presignar/route.ts`; su último consumidor era `_CargaMasiva.tsx`, migrado en T015)
- [X] T019 [P] Eliminar `app/api/subidas/autorizar/route.ts` (reemplazada por `app/api/subidas/presignar/route.ts`; su último consumidor era `subir-vistas.ts`, migrado en T016)
- [X] T020 Quitar `@vercel/blob` de las dependencias en `package.json` (`npm uninstall @vercel/blob`) una vez que ningún archivo lo importe (depende de T011, T013, T015, T016, T018, T019)
- [X] T021 [P] Verificar con `grep -r "@vercel/blob" app lib` que no queda ninguna importación (depende de T020)
- [X] T022 [P] Escribir la guía de configuración de Cloudflare en `specs/005-migrar-subida-archivos-r2/guia-configuracion-cloudflare.md`: creación del bucket, acceso público/dominio (`R2_PUBLIC_BASE_URL`), configuración de CORS para permitir `PUT` desde el dominio de la app, creación del token de API (Access Key/Secret Key) y mapeo de cada variable de `.env.example` a su valor en el panel de Cloudflare (FR-010)
- [ ] T023 Validación manual: recorrer quickstart.md → "Verificación de no regresión sobre el histórico" (una imagen creada antes de la migración se sigue viendo, servida desde Vercel Blob) (FR-011)
- [X] T024 Ejecutar `npm run typecheck`, `npm run lint` y `npm test`, y corregir cualquier fallo antes de dar la migración por terminada

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sin dependencias — puede iniciar de inmediato
- **Foundational (Phase 2)**: depende de Setup — BLOQUEA todas las historias de usuario
- **User Stories (Phase 3-5)**: dependen de Foundational; US1 y US3 pueden avanzar en paralelo entre
  sí, pero US2 depende del componente creado en US1 (T010)
- **Polish (Phase 6)**: depende de que las tres historias estén completas

### User Story Dependencies

- **US1 (P1)**: depende solo de Foundational; crea el componente reutilizable (T010) que US2 reutiliza
- **US2 (P2)**: depende de Foundational y de T010 (componente creado en US1); no depende de ninguna
  otra tarea de US1
- **US3 (P3)**: depende solo de Foundational; no depende de US1 ni de US2 (usa el mismo endpoint de
  presigner pero no el componente `SubidaArchivo`)

### Parallel Opportunities

- T001, T002, T003 (Setup) en paralelo
- T007, T008, T009 (Foundational, tras T005/T006) en paralelo entre sí
- T015 y T016 (US3) en paralelo entre sí
- T018, T019, T021, T022 (Polish) en paralelo entre sí
- Con más de una persona: tras el Checkpoint de Foundational, US3 puede avanzar en paralelo con
  US1 → US2 (US2 solo necesita esperar a que exista T010, no a que termine todo US1)

---

## Parallel Example: Foundational

```bash
# Tras completar T005 y T006:
Task: "Crear lib/media/presign.ts con la función de URL prefirmada"
Task: "Crear app/api/panel/subidas/presignar/route.ts"
Task: "Crear app/api/subidas/presignar/route.ts"
```

## Parallel Example: User Story 3

```bash
Task: "Actualizar _CargaMasiva.tsx para usar /api/panel/subidas/presignar"
Task: "Actualizar subir-vistas.ts para usar /api/subidas/presignar"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Completar Phase 1: Setup
2. Completar Phase 2: Foundational (bloqueante)
3. Completar Phase 3: User Story 1 (componente reutilizable + colores en R2)
4. **DETENERSE y VALIDAR**: recorrer quickstart.md → Escenario 1
5. Con esto ya hay una migración funcional y de valor: colores subiendo a R2 con el nuevo patrón de
   precarga/confirmación/alerta

### Incremental Delivery

1. Setup + Foundational → almacenamiento y presigner en R2 listos (incluye logotipo, transparente)
2. + US1 → colores migrados, componente reutilizable probado (MVP)
3. + US2 → vistas de modelo migradas, reutilización del componente confirmada
4. + US3 → carga masiva y solicitudes migradas, migración funcionalmente completa
5. Polish → se retira el código y la dependencia de Vercel Blob que ya no se usan, y se entrega la
   guía de Cloudflare

---

## Notes

- [P] = archivos distintos, sin dependencias pendientes entre sí
- [US1]/[US2]/[US3] mapean cada tarea a su historia de usuario en spec.md
- No hay tareas de test automatizado porque la spec no las pidió; la validación es manual vía
  quickstart.md, acorde al Principio IV de la constitution
- Los archivos históricos en Vercel Blob no se tocan (FR-011); por eso `next.config.ts` conserva
  ambos hostnames y la limpieza de la dependencia (T020) espera a que ningún flujo la use más
- Confirmar cada checkpoint de historia antes de avanzar a la siguiente
