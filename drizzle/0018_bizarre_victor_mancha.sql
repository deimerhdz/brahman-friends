CREATE TYPE "public"."technique_render_style" AS ENUM('flat', 'embroidery');--> statement-breakpoint
ALTER TABLE "technique" ADD COLUMN "render_style" "technique_render_style" DEFAULT 'flat' NOT NULL;