# UI Contracts: Nueva paleta y rediseño de la página de inicio

No se crean ni cambian rutas de API. Estos son los contratos que otras partes del sitio (o una
persona que verifica) pueden observar.

## 1. Anclas de la portada

| Ancla | Sección | Enlazada desde |
|-------|---------|----------------|
| `#inicio` | héroe | "Volver arriba" del pie |
| `#colecciones` | Nuestra colección | encabezado, héroe ("Ver colección oficial"), carrito vacío |
| `#personaliza` | Tu hierro. Tu gorra | encabezado, héroe ("Personalizar con mi hierro") |
| `#mayor` | Pedidos por mayor | encabezado, pie |
| `#comunidad` | Somos de campo | encabezado |

Desde cualquier página pública los enlaces son `/{locale}#<ancla>`.

Parámetro de consulta: `/{locale}?buscar=1#colecciones` abre el buscador de la colección.

## 2. Enlaces de WhatsApp

Formato: `https://wa.me/{numero}?text={encodeURIComponent(mensaje)}`. `numero` solo dígitos,
resuelto según research.md #6. Si no hay número, ningún botón de WhatsApp se renderiza.

| Origen | Mensaje (es) |
|--------|--------------|
| Encabezado y botón flotante | `Hola, quiero saber más sobre las gorras {siteName}.` |
| Pedidos por mayor | `Hola, quiero cotizar gorras personalizadas para mi ganadería, subasta o evento. Me interesan 12 o más unidades.` |
| Carrito | `Hola, quiero consultar este pedido de {siteName}:` + una línea por producto: `• {cantidad} × {nombre}` + ` — {color}` si hay color |

Cada mensaje tiene su equivalente en `en.json`. `{siteName}` es el nombre del sitio en el idioma
activo.

## 3. Almacenamiento del carrito

- Clave: `sessionStorage["bf-carrito-v1"]`
- Valor: `LineaCarrito[]` en JSON (ver data-model.md).
- Cambiar la forma del valor exige cambiar el sufijo `v1`.

## 4. Claves de traducción nuevas

Todas bajo el espacio `inicio.*` en `messages/es.json` y `messages/en.json` (misma estructura en
ambos; la prueba de paridad existente lo verifica):

```text
inicio.anuncio.{envios, bordado}
inicio.nav.{colecciones, personaliza, mayor, comunidad, youtube, buscar, whatsapp,
            abrirCarrito, abrirMenu, cerrarMenu, irInicio}
inicio.hero.{eyebrow, titulo, subtitulo, ctaPersonalizar, ctaColeccion, explora, altImagen}
inicio.beneficios.{bordado, bordadoSub, sol, solSub, envios, enviosSub, durar, durarSub}
inicio.coleccion.{eyebrow, titulo, subtitulo, contador, filtroTodos, filtroPersonalizables,
                  filtroListos, buscarPlaceholder, cerrarBusqueda, sinResultados, vacia,
                  etiquetaPersonalizable, etiquetaListo, cotizar, personalizar, anadir,
                  aviso, colorDe}
inicio.personaliza.{eyebrow, titulo, subtitulo, vistaPrevia, paso1, paso2, paso3, paso3Sub,
                    subir, casa, enConfigurador, cta, estilos.{trucker, cuero, curva},
                    colores.{azulRojo, arenaCafe, negro, camo}}
inicio.mayor.{eyebrow, titulo, texto, unidades, unidadesTexto, cta, etiquetaFoto, altFoto,
              mensaje}
inicio.comunidad.{eyebrow, titulo, subtitulo, youtube, lema1, lema2, firma,
                  alt.{potrero, subasta, ganadera, montura}}
inicio.carrito.{eyebrow, titulo, cerrar, vacio, vacioSub, verColeccion, precioPorConfirmar,
                quitarUno, anadirUno, eliminar, aviso, enviar, sinWhatsapp, mensaje}
inicio.pie.{proposito, explora, contacto, hablarWhatsapp, verYoutube, tuPedido,
            tuPedidoTexto, atencion, derechos, volverArriba}
inicio.whatsapp.{general, flotante}
```

Las claves `landing.*` de las secciones eliminadas (`landing.process.*`, `landing.b2b.*`,
`landing.hero.*`, `landing.footer.*`) se eliminan; `landing.hero.subtitle` se reemplaza por
`inicio.hero.subtitulo` en `generateMetadata`. Se **conservan** `landing.collection.eyebrow`,
`landing.collection.viewDetails` y `landing.collection.customize`, que usa
`app/[locale]/(site)/catalogo/page.tsx`. Antes de borrar una clave se busca que no tenga otros usos.

## 5. Clase de tema

`.tema-campo` es el único punto donde se define la paleta pública. Cualquier página nueva del
grupo `(site)` la hereda automáticamente. Nada dentro de `app/[locale]/panel/**` debe usarla.
