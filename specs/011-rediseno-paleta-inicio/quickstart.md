# Quickstart: verificar la nueva paleta y la página de inicio

## Preparación

1. Base de datos con migraciones al día (`yarn db:migrate`) y un usuario administrador.
2. En el panel (`/es/panel`):
   - Publicar al menos **un modelo configurable** con al menos dos colores con foto frontal.
   - Publicar al menos **un producto fijo** con precio y foto frontal.
   - En **Ajustes**: agregar una red social WhatsApp (`https://wa.me/573001234567`) y una de
     YouTube. Dejar el banner vacío al principio.
3. `yarn dev` y abrir `http://localhost:3000/es`.
4. Tener abierta la referencia (`../brahman-threads`, `bun run dev` o `npm run dev`) para
   compararla lado a lado.

## Comprobaciones automáticas

```bash
yarn test        # incluye paridad de traducciones y funciones del carrito/WhatsApp
yarn typecheck
yarn lint
```

Resultado esperado: todo en verde.

## Recorrido manual

| # | Paso | Resultado esperado | Cubre |
|---|------|--------------------|-------|
| 1 | Abrir `/es` a 1440 px junto a la referencia | Mismo orden de secciones, colores, letras y textos; la colección muestra los modelos reales | US1, SC-001 |
| 2 | Pulsar "Personalizar con mi hierro" y luego "Ver colección oficial" en el héroe | Baja a "Tu hierro. Tu gorra" y a "Nuestra colección" | US1 |
| 3 | Subir un banner en Ajustes y recargar | El héroe usa el banner con el degradado azul marino | FR-006 |
| 4 | Cambiar a EN | Todos los textos en inglés | FR-008 |
| 5 | Pestañas Personalizables / Productos listos / Todos | Filtra por tipo | US2 |
| 6 | Pulsar la lupa, escribir parte de un nombre; luego un texto sin coincidencias | Filtra; luego "No encontramos gorras con esa búsqueda" | US2 |
| 7 | En la tarjeta configurable, pulsar otra muestra de color; luego "Personalizar" | Cambia la foto; llega al configurador | US2, SC-003 |
| 8 | En el producto fijo, mirar el precio y pulsar "Añadir al carrito" dos veces | El precio se ve como "US$ 120.00" (igual en su página de producto); se abre el panel; una línea con cantidad 2; contador en 2 | US3, FR-018 |
| 9 | "−" hasta 0 y volver a añadir; cerrar con Escape, clic fuera y X | Línea desaparece y vuelve; el panel se cierra en los tres casos | US3 |
| 10 | Ir a `/es/catalogo` y volver a `/es`; recargar | El carrito conserva su contenido | SC-007 |
| 11 | "Consultar pedido por WhatsApp" | Abre `wa.me/573001234567` con el mensaje que lista las líneas | US3, SC-002 |
| 12 | En "Tu hierro. Tu gorra", cambiar estilo y color; pulsar "Personalizar mi gorra" | Cambian foto y etiquetas; llega al configurador | US4 |
| 13 | "Cotizar pedido para mi finca" y botón de YouTube | WhatsApp con el mensaje de 12+ unidades; YouTube en otra pestaña | US4 |
| 14 | Recorrer catálogo, producto, configurador, cuenta, solicitud y política de privacidad en ES y EN | Encabezado, pie y paleta nuevos; idioma y cuenta funcionan | US5, SC-004 |
| 15 | Desde `/es/catalogo`, pulsar "Pedidos por mayor" en el encabezado | Carga la portada en esa sección | US5 |
| 16 | Entrar a `/es/panel` y `/es/panel/login` | Se ven exactamente como antes | FR-003, SC-006 |
| 17 | Portada a 360 px y 768 px | Sin desplazamiento horizontal; menú hamburguesa con secciones, YouTube, idioma y cuenta; botón flotante visible | US6, SC-005 |
| 18 | Quitar WhatsApp de Ajustes y el teléfono de contacto | Desaparecen los botones de WhatsApp; el carrito indica que no se puede enviar | Caso borde |
| 19 | Quitar YouTube de Ajustes | Desaparece el botón de YouTube | Caso borde |
| 20 | Despublicar todos los configurables y pulsar "Personalizar mi gorra" | Baja a la colección | Caso borde |
| 21 | Activar "reducir movimiento" en el sistema | Sin zoom en tarjetas ni desplazamiento suave | FR-029 |
