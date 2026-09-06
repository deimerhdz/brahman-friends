# Guía de verificación

**Feature**: Configurador en pasos | **Fecha**: 2026-09-02

Extiende [`001-configurador-gorras/quickstart.md`](../001-configurador-gorras/quickstart.md): la
aplicación ya está funcionando (mismo `npm run dev`, misma base de datos, mismo almacenamiento R2).
Esta guía cubre solo lo nuevo: el MOQ por modelo y el configurador en pasos. Escrita para que
cualquier persona del equipo la siga sin leer código (Principio IV).

> **Nota (Enmienda 2026-09-06 (3) de spec.md)**: esta guía tenía también una parte sobre crear
> telas y elegirlas en el configurador. Se eliminó junto con el catálogo de telas y el paso de tela.

## Antes de empezar

```bash
npm run db:migrate    # aplica la migración de cap_model.moq
npm run dev
```

Necesitas: sesión de administrador (ya existente) y al menos un modelo publicado (ya existente de
`001-configurador-gorras`).

---

## Parte 1 — Administrador: definir el MOQ del modelo

1. Entra al panel (`/es/panel`) y abre **Modelos**.
2. Entra a un modelo publicado y pulsa **Editar**. Define una cantidad mínima de pedido, por
   ejemplo `144`. Guarda.
   - **Verifica FR-010, US2-Escenario1**: el modelo queda con ese MOQ.

## Parte 2 — Cliente: recorrer el configurador en pasos

Abre el configurador del modelo que acabas de preparar (`/es/configurador/<modelId>`).

1. Al cargar, confirma que solo el paso **1 (Colores)** está activo; los pasos 2 y 3 se ven
   atenuados y sin marca de completado.
   - **Verifica SC-001, US1-Escenario1**.
2. Confirma que ves **una paleta de swatches por cada componente personalizable**, no una sola
   paleta global. Elige un color en cada una.
   - **Verifica la clarificación de "Personalizar colores" en spec.md**.
3. Pulsa **Siguiente**. El paso 1 queda marcado con un check; el paso 2 (Logo) pasa a activo.
   - **Verifica US1-Escenario2**.
4. En el paso 2, usa uno de los botones de posición (Front Center, Left Side, Right Side, Back)
   para saltar a una zona, y luego arrastra/redimensiona el logo dentro de ella con el mismo
   comportamiento de siempre.
   - **Verifica la clarificación de "Colocación de logo"**.
5. Sin colocar ningún logo ni texto, pulsa **Siguiente** de todas formas.
   - **Verifica FR-018, edge case "resumen sin decoración"**: te deja avanzar; el resumen muestra
     "sin decoración".
6. En el paso 3 (Resumen), confirma:
   - Se ve el color de cada componente y el logo/texto (o "sin decoración").
   - **No aparece ningún precio** (FR-020, SC-007).
   - El control de cantidad no deja bajar del MOQ que definiste en la Parte 1 (FR-011, SC-006).
7. Haz clic en el indicador del paso **1** para saltar directo ahí.
   - **Verifica US1-Escenario3**: vuelve al paso 1 sin perder los colores elegidos.
   - Vuelve al paso 3 con **Siguiente** repetido.
8. Sube la cantidad por encima del MOQ (por ejemplo, a `288`) y pulsa **Solicitar cotización**.
   - **Verifica FR-021, SC-008**: llegas a `/solicitud` con `288` ya cargado en el campo de
     cantidad, sin tener que volver a escribirlo.
9. Completa la distribución por tallas, los datos de contacto y envía.
   - **Verifica US3, y que el flujo de `001-configurador-gorras` (FR-048 a FR-056) sigue intacto**:
     aparece el código de la solicitud.

## Parte 3 — Casos límite

1. Con el configurador a mitad de recorrido (por ejemplo en el paso 2), recarga el navegador.
   - **Verifica edge case "recarga a mitad del stepper"**: el paso, los colores y el logo se
     restauran.
2. Como administrador, despublica el modelo mientras un cliente lo está personalizando, y llega al
   paso de resumen de ese cliente.
   - **Verifica FR-022**: el sistema informa que el modelo ya no está disponible y no deja continuar
     a la solicitud.

## Comprobaciones automáticas

```bash
npm test          # incluye puedeAvanzarPaso, moqEfectivo y la paridad es/en ya existente
npm run typecheck
npm run lint
```

Si `npm test` falla en la prueba de paridad de traducciones, revisa que toda clave nueva de
`configurador.*` exista en `messages/es.json` **y** `messages/en.json` (Principio II).
