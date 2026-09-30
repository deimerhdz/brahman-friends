# Implementation Plan: Nueva paleta de colores y rediseño de la página de inicio

**Branch**: `011-rediseno-paleta-inicio` | **Date**: 2026-09-30 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/011-rediseno-paleta-inicio/spec.md`

## Summary

Rehacer la portada pública con el diseño de `../brahman-threads` (franja de anuncios, encabezado
fijo, héroe con foto de campo, beneficios, colección, vitrina "Tu hierro. Tu gorra", pedidos por
mayor, comunidad, pie de página, botón flotante de WhatsApp y carrito lateral) y aplicar su
paleta y tipografía a todo el sitio público.

Enfoque: la paleta se define una sola vez en una clase `.tema-campo` que **redefine los tokens de
color y fuente existentes** y envuelve solo el layout del grupo `(site)`, así las páginas públicas
existentes cambian sin editarlas y el panel conserva `:root`. La portada se arma con componentes
nuevos en `app/_components/inicio/`, alimentados por los modelos publicados y los Ajustes
existentes. El carrito es un Context de React con `sessionStorage`, que envía por WhatsApp al
número derivado de Ajustes. Sin dependencias nuevas ni cambios de base de datos.

## Technical Context

**Language/Version**: TypeScript 5.7, React 19.1, Next.js 15.5 (App Router)

**Primary Dependencies**: Tailwind CSS 4.3 (tokens en `@theme`), Drizzle ORM (solo lectura con
consultas existentes), Material Symbols y Google Fonts por `<link>`. Sin dependencias nuevas.

**Storage**: PostgreSQL (Neon) solo lectura; `sessionStorage` del navegador para el carrito.

**Testing**: Vitest (entorno node) para funciones puras; recorrido manual en `quickstart.md`.

**Target Platform**: Navegadores modernos móviles y de escritorio; despliegue en Cloudflare
(OpenNext).

**Project Type**: Aplicación web Next.js única (tienda pública + panel).

**Performance Goals**: La portada sigue siendo dinámica (`force-dynamic`); las fotos se sirven con
`next/image` (`priority` solo en el héroe, `loading="lazy"` en el resto).

**Constraints**: El panel (`/panel/**`, incluido `/panel/login`) no cambia de apariencia. Textos
en es/en. Sin pago ni guardado del pedido en el sistema.

**Scale/Scope**: 1 página rediseñada, 1 layout con tema nuevo, ~10 componentes nuevos, ~120
claves de traducción por idioma, 10 fotos estáticas.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Constitution 2.1.0.

| Principio | Cómo se cumple | Estado |
|-----------|----------------|--------|
| I. Simplicidad | Sin dependencias nuevas (Material Symbols en lugar de lucide, `<link>` de fuentes existente). Tema por variables CSS en un solo lugar en vez de editar cada página. Carrito con Context + `sessionStorage`, sin librería de estado. Filtros en el cliente. | ✅ |
| II. Idioma y mercado | Todos los textos nuevos bajo `inicio.*` en es y en; la prueba de paridad existente lo verifica. El precio de productos fijos sigue saliendo con `formatUsd` (moneda explícita). | ✅ |
| III. Cero alcance fantasma | Cada componente mapea a FR de la spec. Se descartan de la referencia: subida de archivo en la vitrina, "Añadir al carrito" de personalizados, productos de ejemplo, categorías inexistentes. | ✅ |
| IV. Verificable por no técnicos | `quickstart.md` es un recorrido de 21 pasos observables en la app. | ✅ |
| V. Datos del usuario | El carrito no pide datos personales ni se envía al servidor; no hay secretos nuevos. El número de WhatsApp sale de Ajustes, no del código. | ✅ |
| Alcance v1 (carrito) | Solo productos fijos, en el navegador durante la visita, envío solo por WhatsApp, aviso de confirmación junto al botón — exactamente los límites de 2.1.0. | ✅ |

**Moneda**: el precio de productos fijos pasa a "US$ 120.00" en todo el sitio (FR-018, T036),
para cumplir "moneda clara" del Principio II. Sigue pendiente, como TODO de la constitution, que
el Principio II dice que la v1 no muestra precios aunque 009 ya los muestra.

**Re-check post-diseño**: sin cambios; data-model y contratos no añaden almacenamiento en servidor,
dependencias ni datos personales. ✅

## Project Structure

### Documentation (this feature)

```text
specs/011-rediseno-paleta-inicio/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── ui-contracts.md
├── checklists/
│   └── requirements.md
└── tasks.md              # /speckit-tasks
```

### Source Code (repository root)

```text
app/
├── layout.tsx                         # + Barlow Condensed, DM Sans, Permanent Marker en el <link>
├── globals.css                        # + tokens nuevos en @theme, bloque .tema-campo, clases de la referencia
├── [locale]/(site)/
│   ├── layout.tsx                     # envuelve en .tema-campo + CarritoProvider + EncabezadoSitio + PieSitio + BotonWhatsApp + PanelCarrito
│   └── page.tsx                       # nueva composición de secciones; carga colores con foto frontal
└── _components/
    ├── landing/                       # se borran Hero, Collection, B2BSection, ProcessSection, Footer
    │   ├── NavBar.tsx                 # se CONSERVA (lo usa /panel/login)
    │   ├── MobileNavPanel.tsx         # se CONSERVA (lo usa NavBar)
    │   └── TarjetaModeloCard.tsx      # se CONSERVA (lo usa /catalogo; adopta la paleta vía tokens)
    └── inicio/                        # nuevo
        ├── Marca.tsx                  # logotipo BRAHMAN + friends. (o logo de Ajustes)
        ├── FranjaAnuncio.tsx
        ├── EncabezadoSitio.tsx        # servidor: enlaces, idioma, cuenta
        ├── AccionesEncabezado.tsx     # cliente: lupa, WhatsApp, carrito con contador, menú móvil
        ├── Heroe.tsx
        ├── Beneficios.tsx
        ├── Coleccion.tsx              # cliente: pestañas, buscador, tarjetas, muestras de color
        ├── VitrinaPersonaliza.tsx     # cliente: estilo/color de la vista previa
        ├── PedidosMayor.tsx
        ├── Comunidad.tsx
        ├── PieSitio.tsx
        ├── BotonWhatsApp.tsx
        ├── CarritoProvider.tsx        # cliente: Context + sessionStorage
        └── PanelCarrito.tsx           # cliente: panel lateral

lib/
├── ajustes/whatsapp.ts                # numeroWhatsApp, enlaceWhatsApp (puras)
└── carrito/carrito.ts                 # reductor, totalUnidades, mensajeCarrito (puras)

messages/{es,en}.json                  # + inicio.*; − landing.* sin uso
public/inicio/*.jpg                    # 10 fotos copiadas de ../brahman-threads/src/assets

tests/
├── whatsapp.test.ts
└── carrito.test.ts
```

**Structure Decision**: Proyecto Next.js único existente. Los componentes nuevos van en
`app/_components/inicio/` (junto a `landing/`, que queda solo con lo que usa el login del panel);
la lógica pura en `lib/` con pruebas en `tests/`, siguiendo el patrón del repositorio.

## Decisiones clave (detalle en research.md)

1. Tema por clase `.tema-campo` que redefine tokens → páginas públicas cambian, panel no (#1).
2. Fuentes por el `<link>` existente; íconos Material Symbols (#2, #3).
3. Fotos de la referencia en `public/inicio/`; el banner de Ajustes reemplaza la del héroe (#4).
4. Carrito: Context en el layout `(site)` + `sessionStorage["bf-carrito-v1"]` (#5).
5. WhatsApp: número de la red social `whatsapp` o del teléfono de contacto; sin número no hay
   botones (#6).
6. Solo productos fijos al carrito; muestras de color = miniaturas de la foto frontal de cada
   color de un configurable (#7).
7. `NavBar` actual intacto para `/panel/login`; encabezado nuevo solo en `(site)` (#9).
8. Buscador vía `/{locale}?buscar=1#colecciones` (#11).

## Riesgos

- **Contraste de páginas existentes**: al cambiar `primary` de azul eléctrico a rojo, algún
  componente del configurador que use `primary` para estados de selección se verá rojo. Es el
  efecto buscado (rojo = acción), pero se revisa en el paso 14 del quickstart.
- **`bg-brand text-white` del selector de idioma**: pasa a azul marino, correcto con la paleta.
- **Fotos de terceros**: las fotos de `../brahman-threads` se asumen de uso libre para la marca
  (vienen del proyecto de diseño del mismo equipo).

## Complexity Tracking

Sin violaciones de la constitution que justificar.
