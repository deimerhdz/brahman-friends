# Contrato de UI: Página de inicio y barra de navegación compartida

Esta feature no expone ninguna API nueva. Su "interfaz" es la página que ve el visitante y el
layout compartido que ya usan otras páginas del sitio. Este documento fija el contrato de esa
interfaz para que la implementación (tasks) y la verificación (quickstart) tengan la misma
referencia.

## Ruta: `GET /{locale}` (`app/[locale]/page.tsx`)

**Entradas**

- `locale` (parámetro de ruta): `"es"` | `"en"` (ya validado por `app/[locale]/layout.tsx`, que
  hace `notFound()` si no es un locale soportado — sin cambios).

**Salida (estructura visible, en orden)**

1. Barra de navegación (ver contrato de layout más abajo — persiste en todas las páginas, no solo
   en esta).
2. Sección héroe: título, subtítulo, botón primario ("Start Designing", sin navegación funcional —
   FR-008), botón secundario ("View Collections", con navegación funcional a la sección
   "The Collection" dentro de la misma página), marcador de imagen neutro (FR-013).
3. Sección "The Collection": encabezado + enlace "Explore All" (desplaza a esta misma sección) +
   grid de tarjetas de modelos publicados (0 a N tarjetas) o estado vacío si N = 0 (FR-010).
4. Sección "B2B Services & Bulk Orders": contenido estático traducido + botón "Inquire for
   Wholesale" (sin navegación funcional — FR-008).
5. Sección "The Process": 3 pasos + botón "Launch Configurator" (sin navegación funcional —
   FR-008).
6. Pie de página: nombre del sitio, enlaces informativos (sin navegación funcional salvo que ya
   exista la página, p. ej. política de privacidad si aplica), línea de copyright.

**Invariantes**

- Todo el texto de las secciones 2 a 6 sale de `messages/{locale}.json` (namespace `landing`, ver
  `data-model.md`) — ninguna cadena fija en el JSX salvo nombres propios de marca.
- Sin overflow horizontal para cualquier ancho de viewport entre 360px y 1920px (SC-003).
- Cada tarjeta de modelo enlaza a `/${locale}/configurador/${id}` (comportamiento ya existente,
  sin cambios).

## Layout compartido: barra de navegación (`app/[locale]/layout.tsx` + `app/_components/landing/NavBar.tsx`)

Aplica a **todas** las páginas bajo `/{locale}`, no solo a la de inicio — es el mismo header que ya
envuelve `children` hoy.

**Elementos y su comportamiento (contrato de comportamiento, no de estilo)**

| Elemento | Comportamiento requerido | Componente que lo implementa |
|---|---|---|
| Nombre del sitio / logo | Enlace a `/${locale}` | Ya existe en `layout.tsx` (`<Link href={\`/${locale}\`}>`) |
| Selector de idioma | Cambia el locale activo y navega a la misma ruta en el otro idioma | `SelectorIdioma` (sin cambios de comportamiento) |
| Control de cuenta | Sin sesión: enlaces a iniciar sesión / crear cuenta. Con sesión: nombre + cerrar sesión | `ControlCuenta` (sin cambios de comportamiento) |
| Botón de menú móvil (solo cuando la barra horizontal completa no cabe) | Abre/cierra un panel con los tres elementos anteriores | `MobileNavPanel` (nuevo) |

**Invariante clave (FR-003, FR-007, SC-002)**: en cualquier ancho de pantalla, las tres opciones
funcionales (inicio, idioma, cuenta) están disponibles y operan igual que hoy — cambia únicamente
la presentación visual (estilo del mockup) y, en móvil, si están agrupadas dentro de un panel
desplegable en vez de en línea.

## Fuera de este contrato

- No se documentan contratos de API/base de datos nuevos: no hay endpoints nuevos ni tablas nuevas
  (ver `data-model.md`).
- El comportamiento de `ControlCuenta` y `SelectorIdioma` (autenticación, cookies de idioma) no
  cambia; este contrato solo fija que siguen presentes y funcionales, no redefine su lógica interna.
