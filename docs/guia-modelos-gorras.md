# Guía de negocio: cómo cargar un modelo de gorra en el panel

Esta guía explica, en términos de negocio (no técnicos), qué significa cada
campo del panel administrativo al cargar un modelo de gorra nuevo, en qué
orden completarlo, y por qué. Cierra con un ejemplo completo end-to-end de
una "Gorra Trucker Classic" con dos colores de personalización (negro y
azul), incluyendo el prompt para generar las imágenes con IA.

## 1. Cómo piensa el sistema un modelo de gorra

Un **modelo** (ej. "Gorra Trucker Classic") no es una sola imagen: es un
conjunto de piezas que el cliente final puede combinar en el configurador.
El panel te pide cargar esas piezas por separado:

| Concepto | Qué es en negocio | Ejemplo |
|---|---|---|
| **Modelo** | La gorra en sí — su ficha general | "Gorra Trucker Classic", código `TRK-100` |
| **Vistas** | Los ángulos de cámara disponibles | Frontal (obligatoria), Lateral, Trasera |
| **Componentes** | Las piezas físicas de la gorra | Panel frontal, malla trasera, visera, botón |
| **Personalizable** | Si esa pieza cambia de color en el configurador o va fija | Panel frontal: sí. Visera: no |
| **Colores** | Catálogo general de colores (no es por modelo) | Negro, Azul — se crean una vez y se reutilizan en todos los modelos |
| **Imágenes de componente** | Una foto/render por cada combinación pieza × color × vista | Panel frontal + Azul + Frontal |
| **Zonas de decoración** | Dónde y cómo se puede poner un logo/bordado | Zona "Frontal", 8×5 cm máx |
| **Técnicas** | Catálogo general de técnicas de decoración | Bordado, Estampado |
| **Tallas** | Tamaños disponibles | Única, S, M, L |

**Buena práctica (ya no es una validación obligatoria del sistema):** definí
de entrada un único tamaño de lienzo para todas las imágenes de un mismo
modelo (ej. `1600×1600 px`) y usalo para la vista base y para cada imagen
de componente. El sistema ya no rechaza imágenes de tamaño distinto, pero
si el panel frontal y la malla trasera no comparten el mismo encuadre y
escala que la imagen base, el configurador las va a mostrar desalineadas
sobre la gorra del cliente — mantener un tamaño consistente sigue siendo
lo que evita ese desajuste visual.

## 2. Antes de crear el modelo: catálogos compartidos

Colores y técnicas **no se crean por modelo**: son catálogos globales que
después habilitás modelo por modelo. Si el color o la técnica que necesitás
ya existe (de otro modelo), no hace falta recrearlo.

### 2.1 Colores (`/panel/colores`)

| Campo | Qué significa | Ejemplo |
|---|---|---|
| Nombre (ES/EN) | Nombre visible para el cliente | "Negro" / "Black" |
| Referencia de proveedor | Código interno de compras, para que el equipo de producción sepa qué tela/hilo pedir | `TX-BLK-01` |
| Material | Debe coincidir con el material del componente donde se use (tela, hilo de bordado, plástico, metal) | Tela |
| Imagen de muestra | Swatch/chip de color que ve el cliente al elegir | foto cuadrada del material |
| Estado | Disponible / Agotado / Descontinuado — un color agotado no se puede elegir en el configurador | Disponible |

### 2.2 Técnicas (`/panel/tecnicas`)

Nombre bilingüe de cada técnica de decoración que ofrecés (Bordado,
Estampado, Vinilo, etc.). Se habilitan por modelo más adelante desde la
ficha del modelo — ahí es solo un checklist.

## 3. Crear el modelo — datos generales

`/panel/modelos/nuevo`

| Campo | Qué significa | Ejemplo |
|---|---|---|
| Código interno | Identificador único de referencia interna/inventario, no lo ve el cliente | `TRK-100` |
| Nombre (ES/EN) | Nombre comercial | "Gorra Trucker Classic" / "Classic Trucker Cap" |
| Descripción (ES/EN) | Texto de venta, va en la ficha del producto | ver ejemplo abajo |

Al guardar, el modelo queda en estado **Borrador**. Sigue en borrador hasta
que completes todo lo obligatorio (sección 8) y presiones **Publicar** — el
cliente nunca ve un modelo en borrador.

## 4. Vistas (`.../vistas`)

Activás qué ángulos de cámara existen para este modelo y subís la **imagen
base** de cada uno: la foto completa de la gorra tal cual se ve, incluyendo
todas las piezas fijas (visera, botón, costuras, sombras).

