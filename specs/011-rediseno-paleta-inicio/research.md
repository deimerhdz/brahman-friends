# Research: Nueva paleta y rediseño de la página de inicio

Fuente visual: `../brahman-threads/src/routes/index.tsx` y `../brahman-threads/src/styles.css`.

## 1. Cómo aplicar la paleta al sitio público sin tocar el panel

- **Decision**: Definir la paleta de la referencia como variables CSS dentro de una clase
  `.tema-campo` en `app/globals.css`. Esa clase **redefine los tokens existentes** (`--color-surface`,
  `--color-on-surface`, `--color-primary`, `--color-brand`, etc.) y **añade los nuevos** (`deep`,
  `action`, `gold`, `sand`, `preview`, `whatsapp`, fuentes). Solo `app/[locale]/(site)/layout.tsx`
  envuelve su contenido con `<div className="tema-campo">`.
- **Rationale**: Tailwind v4 genera las utilidades (`bg-surface`, `text-primary`…) como
  `var(--color-…)`, así que redefinir la variable en un ancestro cambia el color de todas las
  páginas públicas existentes (catálogo, producto, configurador, cuenta, solicitud) sin editar
  cada archivo. El panel (`app/[locale]/panel/**`) usa los mismos tokens (144 usos de
  `text-on-surface`), pero no está dentro de `.tema-campo`, así que conserva los valores de `:root`
  (FR-003, SC-006).
- **Alternatives considered**:
  - Cambiar los valores en `@theme` → cambia también el panel. Rechazada.
  - Editar clase por clase las páginas públicas → mucho más código y fácil de dejar huecos.
    Rechazada (Principio I).
  - Copiar el `styles.css` de la referencia (tokens shadcn: `--background`, `--primary`…) → trae
    decenas de tokens (sidebar, chart, popover) que no se usan. Rechazada.

**Mapeo de tokens dentro de `.tema-campo`** (valores oklch copiados de la referencia):

| Token del proyecto | Rol en la referencia | Valor |
|--------------------|----------------------|-------|
| `surface`, `background`, `surface-bright` | background (crema) | `oklch(0.978 0.006 85)` |
| `surface-container-lowest` | card | `oklch(0.993 0.003 85)` |
| `surface-container`, `surface-container-low`, `surface-variant` | surface (arena) | `oklch(0.95 0.012 78)` |
| `on-surface`, `on-background`, `brand` | foreground (azul marino) | `oklch(0.22 0.036 252)` |
| `on-surface-variant`, `on-secondary-container` | muted-foreground | `oklch(0.47 0.017 252)` |
| `outline-variant`, `outline` | border | `oklch(0.87 0.012 80)` |
| `primary`, `brand-accent` | action (rojo) | `oklch(0.55 0.22 27)` |
| `on-primary`, `on-secondary` | action-foreground | `oklch(1 0 0)` |
| nuevo `deep` | deep (franjas, pie) | `oklch(0.19 0.035 254)` |
| nuevo `on-deep` | primary-foreground (crema claro) | `oklch(0.985 0.004 85)` |
| nuevo `gold` | gold | `oklch(0.77 0.11 76)` |
| nuevo `preview` | preview | `oklch(0.88 0.02 75)` |
| nuevo `whatsapp` | whatsapp | `oklch(0.66 0.19 150)` |

Los nuevos tokens se registran en `@theme` con el valor por defecto (para que Tailwind genere
`bg-deep`, `text-gold`, etc.) y `.tema-campo` los usa tal cual. Las clases auxiliares de la
referencia (`hero-shade`, `eyebrow`, `section-title`, `step-number`, `footer-heading`,
`brand-script`, `swatch-*`) se copian a `globals.css` bajo `.tema-campo`.

## 2. Tipografías

- **Decision**: Añadir `Barlow Condensed` (700, 900), `DM Sans` (400, 500, 700) y
  `Permanent Marker` al `<link>` de Google Fonts que ya existe en `app/layout.tsx`. Dentro de
  `.tema-campo` se redefinen `--font-body-md`, `--font-body-lg`, `--font-button` y
  `--font-display-lg*`/`--font-headline-md` a DM Sans / Barlow Condensed.
- **Rationale**: El proyecto ya carga fuentes con un `<link>`; agregar familias a esa misma URL no
  añade dependencias (Principio I). Redefinir las variables de fuente en `.tema-campo` hace que las
  páginas públicas existentes adopten la nueva letra sin tocarlas.
