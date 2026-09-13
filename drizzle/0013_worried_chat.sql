CREATE TABLE "color_image" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"model_id" uuid NOT NULL,
	"color_id" uuid NOT NULL,
	"view" "view" NOT NULL,
	"image_url" text NOT NULL,
	"width" integer NOT NULL,
	"height" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "color_image" ADD CONSTRAINT "color_image_model_id_cap_model_id_fk" FOREIGN KEY ("model_id") REFERENCES "public"."cap_model"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "color_image" ADD CONSTRAINT "color_image_color_id_color_id_fk" FOREIGN KEY ("color_id") REFERENCES "public"."color"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "color_image_unique" ON "color_image" USING btree ("color_id","view");