- **Frontal** siempre está activa, no se puede desactivar — es la vista
  mínima para poder trabajar cualquier modelo.
- **Lateral** y **Trasera** son opcionales: activalas solo si vas a ofrecer
  esos ángulos en el configurador.
- La primera imagen que subís acá (normalmente la frontal) es la que fija
  el ancho/alto en píxeles para todo el modelo.

## 5. Componentes (`.../componentes`)

Cada fila es una pieza física de la gorra.

| Campo | Qué significa | Ejemplo |
|---|---|---|
| Nombre (ES/EN) | Nombre de la pieza | "Panel frontal" |
| Material | De qué está hecha — determina qué colores del catálogo se le pueden asignar (deben ser del mismo material) | Tela |
| Orden de capa | En qué orden se dibuja sobre la vista base cuando hay varias piezas personalizables que se superponen (más alto = más arriba) | `1` |
| Personalizable | Si el cliente puede elegirle color en el configurador. Si **no**, la pieza queda fija tal como se ve en la imagen base y no pedís imágenes de componente para ella | Sí para panel frontal, No para visera |

Después de crear un componente personalizable, marcás qué colores del
catálogo global están habilitados para él (deben compartir material) y
elegís uno como **color por defecto** — el que se ve al entrar al
configurador antes de que el cliente elija.

## 6. Imágenes de componente (`.../imagenes`)

Acá subís, una por una, la imagen de **cada pieza personalizable, en cada
color habilitado, en cada vista activa**. El sistema las superpone en vivo
sobre la imagen base según el "orden de capa" del componente.

Elegís Componente → Color → Vista y subís el archivo (cualquier nombre de
archivo sirve). El sistema ya no bloquea la carga si el tamaño no coincide
con las demás imágenes del modelo, así que esa alineación queda a tu
cargo (ver el aviso más abajo).

La tabla "Qué falta y qué ya está cargado" de esa misma página te muestra
en todo momento qué combinaciones pieza × color × vista siguen pendientes.

**Importante:** aunque ya no sea obligatorio, cada imagen de componente
tiene que seguir siendo un PNG con **fondo transparente** fuera de esa
pieza puntual (solo se ve la pieza en ese color; el resto del lienzo
transparente deja ver la imagen base debajo) y estar perfectamente
alineada píxel a píxel con la imagen base — mismo encuadre, mismo tamaño
de lienzo, misma posición de la gorra. Si no lo está, el resultado se ve
desalineado en el configurador aunque el sistema la haya aceptado.

## 7. Zonas de decoración (`.../zonas`)

Definen dónde y cómo se puede poner un logo o texto bordado/estampado
sobre la gorra, por posición (Frontal, Lateral izquierdo, Lateral derecho,
Trasera).

| Campo | Qué significa | Ejemplo |
|---|---|---|
| Ancho/alto máximo (cm) | Tamaño físico real máximo del logo, para que producción sepa el límite | 8 × 5 cm |
| Posición y tamaño en px (X, Y, Ancho, Alto) | El rectángulo, en píxeles del lienzo, donde el logo puede colocarse | ajustalo mirando la vista previa en vivo |
| Arco | Cuánto se curva el logo siguiendo la forma de la gorra (rango -1 a 1; 0 = sin curva) | `0.15` |
| Inclinación | Cuánto se inclina el logo hacia un costado (rango -1 a 1; 0 = sin inclinar) | `0` |
| Estrechamiento | Cuánto se angosta el logo hacia los bordes, como si envolviera la superficie (rango 0 a 1; 0 = sin efecto) | `0.1` |
| Máximo de caracteres de texto | Si el cliente pone texto en vez de logo, cuántos caracteres entran | `20` |

Es opcional: si el modelo no ofrece personalización con logo, no hace falta
cargar zonas.

## 8. Tallas (`.../tallas`)

Lista simple de tallas disponibles (texto libre + orden). Para una gorra
ajustable (snapback/velcro) alcanza con una sola talla "Única".

## 9. Técnicas del modelo

En la ficha del modelo (`/panel/modelos/[id]`), marcás qué técnicas del
catálogo global (sección 2.2) aplican a este modelo — por ejemplo, si este
modelo solo se puede personalizar con bordado, tildás solo "Bordado".

## 10. Publicar

El botón **Publicar** solo funciona si no falta nada. Si falta algo, el
panel te lista exactamente qué:

- **Vistas sin imagen base**: alguna vista activa (ej. Lateral) no tiene su
  foto/render cargado.
