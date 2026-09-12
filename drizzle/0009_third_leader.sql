ALTER TABLE "cap_model" ADD COLUMN "price" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "cap_model" ADD COLUMN "default_color_id" uuid;--> statement-breakpoint
ALTER TABLE "cap_model" ADD CONSTRAINT "cap_model_default_color_id_color_id_fk" FOREIGN KEY ("default_color_id") REFERENCES "public"."color"("id") ON DELETE set null ON UPDATE no action;