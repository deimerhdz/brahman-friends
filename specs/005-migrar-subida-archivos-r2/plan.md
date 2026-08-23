# Implementation Plan: Migración de subida de archivos a Cloudflare R2

**Branch**: `005-migrar-subida-archivos-r2` | **Date**: 2026-08-22 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/005-migrar-subida-archivos-r2/spec.md`

## Summary

Reemplazar Vercel Blob por Cloudflare R2 como almacenamiento de archivos para todos los flujos de
subida (colores, vistas de modelo, carga masiva, vistas compuestas de solicitud y logotipo del
cliente), sin migrar el histórico ya subido (FR-011). Se introduce un componente React reutilizable
de un solo archivo con estados `idle → seleccionado (vista previa) → subiendo → éxito/error`, usado
por los formularios de color y de vista de modelo (FR-002/FR-003/FR-004). La carga masiva conserva
su flujo de lote/matriz actual y solo cambia de destino de almacenamiento (FR-012). El acceso a los
archivos sigue siendo público con URLs permanentes (FR-013), por lo que no se requiere ningún cambio
de esquema en base de datos: las columnas de URL ya son texto plano. El trabajo entrega además una
guía de configuración del panel de Cloudflare (FR-010).

## Technical Context

**Language/Version**: TypeScript 5.7 sobre Next.js 15 (App Router), React 19

**Primary Dependencies**: Next.js 15, Drizzle ORM 0.45 + `@neondatabase/serverless` (Postgres),
`@aws-sdk/client-s3` y `@aws-sdk/s3-request-presigner` (nuevas, ver justificación abajo). Se retira
`@vercel/blob`.

**Storage**: Cloudflare R2 (compatible S3) para archivos nuevos; PostgreSQL (Neon) sin cambios para
metadatos/URLs. Los archivos ya existentes permanecen en Vercel Blob (FR-011).

**Testing**: Vitest (`npm test`), pruebas unitarias existentes en `tests/*.test.ts`

**Target Platform**: Despliegue en Vercel (funciones serverless Node.js, ver `vercel.json`), web

**Project Type**: Aplicación web (Next.js full-stack: rutas de API + UI en el mismo proyecto)

**Performance Goals**: Sin regresión respecto al comportamiento actual; la carga masiva de hasta
~540 imágenes debe seguir subiendo directo desde el navegador al almacenamiento (sin pasar por el
servidor), igual que hoy con Vercel Blob.

**Constraints**: Las funciones serverless de Vercel tienen un límite de tamaño de cuerpo de
solicitud (~4.5 MB); cualquier flujo que pueda superarlo (carga masiva, vistas compuestas del
configurador) DEBE seguir subiendo directo al almacenamiento vía URL prefirmada, no a través del
servidor.

**Scale/Scope**: 4 flujos de subida manual/automática (color, vista de modelo, carga masiva,
vista de solicitud) + 1 flujo servidor-proxy ya existente (logotipo del cliente) que comparte la
capa de almacenamiento (`lib/media/storage.ts`) y se migra de forma transparente al cambiar su
implementación interna.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Simplicidad ante todo**: PASA, con una dependencia nueva justificada por escrito (ver
  "Nuevas dependencias" abajo). No se introduce ninguna capa de abstracción adicional a la ya
  existente (`lib/media/storage.ts`); se reutiliza y se le cambia la implementación interna. El
  componente reutilizable de subida es la solución más simple para cumplir FR-002/FR-003/FR-004 sin
  duplicar lógica de estados en cada formulario.
- **II. Idioma y mercado**: PASA. Los textos de la alerta de éxito/error y las etiquetas del
  componente reutilizable salen del sistema de traducción existente (`labels` por props, como ya
  hacen `ColorForm` y `VistasForm`); no se agrega texto fijo en el código.
- **III. Cero alcance fantasma**: PASA. El alcance queda acotado por la spec: sin migración de
  histórico (FR-011), sin rediseño de la carga masiva (FR-012), sin URLs firmadas (FR-013). El
  ajuste a `lib/media/storage.ts` que también cubre el logotipo del cliente no agrega
  comportamiento nuevo: es la misma función compartida que ya usa `/api/logos`, solo con otro
  proveedor detrás.
- **IV. Verificable por una persona no técnica**: PASA. `quickstart.md` documenta pasos observables
  en la app (subir una imagen, ver la alerta, ver la imagen en el sitio) para validar cada historia
  de usuario sin leer código.
- **V. Datos del usuario con respeto**: PASA. Las credenciales de R2 (Account ID, Access Key,
  Secret Key, nombre del bucket) se leen de variables de entorno nuevas, nunca del repositorio,
  siguiendo el mismo patrón que `lib/config/env.ts` ya usa para `BLOB_READ_WRITE_TOKEN`.

### Nuevas dependencias (Principio I)

| Dependencia | Justificación |
|---|---|
| `@aws-sdk/client-s3` | Cloudflare R2 expone una API compatible con S3; este es el cliente oficial recomendado por Cloudflare para integrarlo desde Node.js/Next.js. Sin él habría que construir a mano las peticiones HTTP firmadas contra la API S3. |
| `@aws-sdk/s3-request-presigner` | Genera las URLs prefirmadas (`presigned PUT`) que permiten al navegador subir directo a R2, igual que hoy hace `@vercel/blob/client`. Reimplementar la firma AWS SigV4 a mano es un algoritmo criptográfico delicado que no conviene reinventar (regla explícita del Principio I: no se anticipa complejidad, y tampoco se reinventa lo que ya resuelve una librería estándar del ecosistema). |

`@vercel/blob` se retira del `package.json` una vez completada la migración de código, porque deja
de usarse para escribir archivos nuevos; los archivos históricos que quedan en Vercel Blob se sirven
como URLs HTTPS planas y no requieren ningún SDK para leerse.

## Project Structure

### Documentation (this feature)

```text
specs/005-migrar-subida-archivos-r2/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/
│   ├── subidas-presignadas.md   # Contrato de las rutas de API que reemplazan a *_/subidas/autorizar
│   └── componente-subida.md     # Contrato del componente reutilizable de subida
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

Proyecto Next.js de un solo módulo (App Router); no hay separación backend/frontend en carpetas
distintas, las rutas de API viven junto a la UI bajo `app/`.

```text
lib/
├── config/
│   └── env.ts                     # + getters r2AccountId, r2AccessKeyId, r2SecretAccessKey,
│                                   #   r2Bucket, r2PublicBaseUrl; retira blobReadWriteToken
├── media/
│   ├── storage.ts                 # uploadPublicFile/deletePublicFile: cambia @vercel/blob por
│   │                               #   @aws-sdk/client-s3 (PutObjectCommand/DeleteObjectCommand)
│   └── presign.ts                 # NUEVO: genera URLs prefirmadas (PUT) contra R2
└── ...

components/ (o app/[locale]/panel/_components/, según convención existente)
└── SubidaArchivo.tsx              # NUEVO: componente reutilizable (idle/selected/uploading/
                                    #   success/error), usado por ColorForm y VistasForm

app/api/
├── subidas/
│   └── presignar/route.ts         # NUEVO, reemplaza subidas/autorizar (flujo público/anónimo)
└── panel/
    └── subidas/
        └── presignar/route.ts     # NUEVO, reemplaza panel/subidas/autorizar (flujo admin)

app/[locale]/panel/(protected)/colores/[id]/_ColorForm.tsx        # usa SubidaArchivo
app/[locale]/panel/(protected)/modelos/[id]/vistas/_VistasForm.tsx # usa SubidaArchivo
app/[locale]/panel/(protected)/modelos/[id]/imagenes/_CargaMasiva.tsx # solo cambia el endpoint de subida
app/[locale]/(site)/solicitud/_lib/subir-vistas.ts                 # solo cambia el endpoint de subida
app/[locale]/(site)/configurador/[modelId]/_components/SubirLogo.tsx # sin cambios (sigue subiendo
                                                                       # vía /api/logos, que usa
                                                                       # lib/media/storage.ts)

next.config.ts                     # agrega el hostname público de R2 a images.remotePatterns,
                                    #   conservando el de Vercel Blob (FR-011)
```

**Structure Decision**: Se mantiene la estructura actual del proyecto (Next.js App Router de un solo
módulo). No se crean carpetas nuevas de alto nivel; los archivos nuevos se ubican junto a sus pares
existentes (`lib/media/`, `app/api/subidas/`, `app/api/panel/subidas/`) y el componente reutilizable
se agrega junto a los componentes compartidos del panel administrativo.

## Complexity Tracking

*Sin violaciones de la constitution que requieran justificación adicional a la ya documentada en
"Nuevas dependencias" arriba.*

## Re-chequeo de Constitution Check (post Fase 1)

Tras diseñar `data-model.md` y los contratos, se confirma que ningún principio se ve comprometido:
no se agregó ninguna tabla ni dependencia adicional a las ya justificadas, el componente reutilizable
sigue recibiendo sus textos por props (`labels`), y las rutas nuevas (`*/subidas/presignar`)
reproducen exactamente las mismas reglas de autenticación y de tipo/tamaño permitido que las rutas
que reemplazan. Gate: **PASA**.
