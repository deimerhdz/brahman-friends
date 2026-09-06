import { eq, and } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { db } from "@/lib/db";
import {
  capModel,
  capModelTranslation,
  color,
  colorTranslation,
  component,
  componentTranslation,
  technique,
  techniqueTranslation,
  modelView,
} from "@/lib/db/schema";

/**
 * Une cada entidad con su tabla de traducción (un alias por idioma) y
 * devuelve las mismas columnas `nameEs`/`nameEn` (y `descriptionEs`/
 * `descriptionEn` en modelo) que existían como columnas antes de la
 * migración (FR-019, research.md#6). Quien ya consumía `db.select().from(x)`
 * solo cambia esa llamada por la de aquí; el resto del archivo sigue igual.
 */

const capModelEs = alias(capModelTranslation, "cap_model_translation_es");
const capModelEn = alias(capModelTranslation, "cap_model_translation_en");

export function capModelConNombre() {
  return db
    .select({
      id: capModel.id,
      code: capModel.code,
      status: capModel.status,
      imageWidth: capModel.imageWidth,
      imageHeight: capModel.imageHeight,
      moq: capModel.moq,
      publishedAt: capModel.publishedAt,
      createdAt: capModel.createdAt,
      nameEs: capModelEs.name,
      nameEn: capModelEn.name,
      descriptionEs: capModelEs.description,
      descriptionEn: capModelEn.description,
    })
    .from(capModel)
    .innerJoin(
      capModelEs,
      and(eq(capModelEs.modelId, capModel.id), eq(capModelEs.locale, "es")),
    )
    .innerJoin(
      capModelEn,
      and(eq(capModelEn.modelId, capModel.id), eq(capModelEn.locale, "en")),
    );
}

/**
 * Modelos publicados con su nombre/descripción por idioma y la URL de la
 * vista "front" para usar como portada de tarjeta en la página de inicio
 * (data-model.md#TarjetaModelo). `frontImageUrl` queda en `null` si el
 * modelo todavía no tiene esa vista cargada (FR-009/FR-010).
 */
export function capModelConNombreYPortada() {
  return db
    .select({
      id: capModel.id,
      publishedAt: capModel.publishedAt,
      nameEs: capModelEs.name,
      nameEn: capModelEn.name,
      descriptionEs: capModelEs.description,
      descriptionEn: capModelEn.description,
      frontImageUrl: modelView.baseImageUrl,
    })
    .from(capModel)
    .innerJoin(
      capModelEs,
      and(eq(capModelEs.modelId, capModel.id), eq(capModelEs.locale, "es")),
    )
    .innerJoin(
      capModelEn,
      and(eq(capModelEn.modelId, capModel.id), eq(capModelEn.locale, "en")),
    )
    .leftJoin(
      modelView,
      and(eq(modelView.modelId, capModel.id), eq(modelView.view, "front")),
    );
}

const colorEs = alias(colorTranslation, "color_translation_es");
const colorEn = alias(colorTranslation, "color_translation_en");

export function colorConNombre() {
  return db
    .select({
      id: color.id,
      supplierRef: color.supplierRef,
      material: color.material,
      sampleImageUrl: color.sampleImageUrl,
      status: color.status,
      createdAt: color.createdAt,
      nameEs: colorEs.name,
      nameEn: colorEn.name,
    })
    .from(color)
    .innerJoin(
      colorEs,
      and(eq(colorEs.colorId, color.id), eq(colorEs.locale, "es")),
    )
    .innerJoin(
      colorEn,
      and(eq(colorEn.colorId, color.id), eq(colorEn.locale, "en")),
    );
}

const componentEs = alias(componentTranslation, "component_translation_es");
const componentEn = alias(componentTranslation, "component_translation_en");

export function componentConNombre() {
  return db
    .select({
      id: component.id,
      modelId: component.modelId,
      material: component.material,
      customizable: component.customizable,
      layerOrder: component.layerOrder,
      defaultColorId: component.defaultColorId,
      nameEs: componentEs.name,
      nameEn: componentEn.name,
    })
    .from(component)
    .innerJoin(
      componentEs,
      and(eq(componentEs.componentId, component.id), eq(componentEs.locale, "es")),
    )
    .innerJoin(
      componentEn,
      and(eq(componentEn.componentId, component.id), eq(componentEn.locale, "en")),
    );
}

const techniqueEs = alias(techniqueTranslation, "technique_translation_es");
const techniqueEn = alias(techniqueTranslation, "technique_translation_en");

export function techniqueConNombre() {
  return db
    .select({
      id: technique.id,
      active: technique.active,
      nameEs: techniqueEs.name,
      nameEn: techniqueEn.name,
    })
    .from(technique)
    .innerJoin(
      techniqueEs,
      and(eq(techniqueEs.techniqueId, technique.id), eq(techniqueEs.locale, "es")),
    )
    .innerJoin(
      techniqueEn,
      and(eq(techniqueEn.techniqueId, technique.id), eq(techniqueEn.locale, "en")),
    );
}
