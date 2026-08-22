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

export const colorStatusEnum = pgEnum("color_status", [
  "available",
  "out_of_stock",
  "discontinued",
]);

export const modelStatusEnum = pgEnum("model_status", ["draft", "published"]);

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

// color — FR-016 a FR-023
export const color = pgTable("color", {
  id: uuid("id").primaryKey().defaultRandom(),
  nameEs: text("name_es").notNull(),
  nameEn: text("name_en").notNull(),
  supplierRef: text("supplier_ref").notNull(),
  material: text("material").notNull(),
  sampleImageUrl: text("sample_image_url").notNull(),
  status: colorStatusEnum("status").notNull().default("available"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// cap_model — FR-005, FR-011, FR-013
export const capModel = pgTable("cap_model", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: text("code").notNull().unique(),
  nameEs: text("name_es").notNull(),
  nameEn: text("name_en").notNull(),
  descriptionEs: text("description_es").notNull().default(""),
  descriptionEn: text("description_en").notNull().default(""),
  status: modelStatusEnum("status").notNull().default("draft"),
  imageWidth: integer("image_width"),
  imageHeight: integer("image_height"),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// model_view — FR-006, FR-008
export const modelView = pgTable(
  "model_view",
  {
    modelId: uuid("model_id")
      .notNull()
      .references(() => capModel.id, { onDelete: "cascade" }),
    view: viewEnum("view").notNull(),
    baseImageUrl: text("base_image_url"),
  },
  (t) => [primaryKey({ columns: [t.modelId, t.view] })],
);

// component — FR-007
export const component = pgTable("component", {
  id: uuid("id").primaryKey().defaultRandom(),
  modelId: uuid("model_id")
    .notNull()
    .references(() => capModel.id, { onDelete: "cascade" }),
  nameEs: text("name_es").notNull(),
  nameEn: text("name_en").notNull(),
  material: text("material").notNull(),
  customizable: boolean("customizable").notNull().default(true),
  layerOrder: integer("layer_order").notNull().default(0),
  defaultColorId: uuid("default_color_id").references(() => color.id),
});

// component_color — FR-019, FR-020
export const componentColor = pgTable(
  "component_color",
  {
    componentId: uuid("component_id")
      .notNull()
      .references(() => component.id, { onDelete: "cascade" }),
    colorId: uuid("color_id")
      .notNull()
      .references(() => color.id, { onDelete: "restrict" }),
  },
  (t) => [primaryKey({ columns: [t.componentId, t.colorId] })],
);

// component_image — FR-009, FR-011
export const componentImage = pgTable(
  "component_image",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    modelId: uuid("model_id")
      .notNull()
      .references(() => capModel.id, { onDelete: "cascade" }),
    componentId: uuid("component_id")
      .notNull()
      .references(() => component.id, { onDelete: "cascade" }),
    colorId: uuid("color_id")
      .notNull()
      .references(() => color.id, { onDelete: "restrict" }),
    view: viewEnum("view").notNull(),
    imageUrl: text("image_url").notNull(),
    width: integer("width").notNull(),
    height: integer("height").notNull(),
  },
  (t) => [
    uniqueIndex("component_image_unique").on(
      t.componentId,
      t.colorId,
      t.view,
    ),
  ],
);

// model_size — FR-015
export const modelSize = pgTable(
  "model_size",
  {
    modelId: uuid("model_id")
      .notNull()
      .references(() => capModel.id, { onDelete: "cascade" }),
    label: text("label").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.modelId, t.label] })],
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
  nameEs: text("name_es").notNull(),
  nameEn: text("name_en").notNull(),
  active: boolean("active").notNull().default(true),
});

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

// request_size — FR-048, RN17
export const requestSize = pgTable(
  "request_size",
  {
    requestId: uuid("request_id")
      .notNull()
      .references(() => request.id, { onDelete: "cascade" }),
    sizeLabel: text("size_label").notNull(),
    quantity: integer("quantity").notNull(),
  },
  (t) => [primaryKey({ columns: [t.requestId, t.sizeLabel] })],
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
