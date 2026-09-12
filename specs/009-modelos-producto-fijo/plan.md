# Implementation Plan: Modelos de producto fijo junto a modelos configurables

**Branch**: `009-modelos-producto-fijo` | **Date**: 2026-09-12 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/009-modelos-producto-fijo/spec.md`

## Summary

Hoy todo modelo de gorra pasa por el mismo camino: se cotiza, así que el precio queda opcional y el
modelo siempre configura colores y zona de personalización. Esta funcionalidad agrega un segundo
tipo de modelo, "Producto fijo" (una gorra ya definida, no personalizable), elegido una sola vez al
crearlo: para ese tipo el precio es obligatorio, no aplican los pasos de colores/personalización, y
el modelo — una vez publicado — aparece en el catálogo público con su precio, donde un cliente lo
pide directamente (cantidad + contacto) sin pasar por el configurador ni por una cotización. El
enfoque técnico es agregar una columna `type` a `cap_model` (con default que preserva el
comportamiento actual para todo lo existente), ramificar la validación de publicación y las
pantallas del panel según ese tipo, y sumar una página pública mínima de producto fijo que reutiliza
el mismo mecanismo de solicitud/seguimiento ya existente, en vez de duplicar el flujo del
configurador.

## Technical Context

**Language/Version**: TypeScript 5.7, Next.js 15 (App Router), React 19

**Primary Dependencies**: Next.js, Drizzle ORM 0.45 sobre PostgreSQL (Neon); componentes internos
ya existentes del panel (`EncabezadoModelo`, `ModeloConfigurador`, `PasoVistas`) y del sitio público
(`FormularioContacto`, `Collection`)

**Storage**: PostgreSQL (Neon) vía Drizzle ORM — se agrega un enum `model_type` y una columna
`cap_model.type` (migración nueva); `request.design_snapshot` (jsonb, sin cambio de esquema) pasa a
aceptar una segunda forma de contenido, discriminada por `kind`

**Testing**: Vitest (`npm run test`) para la lógica pura nueva (`checkPublicacionProductoFijo`,
`buildFixedProductSnapshot`, siguiendo el patrón de `tests/design-rules.test.ts`); verificación
primaria manual en el navegador (Principio IV), ver `quickstart.md`

**Target Platform**: Aplicación web — panel administrativo (rutas protegidas) y sitio público

**Project Type**: Aplicación web Next.js de un solo repositorio (frontend + rutas API en el mismo
proyecto)

**Performance Goals**: N/A — pantallas de panel y catálogo estándar, sin metas de carga especiales
distintas de las que ya cumple el resto del sitio

**Constraints**: Principio II (bilingüe ES/EN sin texto fijo en código; el precio, en cuanto se
muestra a un cliente, debe llevar su moneda clara — ver research.md #6); Principio III (cero
alcance fantasma: no se toca nada del catálogo/pedido que la spec no pida); "cada solicitud enviada
debe quedar congelada" (Alcance del Producto v1) también aplica al pedido de un producto fijo

**Scale/Scope**: Una columna nueva, dos funciones puras nuevas, cambios en 3 rutas API existentes,
una pantalla pública nueva y chica, cambios de visibilidad condicional en 2 pantallas de panel
existentes, y una rama nueva en las vistas del panel que leen `request.designSnapshot`

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Simplicidad ante todo**: PASA. No se agrega ninguna librería ni tabla nueva; se reutiliza
  `PasoVistas`, `FormularioContacto`, el mismo endpoint `/api/solicitudes` y el mismo mecanismo de
  seguimiento de pedidos. Las dos funciones de validación de publicación se mantienen separadas por
  tipo en vez de una sola función con ramas, porque casi no comparten lógica (research.md #3).
- **II. Idioma y mercado**: PASA, con una decisión explícita: esta es la primera funcionalidad que
  muestra un precio a un cliente. La regla de moneda de la constitution ("el precio DEBE llevar su
  moneda clara") se cumple mostrando el precio como USD — la moneda en la que ya está documentado
  que se guarda `cap_model.price` — en ambos idiomas (research.md #6). No se agrega conversión a
  COP: ninguna FR de la spec la pide, y agregarla sin que el negocio la haya pedido sería alcance
  fantasma (Principio III).
- **III. Cero alcance fantasma**: PASA. Cada cambio traza a una FR (ver tabla de research.md). La
  sección "Alcance del Producto (v1)" de la constitution ya prevé este caso: excluye cálculo de
  precio y cotización *"hasta que exista una spec aprobada que lo incluya"* — spec 009 es esa spec
  para el caso específico de "Producto fijo"; el camino de modelos configurables (cotización, sin
  precio obligatorio) queda exactamente como estaba (User Story 3). **Nota de gobernanza**: una vez
  entregada esta funcionalidad, conviene correr `/speckit-constitution` para actualizar "Alcance del
  Producto (v1)", que hoy dice literalmente "la versión 1 no muestra precios" — eso deja de ser
  cierto para los productos fijos. No es un bloqueo para este plan (la propia constitution habilita
  la excepción vía spec aprobada), pero sí una actualización de redacción pendiente.
- **IV. Verificable por una persona no técnica**: PASA. Los 8 escenarios de `quickstart.md` se
  recorren en la app (panel y sitio) sin leer código ni base de datos.
- **V. Datos del usuario con respeto**: PASA. El pedido de un producto fijo pide los mismos datos
  de contacto (nombre, correo, teléfono) y la misma aceptación de política de privacidad que ya se
  piden hoy para un pedido de modelo configurable — ningún dato personal nuevo.

No hay violaciones que requieran registrarse en "Complexity Tracking" más allá de la nota de
gobernanza ya señalada arriba.

## Project Structure

### Documentation (this feature)

```text
specs/009-modelos-producto-fijo/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
│   ├── post-modelos.md
│   ├── patch-modelo.md
│   ├── post-modelos-publicar.md
│   └── post-solicitudes.md
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
lib/db/schema.ts                                # + enum model_type, + cap_model.type
drizzle/00XX_*.sql                              # Migración: ALTER TABLE cap_model ADD COLUMN type