- **Componentes sin color disponible**: un componente personalizable no
  tiene ningún color habilitado con estado "Disponible", o su color por
  defecto no es uno de los habilitados/disponibles.
- **Combinaciones faltantes**: falta la imagen de componente para alguna
  combinación pieza × color × vista habilitada.

Una vez publicado, el modelo aparece en el configurador para los clientes.
Podés despublicarlo en cualquier momento sin perder la configuración
cargada.

---

## 11. Ejemplo completo: "Gorra Trucker Classic" (negro y azul)

Estructura de referencia: gorra trucker de 5 paneles, panel frontal y
malla trasera personalizables en 2 colores (negro y azul), visera y botón
fijos en negro/metal.

**Tamaño de lienzo fijo para todo el modelo: `1600 × 1600 px`, fondo
transparente, gorra centrada, mismo encuadre en todas las fotos/renders.**

### 11.1 Catálogo de colores (crear antes, una sola vez)

| Nombre ES/EN | Material | Ref. proveedor | Estado |
|---|---|---|---|
| Negro / Black | Tela | `TX-BLK-01` | Disponible |
| Azul / Blue | Tela | `TX-BLU-04` | Disponible |

### 11.2 Datos generales del modelo

| Campo | Valor |
|---|---|
| Código interno | `TRK-100` |
| Nombre ES | Gorra Trucker Classic |
| Nombre EN | Classic Trucker Cap |
| Descripción ES | Gorra trucker de 5 paneles con malla trasera transpirable, visera curva y cierre ajustable con broche trasero. Panel frontal y malla disponibles en negro y azul. |
| Descripción EN | 5-panel trucker cap with breathable mesh back, curved brim, and adjustable snapback closure. Front panel and mesh available in black and blue. |

### 11.3 Vistas

| Vista | Activa | Imagen base |
|---|---|---|
| Frontal | Sí (obligatoria) | foto/render frontal completo, 1600×1600 |
| Lateral | Sí | foto/render lateral completo, 1600×1600 |
| Trasera | No (queda desactivada para este ejemplo) | — |

### 11.4 Componentes

| Componente | Material | Personalizable | Orden de capa | Colores habilitados | Color por defecto |
|---|---|---|---|---|---|
| Panel frontal | Tela | Sí | 2 | Negro, Azul | Negro |
| Malla trasera | Tela | Sí | 1 | Negro, Azul | Negro |
| Visera | Plástico | No | — | — | — |
| Botón superior | Metal | No | — | — | — |

Visera y botón no piden imágenes de componente: quedan tal cual se ven en
la imagen base de cada vista.

### 11.5 Imágenes de componente a cargar (carga manual)

8 imágenes, todas 1600×1600 px, PNG transparente:

| Componente | Color | Vista |
|---|---|---|
| Panel frontal | Negro | Frontal |
| Panel frontal | Negro | Lateral |
| Panel frontal | Azul | Frontal |
| Panel frontal | Azul | Lateral |
| Malla trasera | Negro | Frontal |
| Malla trasera | Negro | Lateral |
| Malla trasera | Azul | Frontal |
| Malla trasera | Azul | Lateral |

### 11.6 Zona de decoración (logo bordado en el panel frontal)

| Campo | Valor |
|---|---|
| Posición | Frontal |
| Ancho máx / Alto máx | 8 cm / 5 cm |
| Caja en px (X, Y, Ancho, Alto) | ajustar mirando la vista previa; punto de partida `560, 520, 480, 300` sobre el lienzo de 1600×1600 |
| Arco | `0.15` (sigue la curva del panel) |
| Inclinación | `0` |
| Estrechamiento | `0.1` |
| Máx. caracteres de texto | `20` |

### 11.7 Tallas

| Talla | Orden |
|---|---|
| Única | 0 |

### 11.8 Técnicas habilitadas

- Bordado (previamente creada en el catálogo global de técnicas)

### 11.9 Checklist antes de publicar

- [ ] Vista Frontal con imagen base cargada
- [ ] Vista Lateral con imagen base cargada
- [ ] Panel frontal: Negro y Azul habilitados, Negro como color por defecto
- [ ] Malla trasera: Negro y Azul habilitados, Negro como color por defecto
- [ ] Las 8 imágenes de componente cargadas (tabla 11.5)
- [ ] Talla "Única" cargada
- [ ] Técnica "Bordado" tildada en la ficha del modelo

---

## 12. Prompt para generar las imágenes con IA

