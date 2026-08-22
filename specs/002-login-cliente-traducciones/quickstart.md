# Guía de verificación

**Feature**: Login de cliente y traducciones por tabla independiente | **Fecha**: 2026-08-22

Esta funcionalidad se agrega sobre la aplicación de
[001-configurador-gorras](../001-configurador-gorras/quickstart.md), que ya está corriendo. Esta
guía no repite cómo poner el proyecto en marcha (variables de entorno, `npm install`, publicar):
para eso, ver la [Parte 1 de esa guía](../001-configurador-gorras/quickstart.md#parte-1--poner-la-aplicación-a-funcionar).
Aquí solo se agrega el paso nuevo de la migración y los recorridos que verifican las dos historias
de esta funcionalidad, escritos para que los haga cualquier persona del equipo sin leer código
(Principio IV).

---

## Paso nuevo: aplicar la migración

```bash
npm run db:migrate
```

Crea la cuenta de cliente y las cuatro tablas de traducción, copia el contenido de las columnas
`name_es`/`name_en` (y `description_es`/`description_en` en modelo) a las tablas nuevas, y elimina
esas columnas (ver [data-model.md](./data-model.md#migración-fr-018-fr-019)).

**Comprobación antes de seguir**: abrir la portada del sitio en ambos idiomas y confirmar que los
modelos publicados siguen mostrando el mismo nombre y descripción que mostraban antes de migrar.
Si algo cambió o quedó vacío, no seguir: es la señal de que la migración perdió contenido
(FR-018).

---

## Recorridos de verificación

### A. Un visitante nuevo se registra desde la página de inicio *(historia 1)*

1. Abrir la portada del sitio, sin sesión iniciada.
2. Confirmar que el encabezado muestra un control para "Ingresar" o "Registrarme", visible sin
   tener que buscarlo. → FR-001
3. Ir al registro, completar nombre, correo y una contraseña, enviar.
4. El sitio debe quedar identificado de inmediato: el encabezado ahora muestra el nombre en vez
   del control de ingreso. → FR-002, Acceptance Scenario 1, SC-001 (cronometrar: debe tomar menos
   de 2 minutos de principio a fin)
5. Repetir el registro con el mismo correo. Debe rechazarse con un mensaje claro, sin crear una
   segunda cuenta. → FR-003, Acceptance Scenario 4

### B. Un cliente ya registrado inicia y cierra sesión *(historia 1)*

1. Cerrar la sesión de la persona registrada en el recorrido A (o abrir una ventana nueva).
2. Desde la portada, ingresar con el correo y la contraseña correctos. Debe quedar identificado en
   menos de 30 segundos. → FR-004, SC-002
3. Ingresar con la contraseña equivocada. El sitio debe mostrar un único mensaje genérico, sin
   decir si el correo existe. → FR-005, Acceptance Scenario 3
4. Repetir el paso 3 varias veces seguidas (5 o más). El sitio debe seguir respondiendo con el
   mismo mensaje genérico, sin bloquear la cuenta para siempre — solo pedir esperar un poco antes
   de dejar intentar de nuevo. → FR-010c
5. Con la sesión activa, navegar a otra página del sitio (por ejemplo el configurador) y confirmar
   que el encabezado sigue mostrando la sesión identificada. → FR-006
6. Cerrar sesión desde cualquier página. El encabezado vuelve a mostrar "Ingresar". → FR-007

### C. La cuenta de cliente no toca el panel ni la solicitud *(historia 1, límite de alcance)*

1. Con sesión de cliente activa, intentar entrar a `/panel`. Debe pedir el login del panel, como
   si no hubiera ninguna sesión — la sesión de cliente no debe dar acceso. → FR-009
2. Enviar una solicitud de cotización normalmente (recorrido D de
   [001-configurador-gorras](../001-configurador-gorras/quickstart.md)) estando identificado como
   cliente. El formulario de contacto debe comportarse exactamente igual que sin sesión (nada se
   precarga, nada cambia). → FR-010b

### D. Un administrador edita un color sin campos duplicados *(historia 2)*

1. Entrar al panel y abrir "Colores → Nuevo".
2. Confirmar que el nombre aparece **una sola vez** en el formulario, con un switch ES/EN al lado.
   → FR-013, FR-014, SC-003
3. Con el switch en "ES", escribir el nombre en español. Cambiar el switch a "EN": el campo debe
   quedar vacío (o mostrar lo que ya hubiera), y el texto en español no debe perderse. Escribir el
   nombre en inglés. → FR-015, Acceptance Scenario 2
4. Guardar. Abrir de nuevo el mismo color en modo edición: ambos idiomas deben estar ahí, cada uno
   detrás de su posición del switch. → FR-016, SC-004
5. Confirmar que los campos que no se tradujeron (referencia de proveedor, material,
   disponibilidad) siguen apareciendo una sola vez, sin switch y sin cambios de comportamiento.
   → FR-012
6. Cambiar el idioma del sitio público a inglés y confirmar que ese color muestra el nombre en
   inglés que se acaba de escribir (donde corresponda, por ejemplo en el configurador). → FR-019

### E. Lo mismo en los otros tres formularios *(historia 2)*

Repetir el paso 2–4 del recorrido D en:

1. "Modelos → Nuevo modelo" (nombre y descripción). → SC-003
2. "Modelos → (elegir uno) → Componentes → Nuevo componente" (nombre). → SC-003
3. "Técnicas → Nueva técnica" (nombre). → SC-003

No repetir en pantallas que no existen hoy: modelo, componente y técnica no tienen pantalla para
renombrar después de creados (solo alta) — eso no cambia con esta funcionalidad.

### F. Intentar guardar sin un idioma

1. En cualquiera de los cuatro formularios, escribir el nombre solo en un idioma (dejar el otro
   vacío usando el switch) e intentar guardar.
2. Debe rechazarse con un mensaje de error, sin crear el registro a medias. → FR-011 a FR-016,
   SC-006

---

## Cobertura

| Criterio | Recorrido |
|----------|-----------|
| SC-001 | A |
| SC-002 | B |
| SC-003 | D, E |
| SC-004 | D |
| SC-005 | Paso "antes de seguir" de la migración, arriba |
| SC-006 | F |

Los recorridos A–C cubren la historia 1 completa (incluido el límite explícito de que no toca el
panel ni la solicitud). Los recorridos D–F cubren la historia 2 en los cuatro formularios
existentes que tenían campos duplicados.
