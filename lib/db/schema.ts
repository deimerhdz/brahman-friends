import {
  pgTable,
  uuid,
  text,
  boolean,
  integer,
  numeric,
  timestamp,
  jsonb,
  primaryKey,
  uniqueIndex,
  index,
  pgEnum,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";

// Catálogo fijo de vistas (Assumption 5). Ver data-model.md#model_view.
export const viewEnum = pgEnum("view", ["front", "side", "back"]);

// Vistas de la solicitud congelada: incluye el lateral reflejado (FR-053).
export const requestViewEnum = pgEnum("request_view", [
  "front",
  "side",
  "side_mirrored",
  "back",
]);

export const modelStatusEnum = pgEnum("model_status", ["draft", "published"]);

// Tipo de modelo (009-modelos-producto-fijo): "configurable" se cotiza y se
// personaliza (comportamiento histórico); "fixed_product" es una gorra ya
// definida, con precio y fotos fijas, sin colores ni personalización.
export const modelTypeEnum = pgEnum("model_type", [
  "configurable",
  "fixed_product",
]);

export const zonePositionEnum = pgEnum("zone_position", [
  "front",
  "left",
  "right",
  "back",
]);

export const requestStatusEnum = pgEnum("request_status", [
  "new",
  "in_review",
  "quoted",
  "closed",
  "rejected",
]);

export const notificationStatusEnum = pgEnum("notification_status", [
  "pending",
  "sent",
  "failed",
]);

// Idiomas soportados (mismo conjunto que lib/i18n/t.ts#locales), usado por
// las tablas de traducción independientes de cada entidad (FR-011).
export const localeEnum = pgEnum("locale", ["es", "en"]);

// Lista fija de plataformas de redes sociales (010-panel-ajustes-generales,
// Clarificación 2026-09-13, FR-012): no se acepta un nombre libre.
export const socialPlatformEnum = pgEnum("social_platform", [
  "instagram",
  "facebook",
  "tiktok",
  "whatsapp",
  "x",
  "youtube",
  "linkedin",
]);

// admin_user — FR-057, FR-062
export const adminUser = pgTable("admin_user", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// customer — Cuenta de cliente, separada de admin_user (FR-002, FR-008, FR-009, FR-010c)
export const customer = pgTable("customer", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  active: boolean("active").notNull().default(true),
  failedLoginAttempts: integer("failed_login_attempts").notNull().default(0),
  lockedUntil: timestamp("locked_until", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// color — FR-016 a FR-023. Propio de un modelo, no compartido
// (007-colores-por-modelo FR-002, FR-010): borrar un modelo borra sus
// colores. `model_id` se volvió NOT NULL después de correr el backfill de
// datos existentes (scripts/migrar-colores-por-modelo.ts) sobre la columna
// nullable con la que se agregó primero (drizzle/0004_fresh_violations.sql).
// Sin `supplier_ref`, `material`, `status` ni `sample_image_url`: un color
// de un modelo es solo su nombre (007-colores-por-modelo, enmienda
// 2026-09-06). Sin imagen de muestra, el texto personalizado con color ya no
// tiene una fuente para su patrón de relleno (lib/design/compose.ts) y cae
// siempre al color de reserva fijo — decisión tomada con el usuario.
export const color = pgTable("color", {
  id: uuid("id").primaryKey().defaultRandom(),
  modelId: uuid("model_id")
    .notNull()
    .references(() => capModel.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// color_translation — nombre del color por idioma (FR-011)
export const colorTranslation = pgTable(
  "color_translation",
  {
    colorId: uuid("color_id")
      .notNull()
      .references(() => color.id, { onDelete: "cascade" }),
    locale: localeEnum("locale").notNull(),
    name: text("name").notNull(),
  },
  (t) => [primaryKey({ columns: [t.colorId, t.locale] })],
);

// cap_model — FR-005, FR-011, FR-013
export const capModel = pgTable("cap_model", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: text("code").notNull().unique(),
  status: modelStatusEnum("status").notNull().default("draft"),
  // Tipo del modelo (009-modelos-producto-fijo): se fija al crear y no se
  // vuelve a exponer para editar. Default 'configurable' cubre los modelos
  // creados antes de esta funcionalidad sin backfill manual.
  type: modelTypeEnum("type").notNull().default("configurable"),
  imageWidth: integer("image_width"),
  imageHeight: integer("image_height"),
  // Cantidad mínima de pedido (006-configurador-stepper FR-010, FR-012).
  // NULL = no configurado todavía; el código lo trata como 1.
  moq: integer("moq"),
  // Precio base del modelo en USD. NULL = no configurado todavía.
  price: numeric("price", { precision: 10, scale: 2 }),
  // Variante que se carga por defecto en tienda/configurador (distinto del
  // color por defecto de cada componente, que es solo para el renderizado).
  defaultColorId: uuid("default_color_id").references(
    (): AnyPgColumn => color.id,
    { onDelete: "set null" },
  ),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// cap_model_translation — nombre y descripción del modelo por idioma (FR-011)
export const capModelTranslation = pgTable(
  "cap_model_translation",
  {
    modelId: uuid("model_id")
      .notNull()
      .references(() => capModel.id, { onDelete: "cascade" }),
    locale: localeEnum("locale").notNull(),
    name: text("name").notNull(),
    description: text("description").notNull().default(""),
  },
  (t) => [primaryKey({ columns: [t.modelId, t.locale] })],
);

// model_view — FR-006, FR-008
export const modelView = pgTable(
  "model_view",
  {
    modelId: uuid("model_id")
      .notNull()
      .references(() => capModel.id, { onDelete: "cascade" }),
    view: viewEnum("view").notNull(),
    baseImageUrl: text("base_image_url"),
    // Si se muestra en catálogo/tienda. Desactivar una vista NO borra su
    // imagen ni el archivo en R2: solo la oculta, para que el admin pueda
    // reactivarla sin volver a subir la foto.
    active: boolean("active").notNull().default(true),
  },
  (t) => [primaryKey({ columns: [t.modelId, t.view] })],
);

// color_image — foto de la gorra completa en un color, por vista (reemplaza
// al viejo esquema por "partes"/componentes: el negocio no personaliza por
// pieza, solo por color de la gorra entera).
export const colorImage = pgTable(
  "color_image",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    modelId: uuid("model_id")
      .notNull()
      .references(() => capModel.id, { onDelete: "cascade" }),
    colorId: uuid("color_id")
      .notNull()
      .references(() => color.id, { onDelete: "cascade" }),
    view: viewEnum("view").notNull(),
    imageUrl: text("image_url").notNull(),
    width: integer("width").notNull(),
    height: integer("height").notNull(),
  },
  (t) => [uniqueIndex("color_image_unique").on(t.colorId, t.view)],
);

// decoration_zone — FR-034, FR-035
export const decorationZone = pgTable(
  "decoration_zone",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    modelId: uuid("model_id")
      .notNull()
      .references(() => capModel.id, { onDelete: "cascade" }),
    position: zonePositionEnum("position").notNull(),
    maxWidthCm: numeric("max_width_cm", { precision: 6, scale: 2 }).notNull(),
    maxHeightCm: numeric("max_height_cm", {
      precision: 6,
      scale: 2,
    }).notNull(),
    boxX: integer("box_x").notNull(),
    boxY: integer("box_y").notNull(),
    boxW: integer("box_w").notNull(),
    boxH: integer("box_h").notNull(),
    arc: numeric("arc", { precision: 6, scale: 3 }).notNull().default("0"),
    tilt: numeric("tilt", { precision: 6, scale: 3 }).notNull().default("0"),
    taper: numeric("taper", { precision: 6, scale: 3 })
      .notNull()
      .default("0"),
    maxTextChars: integer("max_text_chars").notNull().default(20),
  },
  (t) => [
    uniqueIndex("decoration_zone_model_position").on(t.modelId, t.position),
  ],
);

// technique / model_technique — FR-036, FR-047
export const technique = pgTable("technique", {
  id: uuid("id").primaryKey().defaultRandom(),
  active: boolean("active").notNull().default(true),
});

// technique_translation — nombre de la técnica por idioma (FR-011)
export const techniqueTranslation = pgTable(
  "technique_translation",
  {
    techniqueId: uuid("technique_id")
      .notNull()
      .references(() => technique.id, { onDelete: "cascade" }),
    locale: localeEnum("locale").notNull(),
    name: text("name").notNull(),
  },
  (t) => [primaryKey({ columns: [t.techniqueId, t.locale] })],
);

export const modelTechnique = pgTable(
  "model_technique",
  {
    modelId: uuid("model_id")
      .notNull()
      .references(() => capModel.id, { onDelete: "cascade" }),
    techniqueId: uuid("technique_id")
      .notNull()
      .references(() => technique.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.modelId, t.techniqueId] })],
);

// logo_asset — FR-037, FR-038, FR-039
export const logoAsset = pgTable(
  "logo_asset",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    url: text("url").notNull(),
    mime: text("mime").notNull(),
    bytes: integer("bytes").notNull(),
    originalFilename: text("original_filename").notNull(),
    width: integer("width"),
    height: integer("height"),
    requestId: uuid("request_id"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [index("logo_asset_request_created").on(t.requestId, t.createdAt)],
);

// request — FR-048 a FR-056, FR-062 a FR-070
export const request = pgTable(
  "request",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    code: text("code").notNull().unique(),
    submissionId: uuid("submission_id").notNull().unique(),
    modelId: uuid("model_id")
      .notNull()
      .references(() => capModel.id, { onDelete: "restrict" }),
    designSnapshot: jsonb("design_snapshot").notNull(),
    quantity: integer("quantity").notNull(),
    comments: text("comments"),
    contactName: text("contact_name"),
    contactEmail: text("contact_email"),
    contactPhone: text("contact_phone"),
    privacyAcceptedAt: timestamp("privacy_accepted_at", {
      withTimezone: true,
    }).notNull(),
    status: requestStatusEnum("status").notNull().default("new"),
    statusChangedAt: timestamp("status_changed_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    notificationStatus: notificationStatusEnum("notification_status")
      .notNull()
      .default("pending"),
    notificationAttempts: integer("notification_attempts")
      .notNull()
      .default(0),
    anonymizedAt: timestamp("anonymized_at", { withTimezone: true }),
    anonymizedBy: uuid("anonymized_by").references(() => adminUser.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("request_status_created").on(t.status, t.createdAt),
    index("request_status_changed").on(t.status, t.statusChangedAt),
    index("request_notification_status").on(t.notificationStatus),
  ],
);

// request_image — FR-053
export const requestImage = pgTable(
  "request_image",
  {
    requestId: uuid("request_id")
      .notNull()
      .references(() => request.id, { onDelete: "cascade" }),
    view: requestViewEnum("view").notNull(),
    imageUrl: text("image_url").notNull(),
  },
  (t) => [primaryKey({ columns: [t.requestId, t.view] })],
);

// request_status_history — FR-062, RN21
export const requestStatusHistory = pgTable("request_status_history", {
  id: uuid("id").primaryKey().defaultRandom(),
  requestId: uuid("request_id")
    .notNull()
    .references(() => request.id, { onDelete: "cascade" }),
  fromStatus: text("from_status"),
  toStatus: text("to_status").notNull(),
  adminUserId: uuid("admin_user_id")
    .notNull()
    .references(() => adminUser.id),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// site_settings — 010-panel-ajustes-generales, FR-002 a FR-011. Fila única:
// el código siempre lee/escribe por SITE_SETTINGS_ID, nunca inserta una
// segunda fila (research.md #1). La migración siembra esa fila.
export const SITE_SETTINGS_ID = "00000000-0000-0000-0000-000000000001";

export const siteSettings = pgTable("site_settings", {
  id: uuid("id").primaryKey(),
  siteNameEs: text("site_name_es").notNull(),
  siteNameEn: text("site_name_en").notNull(),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  logoUrl: text("logo_url"),
  bannerUrl: text("banner_url"),
  seoTitleEs: text("seo_title_es"),
  seoTitleEn: text("seo_title_en"),
  seoDescriptionEs: text("seo_description_es"),
  seoDescriptionEn: text("seo_description_en"),
  seoImageUrl: text("seo_image_url"),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// site_social_link — 010-panel-ajustes-generales, FR-012 a FR-014. Sin
// relación explícita a site_settings: al haber una sola fila de
// configuración, cualquier fila de esta tabla le pertenece implícitamente
// (data-model.md).
export const siteSocialLink = pgTable("site_social_link", {
  id: uuid("id").primaryKey().defaultRandom(),
  platform: socialPlatformEnum("platform").notNull(),
  url: text("url").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