Recomendación práctica: generá primero las dos fotos/render completas del
producto (versión negra y versión azul), con el **mismo encuadre exacto**,
y después recortá de cada una la pieza que corresponda (panel frontal,
malla trasera) para armar los PNG transparentes que pide el sistema. Así
te asegurás de que todas las piezas queden alineadas entre sí.

### 12.1 Prompt para la imagen base — versión negra (frontal, lateral y trasera)

El ejemplo del punto 11 solo activa Frontal y Lateral, pero acá están
los tres ángulos posibles por si querés activar también Trasera —
mismo criterio de fondo, iluminación, distancia de cámara y proporción
de la gorra en las tres, para que después se puedan combinar sin
desajustes.

**Frontal**

```
Fotografía de producto de una gorra trucker de 5 paneles, vista frontal
de frente, centrada en el lienzo, cámara a la altura de la gorra, sin
inclinación de perspectiva.

Panel frontal de tela negra lisa, malla trasera negra transpirable,
visera curva de plástico rígido negro, botón superior metálico plateado,
costuras visibles color negro, broche ajustable trasero (no visible en
esta vista).

Fondo blanco puro, sólido, sin sombras marcadas ni textura. Iluminación
de estudio suave y uniforme (softbox doble), sin reflejos duros.
Fotorrealista, alta resolución, foco nítido en toda la gorra, sin
marcas de agua, sin texto ni logos, sin manos ni maniquí visible.

Encuadre cuadrado, la gorra ocupa aproximadamente el 70% del alto del
lienzo, centrada horizontal y verticalmente. Lienzo 1600x1600 px.
```

**Lateral**

```
Fotografía de producto de la misma gorra trucker de 5 paneles, vista
lateral, gorra girada 90 grados sobre su eje respecto a la vista
frontal, visera apuntando hacia la izquierda del encuadre, cámara a la
altura de la gorra, sin inclinación de perspectiva.

Panel frontal de tela negra lisa visible en el borde delantero, malla
trasera negra transpirable ocupando la mayor parte del costado, visera
curva de plástico rígido negro vista de perfil, botón superior
metálico plateado, costuras visibles color negro, broche ajustable
trasero apenas visible en el borde posterior.

Fondo blanco puro, sólido, sin sombras marcadas ni textura. Misma
iluminación de estudio suave y uniforme que la vista frontal, sin
reflejos duros. Fotorrealista, alta resolución, foco nítido en toda la
gorra, sin marcas de agua, sin texto ni logos, sin manos ni maniquí
visible.

Encuadre cuadrado, la gorra ocupa la misma proporción del lienzo y la
misma altura que en la vista frontal, centrada horizontal y
verticalmente. Lienzo 1600x1600 px.
```

**Trasera**

```
Fotografía de producto de la misma gorra trucker de 5 paneles, vista
trasera, cámara directamente detrás de la gorra, a la misma altura y
distancia que en las vistas frontal y lateral, sin inclinación de
perspectiva.

Malla trasera negra transpirable ocupando casi todo el encuadre, con
su textura de rejilla bien visible, costura central vertical donde se
unen los dos paneles traseros, broche ajustable trasero (snapback)
centrado y visible en detalle —tiras de tela negra con broches
plásticos o metálicos ajustables—, botón superior metálico plateado
asomando arriba. Panel frontal y visera no visibles o apenas
insinuados en los bordes izquierdo y derecho.

Fondo blanco puro, sólido, sin sombras marcadas ni textura. Misma
iluminación de estudio suave y uniforme que las otras dos vistas, sin
reflejos duros. Fotorrealista, alta resolución, foco nítido en toda la
gorra, sin marcas de agua, sin texto ni logos, sin manos ni maniquí
visible.

Encuadre cuadrado, la gorra ocupa la misma proporción del lienzo y la
misma altura que en las vistas frontal y lateral, centrada horizontal
y verticalmente. Lienzo 1600x1600 px.
```

### 12.2 Prompt para la variante azul (mismo encuadre, para recortar)

Mismo criterio en los tres ángulos: pedile a la herramienta que parta
de la foto negra correspondiente y solo cambie el color de tela, sin
tocar encuadre, ángulo, iluminación ni tamaño de la gorra.

**Frontal** — referencia: foto negro-frontal (12.1)

