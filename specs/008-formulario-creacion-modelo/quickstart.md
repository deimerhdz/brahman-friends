# Quickstart: Validar el formulario de creación de modelo

Guía para comprobar manualmente que la funcionalidad cumple la spec, siguiendo el Principio IV
(verificable por una persona no técnica).

## Prerrequisitos

- Servidor de desarrollo corriendo: `npm run dev`.
- Una cuenta de panel con sesión iniciada (ver flujo de login del panel existente).
- Al menos un modelo ya existente en el panel, para poder comparar su pantalla de edición contra la
  de creación.

## Escenario 1 — Comparación visual (SC-002)

1. Abrir `/es/panel/modelos/nuevo`.
2. Abrir en otra pestaña un modelo ya existente: `/es/panel/modelos/[id]`.
3. Comparar ambas pantallas: el orden y el estilo de los campos código, nombre (con el interruptor
   ES/EN), descripción y precio deben verse iguales.
4. Confirmar que en "Nuevo modelo" **no** aparecen: el campo de cantidad mínima de pedido (MOQ) ni
   el interruptor de publicar/despublicar (SC-003). En la pantalla de edición, ambos siguen
   apareciendo sin cambios.

## Escenario 2 — Crear un modelo completo (US1, SC-001)

1. En `/es/panel/modelos/nuevo`, llenar:
   - Código: un valor único, p. ej. `TEST-008`.
   - Nombre en español y en inglés (usando el interruptor ES/EN).
   - Descripción en español e inglés (opcional).
   - Precio: p. ej. `25.00`.
2. Guardar.
3. Verificar que la aplicación redirige a la pantalla de edición de ese modelo nuevo
   (`/es/panel/modelos/[id]`) y que ahí aparece el mismo precio y nombre guardados.
4. Verificar que el modelo aparece en el listado (`/es/panel/modelos`) con estado "Borrador".
5. Confirmar que todo el flujo tomó menos de 1 minuto.

## Escenario 3 — Validación de campos requeridos (US1, edge case)

1. En `/es/panel/modelos/nuevo`, dejar vacío el nombre en español (o en inglés).
2. Intentar guardar.
3. Verificar que el formulario no permite guardar y muestra el mismo tipo de aviso que se ve al
   intentar borrar el nombre desde la pantalla de edición de un modelo existente.
4. Confirmar que no se creó ningún modelo nuevo en el listado.

## Escenario 4 — Precio opcional

1. Repetir el Escenario 2 sin llenar el campo de precio.
2. Verificar que el modelo se crea igualmente y que, en su pantalla de edición, el precio aparece
   vacío/sin definir — igual que se permite hoy al editar un modelo sin precio.

## Escenario 5 — Continuar armando el modelo (FR-006, FR-008)

1. Después de crear un modelo (Escenario 2), en la pantalla a la que se redirige, subir una vista,
   configurar un color y una zona de personalización, tal como se hace hoy al editar cualquier
   modelo.
2. Confirmar que este paso no cambió respecto al comportamiento actual: es el mismo configurador de
   tres pasos.

## Verificación de API (opcional, para quien revise el contrato)

```bash
curl -X POST http://localhost:3000/api/panel/modelos \
  -H "Content-Type: application/json" \
  -H "Cookie: <cookie de sesión de panel>" \
  -d '{"code":"TEST-008","name":{"es":"Prueba","en":"Test"},"description":{"es":"","en":""},"price":25}'
```

Debe responder `201` con `price: "25.00"`. Ver [contracts/post-modelos.md](./contracts/post-modelos.md)
para el resto de casos (precio inválido, campos faltantes).