lib/catalogo/publicacion.ts                     # + checkPublicacionProductoFijo(...)
lib/solicitud/snapshot.ts                       # + buildFixedProductSnapshot(...)
lib/catalogo/consultas-traducidas.ts            # capModelConNombre / capModelConNombreYPortada:
                                                 # + columnas type y price en el select

app/api/panel/modelos/
├── route.ts                                    # POST: + validación de type/price (contracts/post-modelos.md)
└── [id]/
    ├── route.ts                                # PATCH: + regla de price obligatorio si fixed_product
    └── publicar/route.ts                       # POST: rama por type (contracts/post-modelos-publicar.md)

app/[locale]/panel/(protected)/modelos/
├── page.tsx                                    # Listado: + columna/badge de tipo (US4)
├── _ModeloForm.tsx                              # Creación: + selector de tipo, price requerido si fixed_product
└── [id]/
    ├── page.tsx                                # Carga type y lo pasa al configurador
    └── _components/
        ├── EncabezadoModelo.tsx                # Muestra el tipo (solo lectura, no editable — FR-010)
        └── ModeloConfigurador.tsx              # Oculta pestañas Colores/Personalización si fixed_product

app/[locale]/panel/(protected)/solicitudes/
└── [id]/page.tsx                                # + rama de render cuando designSnapshot.kind === "fixed_product"
app/api/panel/solicitudes/[id]/ficha.pdf/route.ts # + misma rama para la ficha PDF
app/api/panel/solicitudes.csv/route.ts            # + columnas/valores razonables para pedidos de producto fijo

app/[locale]/(site)/
├── page.tsx                                    # Catálogo: + type/price en TarjetaModelo, href condicional
└── producto/[modelId]/page.tsx                 # NUEVO: página pública de producto fijo (fotos, descripción,
                                                 # precio) + formulario de pedido chico

app/_components/landing/Collection.tsx          # + precio visible en la tarjeta cuando type = fixed_product

app/api/solicitudes/route.ts                    # POST: + rama fixed_product (contracts/post-solicitudes.md)

messages/es.json, messages/en.json              # + labels de tipo de modelo, precio con moneda,
                                                 # formulario de pedido de producto fijo

tests/                                          # + tests unitarios de checkPublicacionProductoFijo
                                                 # y buildFixedProductSnapshot
```

**Structure Decision**: Aplicación web Next.js de un solo proyecto (frontend + rutas API en el
mismo repo, sin separación backend/frontend). Se extiende el árbol de archivos ya existente bajo
`app/[locale]/panel/(protected)/modelos/`, `app/api/panel/modelos/`, `app/[locale]/(site)/` y
`app/api/solicitudes/`; la única carpeta nueva es `app/[locale]/(site)/producto/[modelId]/`, que
sigue el mismo patrón de ruta dinámica que ya usa `app/[locale]/(site)/configurador/[modelId]/`.

## Complexity Tracking

*No aplica: el Constitution Check no tiene violaciones que justificar aquí — solo la nota de
gobernanza (actualizar el texto de "Alcance del Producto (v1)" con `/speckit-constitution` después
de entregar esta funcionalidad), que no es una violación sino una actualización de redacción
pendiente.*