- **Alternatives considered**: `next/font/google` (auto‑hospedaje) → cambia el patrón del
  proyecto solo para esta pantalla. Rechazada.

## 3. Íconos

- **Decision**: Usar Material Symbols (ya cargado) para búsqueda, bolsa, menú, cerrar, flechas,
  estrella, sol, camión, escudo, subir, check, más/menos, papelera. WhatsApp y YouTube usan los
  íconos SVG que ya existen en `lib/ajustes/iconos-redes.tsx`.
- **Rationale**: La referencia usa `lucide-react`, que sería una dependencia nueva sin
  justificación (Principio I). Material Symbols tiene equivalentes directos.
- **Alternatives considered**: Instalar `lucide-react` → dependencia nueva. Rechazada.

## 4. Fotos de la referencia

- **Decision**: Copiar a `public/inicio/` las fotos que usa la página de referencia:
  `ranch-hero.jpg`, `ranch-team.jpg`, `cap-navy.jpg`, `cap-sand.jpg`, `cap-black.jpg`,
  `cap-camo.jpg`, `community-pasture.jpg`, `community-auction.jpg`, `community-woman.jpg`,
  `community-saddle.jpg`. Se sirven con `next/image` (rutas locales, sin `remotePatterns` nuevo).
- **Rationale**: FR-007. Son archivos estáticos pequeños (60–170 KB).
- **Alternatives considered**: Subirlas a R2 desde el panel → requiere una pantalla nueva que la
  spec no pide (Principio III). Rechazada.

## 5. Estado del carrito

- **Decision**: Un `CarritoProvider` (Context de React, componente cliente) montado en
  `app/[locale]/(site)/layout.tsx`, dentro de `.tema-campo`. Guarda las líneas en
  `sessionStorage` con la clave `bf-carrito-v1` y las lee al montar. Toda lectura/escritura va en
  `try/catch`; si el almacenamiento falla, el carrito sigue funcionando en memoria.
- **Rationale**: FR-021 pide conservar el contenido mientras se navega por el sitio público
  durante la visita, sin cuenta; la constitution 2.1.0 dice que vive en el navegador y que el
  sistema no lo guarda. `sessionStorage` dura lo que dura la pestaña (= la visita), y el layout
  del grupo `(site)` no se desmonta al navegar entre páginas públicas.
- **Alternatives considered**:
  - Solo memoria (como la referencia) → se pierde al recargar la página. Aceptable, pero
    `sessionStorage` cuesta pocas líneas y cubre SC-007 con recargas.
  - `localStorage` → persiste días entre visitas, más de lo que pide la spec. Rechazada.
  - Guardar en base de datos → prohibido por la constitution 2.1.0.

## 6. Número de WhatsApp

- **Decision**: Una función pura `numeroWhatsApp(ajustes)` en `lib/ajustes/whatsapp.ts`:
  1. Si existe una red social `whatsapp`, extrae los dígitos del número de su URL
     (`wa.me/<n>`, `api.whatsapp.com/send?phone=<n>`, o `whatsapp://send?phone=<n>`).
  2. Si no hay o no se puede extraer, usa `contactPhone` de Ajustes quitando todo lo que no sea
     dígito.
  3. Si no queda ningún número de al menos 7 dígitos, devuelve `null` y los botones de WhatsApp
     no se muestran (FR-027, caso borde).
  Otra función `enlaceWhatsApp(numero, texto)` arma `https://wa.me/<numero>?text=<texto codificado>`.
- **Rationale**: La referencia usa `api.whatsapp.com/send?text=` sin número, lo que abre WhatsApp
  sin destinatario; la spec pide enviarlo "hacia el número del negocio". El número ya se
  administra en Ajustes (010), así que no hace falta un campo nuevo.
- **Alternatives considered**: Campo nuevo "número de WhatsApp" en Ajustes → migración y
  pantalla nueva que la spec no pide. Rechazada.

## 7. Qué entra al carrito y cómo se ven las muestras de color

