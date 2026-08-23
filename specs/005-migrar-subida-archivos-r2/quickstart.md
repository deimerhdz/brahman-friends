# Quickstart: validar la migración a Cloudflare R2

Guía para comprobar, recorriendo la app (Principio IV: verificable por una persona no técnica), que
cada historia de usuario de la spec funciona de punta a punta.

## Prerrequisitos

1. Un bucket de Cloudflare R2 creado, con acceso público habilitado y CORS configurado para
   permitir `PUT` desde el dominio donde corre la app (ver la guía de configuración de Cloudflare
   entregada junto con esta funcionalidad, FR-010).
2. Variables de entorno nuevas configuradas (local: `.env`; producción: panel de Vercel):
   - `R2_ACCOUNT_ID`
   - `R2_ACCESS_KEY_ID`
   - `R2_SECRET_ACCESS_KEY`
   - `R2_BUCKET_NAME`
   - `R2_PUBLIC_BASE_URL` (dominio público desde el que se sirven los archivos)
3. `next.config.ts` con el hostname de `R2_PUBLIC_BASE_URL` agregado a `images.remotePatterns`
   (sin retirar el de Vercel Blob).
4. `npm run dev` corriendo, con sesión de administrador disponible para las pruebas del panel.

## Escenario 1 — Subir la imagen de un color (Historia de usuario 1, P1)

1. Entrar al panel administrativo → Colores → editar o crear un color.
2. Seleccionar un archivo de imagen (PNG/JPEG/WebP) para "Imagen de muestra".
   - **Esperado**: aparece la vista previa de inmediato; el botón "Subir" queda habilitado; nada se
     ha subido todavía.
3. Presionar "Subir".
   - **Esperado**: aparece una alerta de éxito al terminar.
4. Guardar el color.
   - **Esperado**: al recargar la pantalla de edición, la imagen guardada es la que se subió, y su
     URL apunta al dominio público de R2 (`R2_PUBLIC_BASE_URL`).
5. Repetir el paso 2 con un archivo que provoque un error (por ejemplo, forzando una desconexión de
   red durante la subida).
   - **Esperado**: alerta de error, la vista previa se conserva, se puede reintentar sin perder la
     selección.

## Escenario 2 — Subir la imagen de una vista de modelo (Historia de usuario 2, P2)

1. Entrar al panel administrativo → Modelos → un modelo → Vistas.
2. Subir la imagen de la vista "frontal" con el mismo flujo de precarga + botón + alerta.
   - **Esperado**: mismo comportamiento observable que el Escenario 1 (vista previa antes de subir,
     alerta de éxito/error).
3. Verificar que la imagen queda asociada solo a esa vista de ese modelo (otras vistas no cambian).
4. Reemplazar la imagen de esa misma vista por otra.
   - **Esperado**: la nueva imagen sustituye a la anterior tras confirmar la subida.

## Escenario 3 — Carga masiva de imágenes (Historia de usuario 3, P3)

1. Entrar a Modelos → un modelo → Imágenes (carga masiva).
2. Arrastrar una carpeta con varias imágenes nombradas según la convención esperada.
   - **Esperado**: el flujo de revisión en matriz funciona igual que antes de la migración (sin
     cambios de UX).
3. Confirmar la subida del lote.
   - **Esperado**: todas las imágenes quedan accesibles y sus URLs guardadas apuntan al dominio
     público de R2.

## Escenario 4 — Solicitud de cotización de un cliente (Historia de usuario 3, P3)

1. Como cliente anónimo, entrar al configurador, elegir un modelo, personalizarlo y avanzar hasta
   enviar la solicitud.
2. Completar el envío de la solicitud.
   - **Esperado**: la solicitud se registra con éxito y, al revisarla desde el panel administrativo,
     las vistas compuestas se ven correctamente y sus URLs apuntan al dominio público de R2.

## Escenario 5 — Logotipo del cliente (flujo existente, sin cambio de UX)

1. Como cliente anónimo, en el paso de decoración del configurador, subir un logotipo (PNG, JPEG o
   SVG).
   - **Esperado**: comportamiento idéntico al actual (avisos de baja resolución o fondo no
     transparente si aplican); la URL resultante apunta ahora al dominio público de R2.

## Verificación de no regresión sobre el histórico (FR-011)

- Abrir un color, una vista de modelo o una solicitud creados **antes** de esta migración.
  - **Esperado**: sus imágenes se siguen viendo correctamente, sirviéndose desde el hostname de
    Vercel Blob (sin haberse movido a R2).

## Verificación técnica rápida (opcional, para quien implementa)

```bash
npm run typecheck
npm test
```