```
Misma fotografía de producto que la imagen de referencia (idéntico
ángulo, encuadre, distancia de cámara, iluminación de estudio y fondo
blanco puro), pero con el panel frontal y la malla trasera en tela
azul lisa (azul medio, no marino) en vez de negro. Visera, botón,
broche y costuras se mantienen negro/metal como en la referencia.

Fotorrealista, alta resolución, foco nítido, sin marcas de agua, sin
texto ni logos. Lienzo 1600x1600 px, misma posición y tamaño de la
gorra dentro del encuadre que la referencia.
```

**Lateral** — referencia: foto negro-lateral (12.1)

```
Misma fotografía de producto que la imagen de referencia (idéntico
ángulo lateral, encuadre, distancia de cámara, iluminación de estudio
y fondo blanco puro), pero con el panel frontal y la malla trasera en
tela azul lisa (azul medio, no marino) en vez de negro. Visera, botón,
broche y costuras se mantienen negro/metal como en la referencia.

Fotorrealista, alta resolución, foco nítido, sin marcas de agua, sin
texto ni logos. Lienzo 1600x1600 px, misma posición y tamaño de la
gorra dentro del encuadre que la referencia.
```

**Trasera** — referencia: foto negro-trasera (12.1)

```
Misma fotografía de producto que la imagen de referencia (idéntica
vista trasera, encuadre, distancia de cámara, iluminación de estudio y
fondo blanco puro), pero con la malla trasera en tela azul lisa (azul
medio, no marino) en vez de negro. Broche ajustable, botón superior y
costuras se mantienen negro/metal como en la referencia.

Fotorrealista, alta resolución, foco nítido, sin marcas de agua, sin
texto ni logos. Lienzo 1600x1600 px, misma posición y tamaño de la
gorra dentro del encuadre que la referencia.
```

### 12.3 De la foto completa a los PNG que pide el sistema

Con las 4 fotos completas (negro-frontal, negro-lateral, azul-frontal,
azul-lateral) más las 2 que usás como base (podés reusar directamente
negro-frontal y negro-lateral como imagen base de la vista):

1. Elegí **negro-frontal** y **negro-lateral** como imágenes base de las
   vistas Frontal y Lateral (sección 11.3).
2. De cada una de las 4 fotos, recortá (con un editor tipo Photoshop,
   Figma o una herramienta de remoción de fondo) **solo el panel
   frontal** y exportalo como PNG transparente del mismo tamaño de
   lienzo (1600×1600), con el resto del lienzo transparente. Repetí para
   **solo la malla trasera**. Esto te da las 8 imágenes de la tabla 11.5.
3. Subilas en "Carga manual" (`.../imagenes`) eligiendo el componente,
   color y vista que corresponda a cada recorte.

Si tu herramienta de generación soporta edición/inpainting con imagen de
referencia (en vez de generar desde cero), usá las 2 fotos negras
(12.1) como base y pedile que recolorée **solo una pieza a la vez**,
dejando el resto de la gorra intacto y visible. Así, en cada imagen
generada ves la gorra completa —visera, botón, la otra pieza— y podés
juzgar cómo queda ese color puesto en el conjunto, en vez de una pieza
suelta flotando sobre transparencia sin contexto.

### 12.4 Prompts para ver cada componente en azul sobre la gorra completa

Estos 4 prompts generan la gorra entera (no una pieza aislada) cambiando
de a un componente por vez a azul, para poder evaluar visualmente el
resultado antes de recortar. Junto con las fotos 100% negra (12.1) y
100% azul (12.2), te quedan cubiertas las 4 combinaciones posibles de
color entre las dos piezas, en las 2 vistas.

**Panel frontal en azul, malla trasera en negro — Frontal**
referencia: foto negro-frontal (12.1)

```
A partir de la imagen de referencia (gorra trucker completa, vista
frontal, versión negra), generá la misma gorra completa, en el mismo
encuadre, ángulo, iluminación y fondo blanco, cambiando ÚNICAMENTE el
color del panel frontal (la pieza de tela lisa arriba de la visera,
entre las costuras laterales) a azul medio liso. Dejá la malla
trasera, la visera, el botón superior, el broche y las costuras
exactamente iguales a la referencia (negro/metal).

No alteres el tamaño, la posición ni el ángulo de la gorra respecto a
la referencia. Fotorrealista, alta resolución, sin marcas de agua ni
texto. Lienzo 1600x1600 px, misma posición y tamaño de la gorra que en
la referencia.
```

**Panel frontal en azul, malla trasera en negro — Lateral**
referencia: foto negro-lateral (12.1)

