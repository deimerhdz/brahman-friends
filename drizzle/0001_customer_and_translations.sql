CREATE TYPE "public"."locale" AS ENUM('es', 'en');--> statement-breakpoint
CREATE TABLE "cap_model_translation" (
	"model_id" uuid NOT NULL,
	"locale" "locale" NOT NULL,
	"name" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	CONSTRAINT "cap_model_translation_model_id_locale_pk" PRIMARY KEY("model_id","locale")
);
--> statement-breakpoint
CREATE TABLE "color_translation" (
	"color_id" uuid NOT NULL,
	"locale" "locale" NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "color_translation_color_id_locale_pk" PRIMARY KEY("color_id","locale")
);
--> statement-breakpoint
CREATE TABLE "component_translation" (
	"component_id" uuid NOT NULL,
	"locale" "locale" NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "component_translation_component_id_locale_pk" PRIMARY KEY("component_id","locale")
);
--> statement-breakpoint
CREATE TABLE "customer" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"failed_login_attempts" integer DEFAULT 0 NOT NULL,
	"locked_until" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "customer_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "technique_translation" (
	"technique_id" uuid NOT NULL,
	"locale" "locale" NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "technique_translation_technique_id_locale_pk" PRIMARY KEY("technique_id","locale")
);
--> statement-breakpoint
ALTER TABLE "cap_model_translation" ADD CONSTRAINT "cap_model_translation_model_id_cap_model_id_fk" FOREIGN KEY ("model_id") REFERENCES "public"."cap_model"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "color_translation" ADD CONSTRAINT "color_translation_color_id_color_id_fk" FOREIGN KEY ("color_id") REFERENCES "public"."color"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "component_translation" ADD CONSTRAINT "component_translation_component_id_component_id_fk" FOREIGN KEY ("component_id") REFERENCES "public"."component"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "technique_translation" ADD CONSTRAINT "technique_translation_technique_id_technique_id_fk" FOREIGN KEY ("technique_id") REFERENCES "public"."technique"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
-- Copiar el contenido existente a la tabla de traducción antes de borrar las
-- columnas viejas, para que nunca exista un estado intermedio sin datos
-- (FR-018, research.md#10-migración-de-datos).
INSERT INTO "cap_model_translation" ("model_id", "locale", "name", "description")
SELECT "id", 'es', "name_es", "description_es" FROM "cap_model";--> statement-breakpoint
INSERT INTO "cap_model_translation" ("model_id", "locale", "name", "description")
SELECT "id", 'en', "name_en", "description_en" FROM "cap_model";--> statement-breakpoint
INSERT INTO "color_translation" ("color_id", "locale", "name")
SELECT "id", 'es', "name_es" FROM "color";--> statement-breakpoint
INSERT INTO "color_translation" ("color_id", "locale", "name")
SELECT "id", 'en', "name_en" FROM "color";--> statement-breakpoint
INSERT INTO "component_translation" ("component_id", "locale", "name")
SELECT "id", 'es', "name_es" FROM "component";--> statement-breakpoint
INSERT INTO "component_translation" ("component_id", "locale", "name")
SELECT "id", 'en', "name_en" FROM "component";--> statement-breakpoint
INSERT INTO "technique_translation" ("technique_id", "locale", "name")
SELECT "id", 'es', "name_es" FROM "technique";--> statement-breakpoint
INSERT INTO "technique_translation" ("technique_id", "locale", "name")
SELECT "id", 'en', "name_en" FROM "technique";--> statement-breakpoint
ALTER TABLE "cap_model" DROP COLUMN "name_es";--> statement-breakpoint
ALTER TABLE "cap_model" DROP COLUMN "name_en";--> statement-breakpoint
ALTER TABLE "cap_model" DROP COLUMN "description_es";--> statement-breakpoint
ALTER TABLE "cap_model" DROP COLUMN "description_en";--> statement-breakpoint
ALTER TABLE "color" DROP COLUMN "name_es";--> statement-breakpoint
ALTER TABLE "color" DROP COLUMN "name_en";--> statement-breakpoint
ALTER TABLE "component" DROP COLUMN "name_es";--> statement-breakpoint
ALTER TABLE "component" DROP COLUMN "name_en";--> statement-breakpoint
ALTER TABLE "technique" DROP COLUMN "name_es";--> statement-breakpoint
ALTER TABLE "technique" DROP COLUMN "name_en";