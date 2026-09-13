CREATE TYPE "public"."social_platform" AS ENUM('instagram', 'facebook', 'tiktok', 'whatsapp', 'x', 'youtube', 'linkedin');--> statement-breakpoint
CREATE TABLE "site_settings" (
	"id" uuid PRIMARY KEY NOT NULL,
	"site_name_es" text NOT NULL,
	"site_name_en" text NOT NULL,
	"contact_email" text,
	"contact_phone" text,
	"logo_url" text,
	"banner_url" text,
	"seo_title_es" text,
	"seo_title_en" text,
	"seo_description_es" text,
	"seo_description_en" text,
	"seo_image_url" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "site_social_link" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"platform" "social_platform" NOT NULL,
	"url" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
-- Siembra la única fila de configuración (research.md #1, #2): mismo nombre
-- de sitio que hoy vive fijo en la clave de traducción common.siteName, para
-- que nada cambie visiblemente el día que se despliega esta funcionalidad.
INSERT INTO "site_settings" ("id", "site_name_es", "site_name_en")
VALUES ('00000000-0000-0000-0000-000000000001', 'Brahman Friends', 'Brahman Friends');
