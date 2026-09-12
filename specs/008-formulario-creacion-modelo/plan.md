# Implementation Plan: Formulario de creación de modelo alineado con edición

**Branch**: `008-formulario-creacion-modelo` | **Date**: 2026-09-12 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/008-formulario-creacion-modelo/spec.md`

## Summary

El formulario de "Nuevo modelo" (`/panel/modelos/nuevo`) hoy es un formulario minimalista propio
(`_ModeloForm.tsx`) con código, nombre ES/EN y descripción ES/EN, visualmente distinto del
encabezado que se ve al editar un modelo (`EncabezadoModelo.tsx`), y sin campo de precio. El
enfoque técnico es hacer que `EncabezadoModelo` sea reutilizable en modo "creación" (código
editable, sin control de publicación) y usarlo también en la página de creación, agregando el
campo de precio a la ruta `POST /api/panel/modelos` (que hoy solo acepta código, nombre y
descripción). No se toca el configurador de vistas/colores/personalización: sigue apareciendo
únicamente después de crear el modelo, igual que hoy.

## Technical Context

**Language/Version**: TypeScript 5.7, Next.js 15 (App Router), React 19

**Primary Dependencies**: Next.js, Drizzle ORM 0.45 sobre PostgreSQL (Neon), componentes internos
del panel ya existentes (`CampoTraducible`, `EncabezadoModelo`)

**Storage**: PostgreSQL (Neon) vía Drizzle ORM — tablas `cap_model` y `cap_model_translation`; el
esquema ya tiene la columna `price`, no se requiere migración.

**Testing**: Vitest (`npm run test`) para lógica pura existente en el repo; esta funcionalidad es
principalmente de UI/formulario, así que la verificación primaria es manual en el navegador
siguiendo el Principio IV de la constitución (una persona no técnica recorre el flujo).

**Target Platform**: Aplicación web, panel administrativo interno (rutas protegidas por sesión)

**Project Type**: Aplicación web Next.js de un solo repositorio (frontend + rutas API en el mismo
proyecto)

**Performance Goals**: N/A — pantalla de formulario estándar de panel interno, sin metas de carga
especiales.

**Constraints**: Debe cumplir el Principio II (bilingüe ES/EN, sin texto fijo en código) y el
Principio III (cero alcance fantasma: solo los campos que pide la spec).

**Scale/Scope**: Una página de panel (`modelos/nuevo`), un componente compartido de encabezado y
un endpoint API existente que se extiende con un campo opcional.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Simplicidad ante todo**: PASA. Se reutiliza `EncabezadoModelo` (agregándole props opcionales
  para el modo creación) en lugar de duplicar su marcado en un segundo componente; no se agregan
  librerías ni capas nuevas.
- **II. Idioma y mercado**: PASA. Los campos de nombre/descripción siguen usando `CampoTraducible`
  con ES/EN; ningún texto nuevo se escribe fijo en el código, sale de `messages/es.json` /
  `messages/en.json`.
- **III. Cero alcance fantasma**: PASA. El alcance queda explícitamente acotado por la spec a los
  campos de encabezado (código, nombre, descripción, precio); MOQ y publicación quedan fuera a
  propósito (FR-004) y el stepper de vistas/colores/personalización no cambia (FR-008).
- **IV. Verificable por una persona no técnica**: PASA. Los criterios de éxito (SC-001 a SC-004) se
  comprueban abriendo la pantalla y comparándola visualmente con la de edición, sin leer código.
- **V. Datos del usuario con respeto**: PASA. No se agrega ningún dato personal nuevo; el precio ya
  es un dato de catálogo existente que hoy se edita después de crear el modelo.

No hay violaciones que justificar; la sección "Complexity Tracking" no aplica.

## Project Structure

### Documentation (this feature)

```text
specs/008-formulario-creacion-modelo/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
│   └── post-modelos.md
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
app/[locale]/panel/(protected)/modelos/
├── _ModeloForm.tsx                      # Se reemplaza: deja de ser un formulario propio y pasa
│                                         # a montar EncabezadoModelo en modo creación + botón guardar
├── nuevo/page.tsx                       # Página que usa el formulario de creación (sin cambios
│                                         # de ruta; cambia qué renderiza)
└── [id]/
    ├── page.tsx                         # Sin cambios: sigue armando el configurador de edición
    └── _components/
        ├── EncabezadoModelo.tsx         # Se extiende con props para el modo creación (código
        │                                # editable, ocultar EstadoPublicacion)
        └── ModeloConfigurador.tsx       # Sin cambios

app/api/panel/modelos/
└── route.ts                             # POST: se agrega manejo opcional de `price`, igual que ya
                                          # existe en PATCH `[id]/route.ts`

messages/es.json, messages/en.json       # Traducciones ya existentes de precio/nombre/descripción
                                          # se reutilizan (labels.price ya se usa en la edición)
```

**Structure Decision**: Aplicación web Next.js de un solo proyecto (no hay separación
frontend/backend independiente: las rutas API viven en `app/api` dentro del mismo repo). Se
reutiliza el árbol de páginas y componentes ya existente bajo `app/[locale]/panel/(protected)/modelos/`;
no se crean carpetas nuevas.

## Complexity Tracking

*No aplica: el Constitution Check no tiene violaciones que justificar.*
