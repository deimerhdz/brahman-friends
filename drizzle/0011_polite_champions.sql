CREATE TYPE "public"."model_type" AS ENUM('configurable', 'fixed_product');--> statement-breakpoint
ALTER TABLE "cap_model" ADD COLUMN "type" "model_type" DEFAULT 'configurable' NOT NULL;