- **Decision**: Solo modelos `fixed_product` tienen botón "Añadir al carrito". Los productos fijos
  no tienen colores (009), así que su línea del carrito va sin color y el mensaje de WhatsApp omite
  "— color" cuando está vacío. Las tarjetas de modelos `configurable` muestran como muestras de
  color miniaturas circulares de la foto frontal de cada color (`color_image`, vista `front`);
  pulsar una cambia la foto de la tarjeta. Si un color no tiene foto frontal, no se muestra como
  muestra. El botón de un modelo configurable lleva a su configurador.
- **Rationale**: Los colores de un modelo solo tienen nombre (sin código de color); la foto
  frontal es lo único que puede representarlos visualmente, y FR-016 pide que la muestra cambie la
  foto "cuando el color tiene foto propia".
- **Alternatives considered**: Añadir un campo de color hexadecimal a `color` → migración y
  cambio en el panel no pedidos. Rechazada.

## 8. Tarjeta: etiqueta y "Cotizar"/precio

- **Decision**: Etiqueta de esquina "Personalizable" (configurable) o "Producto listo"
  (fixed_product). Donde la referencia muestra "Cotizar", un producto fijo muestra su precio con
  `formatUsd` y un configurable muestra "Cotizar". `formatUsd` pasa de "$120.00" a "US$ 120.00"
  (clarificación 2026-09-30, FR-018): "$" solo se confunde con pesos colombianos.

## 9. Encabezado compartido y login del panel

- **Decision**: Crear un encabezado nuevo `EncabezadoSitio` para el grupo `(site)`. El
  `NavBar` actual **no se modifica**: sigue siendo el que usa `app/[locale]/panel/login/layout.tsx`,
  que por 004 debe conservar su apariencia, y queda fuera de `.tema-campo`.
- **Rationale**: Evita que el login del panel reciba carrito y enlaces de la tienda, y cumple
  FR-003.

## 10. Enlaces de sección desde otras páginas

- **Decision**: Los enlaces del encabezado son `/{locale}#colecciones`, `#personaliza`, `#mayor`,
  `#comunidad`. En la portada la navegación salta a la sección; en otras páginas carga la portada
  en esa sección. El encabezado fijo compensa con `scroll-mt-24` en cada sección.

## 11. Buscador y filtros

- **Decision**: La colección es un componente cliente que recibe todos los modelos publicados ya
  traducidos desde el servidor y filtra en memoria por pestaña (`todos`, `configurable`,
  `fixed_product`) y texto (nombre, sin distinguir mayúsculas ni tildes). La lupa del
  encabezado siempre navega a `/{locale}?buscar=1#colecciones`; la colección abre su buscador
  cuando ve ese parámetro en la URL (en la portada solo cambia la URL y baja a la sección; desde
  otra página carga la portada ya con el buscador abierto).
- **Alternatives considered**: Un `CustomEvent` global entre encabezado y colección → dos
  mecanismos distintos según la página. Rechazada por simplicidad.
- **Rationale**: La cantidad de modelos publicados es pequeña (decenas); filtrar en el cliente es
  instantáneo y no requiere una ruta de búsqueda nueva.

## 12. "Tu hierro. Tu gorra"

- **Decision**: Componente cliente con el estado local de estilo (3 opciones) y color (4 opciones
  con las fotos `cap-*.jpg`). Actualiza la foto y las etiquetas de la vista previa. El paso 03
  muestra las dos tarjetas de la referencia ("Sube tu hierro" / "Diseño de la casa") como
  información, sin acción, con el texto "Lo haces en el configurador". El único botón activo es
  "Personalizar mi gorra", que lleva al configurador del modelo `configurable` publicado más
  reciente, o a `#colecciones` si no hay ninguno. El botón secundario "Añadir al carrito" de la
  referencia no se incluye.
- **Rationale**: Clarificación de la spec (vitrina, no duplica el configurador; FR-023: no sube
  archivos ni añade al carrito).

## 13. Pruebas

- **Decision**: Pruebas unitarias con Vitest (entorno `node`, como el resto) para las funciones
  puras nuevas: `numeroWhatsApp`, `enlaceWhatsApp`, `mensajeCarrito`, y el reductor del carrito
  (`agregar`, `cambiarCantidad`, `eliminar`, `totalUnidades`). La prueba de paridad de
  traducciones existente cubre las claves nuevas. La verificación visual se hace con
  `quickstart.md` (Principio IV).
- **Rationale**: El proyecto no tiene pruebas de componentes ni navegador; añadirlas sería una
  herramienta nueva (Principio I).
