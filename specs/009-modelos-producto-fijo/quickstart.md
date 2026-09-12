# Quickstart: Validar modelos de producto fijo

Guía para comprobar manualmente que la funcionalidad cumple la spec, siguiendo el Principio IV
(verificable por una persona no técnica).

## Prerrequisitos

- Servidor de desarrollo corriendo: `npm run dev`.
- Una cuenta de panel con sesión iniciada.
- Al menos un modelo configurable ya existente (creado antes de esta funcionalidad, o creado sin
  cambiar el tipo), para las pruebas de no-regresión.

## Escenario 1 — Crear un producto fijo completo (US1, SC-001)

1. Abrir `/es/panel/modelos/nuevo`.
2. Elegir el tipo "Producto fijo".
3. Completar código, nombre (ES/EN), descripción (ES/EN) y precio (p. ej. `35.00`).
4. Guardar. Confirmar que el modelo se crea y redirige a su pantalla de gestión.
5. En esa pantalla, confirmar que **no** aparecen el paso de colores ni el de zona de
   personalización/técnicas — solo el paso de fotos (vistas).
6. Subir al menos una foto (vista frontal).
7. Publicar el modelo. Confirmar que se publica sin errores.
8. Confirmar que todo el flujo (pasos 1 a 7) tomó menos de 2 minutos.

## Escenario 2 — Precio obligatorio para producto fijo (US1, edge case)

1. Repetir el Escenario 1 pero dejar el precio vacío al guardar.
2. Verificar que el sistema no permite guardar y muestra un aviso de campo requerido.
3. Confirmar que no se creó ningún modelo nuevo en el listado.

## Escenario 3 — Publicación bloqueada sin foto o sin precio (US1, SC-002)

1. Crear un modelo "Producto fijo" con precio pero sin subir ninguna foto.
2. Intentar publicarlo. Verificar que el sistema lo impide y explica qué falta.
3. Repetir sin precio (si la API lo permitiera guardar sin precio, cosa que el Escenario 2 ya
   verifica que no ocurre) — confirmar igualmente que un modelo incompleto nunca queda publicado.

## Escenario 4 — Modelos configurables sin cambios (US3, SC-003)

1. Abrir un modelo configurable ya existente (creado antes de esta funcionalidad).
2. Confirmar que aparece con tipo "Configurable" y que sus tres pasos (Vistas, Colores,
   Personalización) siguen ahí sin cambios.
3. Crear un modelo nuevo sin tocar el selector de tipo, dejar el precio vacío, y confirmar que se
   crea igual que siempre (sin error), y sigue llevando al configurador de vistas/colores/
   personalización.

## Escenario 5 — El cliente ve y pide un producto fijo (US2, SC-005)

1. Con el modelo "Producto fijo" publicado en el Escenario 1, abrir la página de inicio del sitio
   (`/es`) como visitante (sin sesión).
2. Confirmar que el modelo aparece en el catálogo ("The Collection") junto con los modelos
   configurables, mostrando su precio.
3. Abrirlo. Confirmar que se ven sus fotos, descripción y precio, y que **no** aparece ningún paso
   de configurador (colores, zonas, técnicas).
4. Pedirlo: indicar una cantidad y completar nombre, correo, teléfono, aceptar la política de
   privacidad, y enviar.
5. Confirmar que se recibe un código de seguimiento y que todo el flujo (pasos 1 a 4) tomó menos de
   2 minutos.
6. Ir a `/es/solicitud/[codigo]` con ese código y confirmar que se puede seguir el estado del
   pedido, igual que ya funciona hoy para un pedido de modelo configurable.
7. Como administrador, abrir ese pedido en `/es/panel/solicitudes/[id]` y confirmar que se ve la
   foto/nombre/precio del producto en vez de un resumen de colores/decoraciones, sin errores en la
   pantalla.

## Escenario 6 — Un producto fijo en borrador no aparece en el catálogo (edge case)

1. Despublicar el modelo "Producto fijo" del Escenario 1 (volver a borrador).
2. Recargar la página de inicio como visitante y confirmar que ya no aparece en el catálogo.

## Escenario 7 — El tipo no se puede ver ni editar después de crear (FR-010)

1. Abrir la pantalla de gestión de cualquier modelo ya creado (de cualquier tipo).
2. Confirmar que no hay ningún control para cambiar su tipo.

## Escenario 8 — Distinguir el tipo en el listado del panel (US4, SC-004)

1. Con al menos un modelo de cada tipo creado, abrir `/es/panel/modelos`.
2. Confirmar que cada fila indica su tipo ("Configurable" o "Producto fijo") a simple vista.

## Verificación de API (opcional, para quien revise el contrato)

```bash
curl -X POST http://localhost:3000/api/panel/modelos \
  -H "Content-Type: application/json" \
  -H "Cookie: <cookie de sesión de panel>" \
  -d '{"code":"TEST-009","name":{"es":"Gorra clásica","en":"Classic cap"},"type":"fixed_product","price":35}'
```

Debe responder `201` con `type: "fixed_product"` y `price: "35.00"`. Repetir sin `"price"` y
confirmar `400 datos_invalidos`. Ver
[contracts/post-modelos.md](./contracts/post-modelos.md),
[contracts/patch-modelo.md](./contracts/patch-modelo.md),
[contracts/post-modelos-publicar.md](./contracts/post-modelos-publicar.md) y
[contracts/post-solicitudes.md](./contracts/post-solicitudes.md) para el resto de casos.