```
Igual que el prompt anterior, pero usando como referencia la foto
lateral de la versión negra: la gorra completa igual a la referencia,
cambiando únicamente el panel frontal a azul medio liso; malla
trasera, visera, botón y costuras quedan negro/metal como en la
referencia. Mismo encuadre, ángulo, iluminación y fondo que la
referencia. Lienzo 1600x1600 px.
```

**Malla trasera en azul, panel frontal en negro — Frontal**
referencia: foto negro-frontal (12.1)

```
A partir de la imagen de referencia (gorra trucker completa, vista
frontal, versión negra), generá la misma gorra completa, en el mismo
encuadre, ángulo, iluminación y fondo blanco, cambiando ÚNICAMENTE el
color de la malla trasera transpirable (la porción de malla visible
por encima y a los costados del panel frontal) a azul medio. Dejá el
panel frontal, la visera, el botón superior, el broche y las costuras
exactamente iguales a la referencia (negro/metal).

No alteres el tamaño, la posición ni el ángulo de la gorra respecto a
la referencia. Fotorrealista, alta resolución, sin marcas de agua ni
texto. Lienzo 1600x1600 px, misma posición y tamaño de la gorra que en
la referencia.
```

**Malla trasera en azul, panel frontal en negro — Lateral**
referencia: foto negro-lateral (12.1)

```
Igual que el prompt anterior, pero usando como referencia la foto
lateral de la versión negra: la gorra completa igual a la referencia,
cambiando únicamente la malla trasera a azul medio; panel frontal,
visera, botón y costuras quedan negro/metal como en la referencia.
Mismo encuadre, ángulo, iluminación y fondo que la referencia. Lienzo
1600x1600 px.
```

Con estas 4 imágenes más las 4 de 12.1/12.2 (negro-frontal,
negro-lateral, azul-frontal, azul-lateral) tenés, para cada vista, las
4 combinaciones de color posibles entre panel y malla — podés mirarlas
una al lado de la otra y decidir con contexto completo si el azul
funciona mejor en el panel, en la malla, o en ambos.

Para pasar esto a lo que pide el sistema (una imagen por pieza, no la
gorra completa), seguí igual el recorte de la sección 12.3: de la
imagen donde el panel está en azul, recortá solo el panel frontal; de
la imagen donde la malla está en azul, recortá solo la malla trasera.
El resultado de generar con contexto completo es el mismo recorte de
siempre, pero revisado con la gorra entera a la vista antes de cortar,
no una pieza suelta sin referencia visual.

### 12.5 Qué prompt le corresponde a cada fila de la tabla 11.5

Para no tener que estar calculando de dónde sale cada recorte, acá está
la relación directa entre las 8 imágenes que pide la tabla 11.5 y el
prompt que las genera:

| Componente | Color | Vista | Prompt de origen | Qué recortar de esa foto |
|---|---|---|---|---|
| Panel frontal | Negro | Frontal | 12.1 — Frontal | el panel frontal |
| Panel frontal | Negro | Lateral | 12.1 — Lateral | el panel frontal |
| Panel frontal | Azul | Frontal | 12.2 — Frontal | el panel frontal |
| Panel frontal | Azul | Lateral | 12.2 — Lateral | el panel frontal |
| Malla trasera | Negro | Frontal | 12.1 — Frontal | la malla trasera |
| Malla trasera | Negro | Lateral | 12.1 — Lateral | la malla trasera |
| Malla trasera | Azul | Frontal | 12.2 — Frontal | la malla trasera |
| Malla trasera | Azul | Lateral | 12.2 — Lateral | la malla trasera |

Con solo **4 fotos** (12.1 Frontal, 12.1 Lateral, 12.2 Frontal, 12.2
Lateral) te alcanza para las 8 imágenes de la tabla, porque cada foto
completa sirve para recortar dos piezas a la vez (panel y malla). Los
4 prompts "mixtos" de 12.4 son opcionales: no hacen falta para
completar la tabla 11.5, sirven solo si querés revisar el efecto de
cada color por separado antes de decidir cuál dejar en cada pieza.

Si en cambio activaste también la vista **Trasera** (sección 12.1/12.2,
prompts "Trasera"), sumás estas dos filas más, recortando la malla
trasera de cada una (el panel frontal no se ve desde atrás, así que
esa vista no aplica a esa pieza):

| Componente | Color | Vista | Prompt de origen | Qué recortar de esa foto |
|---|---|---|---|---|
| Malla trasera | Negro | Trasera | 12.1 — Trasera | la malla trasera |
| Malla trasera | Azul | Trasera | 12.2 — Trasera | la malla trasera |
