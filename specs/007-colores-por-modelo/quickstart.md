# Guía de verificación

**Feature**: Colores propios por modelo | **Fecha**: 2026-09-06

La aplicación ya está funcionando (mismo `npm run dev`, misma base de datos, mismo almacenamiento
R2). Esta guía cubre solo lo nuevo: colores propios por modelo. Escrita para que cualquier persona
del equipo la siga sin leer código (Principio IV).

## Antes de empezar

Para verificar esto en un ambiente con datos previos a la migración (por ejemplo, una copia de la
base de datos de producción), corre en este orden:

```bash
npm run db:migrate                              # aplica color.model_id (nullable + FK)
npx tsx scripts/migrar-colores-por-modelo.ts     # backfill: reparte/duplica los colores existentes
npm run db:generate && npm run db:migrate        # aplica color.model_id NOT NULL
npm run dev
```

Si el ambiente no tiene datos previos (base nueva), el script no tiene nada que migrar y no hace
falta correrlo — se puede aplicar directamente el esquema final.

Necesitas: sesión de administrador (ya existente) y al menos dos modelos publicados con colores
habilitados, para poder comprobar el aislamiento entre ellos.

---

## Parte 1 — Migración segura de colores existentes (US2, FR-006, SC-002)

Antes de correr el script, anota cómo se ve hoy un modelo publicado que **comparte** un color con
otro modelo (mismo nombre de color en ambos, por ejemplo "Negro"): abre su configurador público
(`/es/configurador/<modelId>`) y guarda una captura o anota los colores visibles por componente.

1. Corre el script de migración (ver arriba).
2. Abre el panel (`/es/panel`) → **Modelos** → el mismo modelo de antes → **Colores**.
   - **Verifica FR-006**: el color "Negro" (y todos los que ya tenía) siguen ahí, con el mismo
     nombre, material, muestra y estado que antes.
3. Abre de nuevo su configurador público.
   - **Verifica SC-002, US2-Escenario2**: se ve exactamente igual que la captura del paso previo —
     mismos colores, mismas imágenes, mismo color por defecto.
4. Abre el panel del **otro** modelo que también tenía "Negro" → **Colores**.
   - **Verifica US2-Escenario1**: también tiene su propio "Negro", con la misma apariencia — es una
     copia independiente, no el mismo registro que el primer modelo.
5. Si hay una solicitud de cliente enviada antes de la migración, ábrela en
   **Solicitudes** → el detalle → o descarga su PDF.
   - **Verifica FR-011, US2-Escenario3**: el color que el cliente eligió se ve igual que antes de
     migrar (mismo nombre, misma muestra).

---

## Parte 2 — Crear un color propio de un modelo (US1, FR-001, FR-002, FR-003)

1. En el panel, entra a **Modelos** → un modelo cualquiera → pestaña **Colores**.
2. Pulsa **Nuevo color**. Completa nombre (español e inglés), material, referencia de proveedor,
   sube una imagen de muestra, guarda.
   - **Verifica FR-003, US1-Escenario1**: el color queda en la lista de este modelo.
3. Entra a la pestaña **Componentes** de este mismo modelo y confirma que el color nuevo aparece
   como opción para los componentes cuyo material coincide.
   - **Verifica FR-004**: habilitarlo en una vista y subir su imagen funciona exactamente igual que
     antes de este cambio.
4. Sal a la lista de **Modelos** y entra a un modelo **distinto** → pestaña **Colores**.
   - **Verifica US1-Escenario2**: el color que acabas de crear en el primer modelo **no aparece**
     aquí.
5. Ve al menú lateral del panel.
   - **Verifica FR-005, SC-001**: ya no existe un enlace de nivel superior "Colores"; la única forma
     de llegar a la gestión de colores es entrando primero a un modelo.

---

## Parte 3 — Edición aislada por modelo (US3, FR-007)

1. Con los dos modelos que comparten un color equivalente (de la Parte 1), entra al primero →
   **Colores** → edita ese color (cambia el nombre o el estado a "agotado"). Guarda.
2. Entra al segundo modelo → **Colores**.
   - **Verifica SC-003, US3-Escenario1**: el color equivalente del segundo modelo sigue con su
     nombre y estado originales, sin ningún cambio.
3. En el primer modelo, quita todas las vistas habilitadas de un color propio (pestaña
   **Componentes**) y bórralo desde **Colores**.
   - **Verifica US3-Escenario2**: solo desaparece de este modelo; el segundo modelo no se ve
     afectado.

---

## Comprobaciones automáticas

```bash
npm test          # publicacion.test.ts y el resto de pruebas puras, sin cambios de comportamiento
npm run typecheck
npm run lint
```

Este feature no agrega pruebas automáticas nuevas: la migración de datos y el aislamiento por modelo
se verifican recorriendo la app (Parte 1 a 3), no hay arnés de pruebas de integración con base de
datos en este proyecto.
