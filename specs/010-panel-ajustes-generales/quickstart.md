# Quickstart: Validar Ajustes generales del sitio

Guía para comprobar manualmente que la funcionalidad cumple la spec, siguiendo el Principio IV
(verificable por una persona no técnica).

## Prerrequisitos

- Servidor de desarrollo corriendo: `npm run dev`.
- Una cuenta de panel con sesión iniciada.
- La migración de esta funcionalidad ya corrida (`npm run db:migrate`), así `/panel/ajustes`
  arranca con los valores sembrados (nombre del sitio = "Brahman Friends" en ambos idiomas, resto
  vacío) en vez de un formulario roto.

## Escenario 1 — Editar la información básica (US1, SC-001)

1. Abrir `/es/panel/ajustes`.
2. Confirmar que el formulario ya muestra "Brahman Friends" como nombre del sitio en español e
   inglés (valor sembrado), no un campo vacío.
3. Cambiar el nombre del sitio en español e inglés (por ejemplo a "Brahman Test"), completar correo
   y teléfono de contacto, guardar.
4. Confirmar el mensaje de éxito.
5. Abrir la portada pública (`/es`) y el panel (`/es/panel/modelos`): confirmar que el nuevo nombre
   aparece en el encabezado de ambos, en español.
6. Cambiar el idioma a inglés (`/en`) y confirmar que ahí se ve el nombre en inglés.
7. Confirmar que todo el flujo (pasos 1 a 6) tomó menos de 1 minuto desde que se guardó.

## Escenario 2 — Nombre del sitio obligatorio en ambos idiomas (US1, edge case)

1. En `/es/panel/ajustes`, borrar el nombre del sitio en un solo idioma y guardar.
2. Confirmar que el sistema no guarda y muestra un error claro.
3. Recargar la página y confirmar que el nombre anterior (no vacío) sigue ahí — nada se perdió a
   medias.

## Escenario 3 — Logo y banner (US2, SC-002)

1. En `/es/panel/ajustes`, subir una imagen como logotipo y guardar.
2. Abrir la portada pública y el panel: confirmar que la imagen reemplaza el nombre en texto del
   encabezado en ambos, y que se ve igual entrando en `/en`.
3. Volver a Ajustes, subir una imagen distinta como banner del header y guardar.
4. Abrir la portada pública (`/es`): confirmar que esa imagen aparece en la zona destacada del
   encabezado de inicio (donde antes se veía el recuadro vacío con "ARRASTRÁ PARA ROTAR").
5. Quitar el logo (sin subir uno nuevo) y guardar. Confirmar que el encabezado vuelve a mostrar el
   nombre en texto, sin ningún espacio roto.
6. Intentar subir un archivo que no sea imagen (por ejemplo un `.pdf`) como banner. Confirmar que
   el sistema lo rechaza con un mensaje claro y que el banner anterior sigue configurado.

## Escenario 4 — SEO de la página de inicio (US3, SC-004)

1. En `/es/panel/ajustes`, completar título y descripción de SEO en español e inglés, y subir una
   imagen de vista previa. Guardar.
2. Ver el código fuente de la portada pública (`/es`, clic derecho → "ver código fuente" o
   herramienta de desarrollador) y confirmar que el `<title>` y la etiqueta `description` muestran
   los valores configurados en español.
3. Repetir en `/en` y confirmar los valores en inglés.
4. Pegar la URL de la portada en una herramienta de vista previa de enlaces (por ejemplo el
   compositor de un chat que muestre previsualización, o un validador de Open Graph) y confirmar
   que aparecen el título, la descripción y la imagen configurados.
5. Volver a Ajustes, vaciar título y descripción de SEO, guardar, y confirmar que la portada sigue
   teniendo un `<title>` y una descripción (los valores por defecto), nunca vacíos.

## Escenario 5 — Redes sociales (US4, SC-005)

1. En `/es/panel/ajustes`, agregar una red social eligiendo una plataforma de la lista (por ejemplo
   Instagram) y su enlace. Guardar.
2. Abrir la portada pública, bajar hasta el pie de página, y confirmar que aparece el icono de esa
   plataforma, clickeable, apuntando al enlace configurado.
3. Confirmar que todo el flujo (pasos 1 a 2) tomó menos de 1 minuto.
4. Volver a Ajustes, editar el enlace de esa misma red social, guardar, y confirmar que el pie de
   página refleja el enlace nuevo.
5. Agregar una segunda red social de la misma plataforma (por ejemplo otro enlace de Instagram).
   Confirmar que ambos aparecen en el pie de página, en el orden en que se agregaron.
6. Quitar una de las redes sociales agregadas. Confirmar que desaparece del pie de página.
7. Intentar guardar una red social con un enlace que no es una URL válida (por ejemplo
   "no-es-un-link"). Confirmar que el sistema lo rechaza con un mensaje claro.

## Escenario 6 — Sin regresión en lo que ya funcionaba

1. Antes de configurar nada en Ajustes (o después de vaciar logo/banner/SEO/redes), confirmar que
   el sitio se ve exactamente igual que hoy: nombre en texto en el encabezado, recuadro vacío en el
   header de inicio, sin sección de redes sociales visible en el pie de página, título/descripción
   por defecto en el `<head>`.
