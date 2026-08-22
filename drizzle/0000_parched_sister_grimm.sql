CREATE TYPE "public"."color_status" AS ENUM('available', 'out_of_stock', 'discontinued');--> statement-breakpoint
CREATE TYPE "public"."model_status" AS ENUM('draft', 'published');--> statement-breakpoint
CREATE TYPE "public"."notification_status" AS ENUM('pending', 'sent', 'failed');--> statement-breakpoint
CREATE TYPE "public"."request_status" AS ENUM('new', 'in_review', 'quoted', 'closed', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."request_view" AS ENUM('front', 'side', 'side_mirrored', 'back');--> statement-breakpoint
CREATE TYPE "public"."view" AS ENUM('front', 'side', 'back');--> statement-breakpoint
CREATE TYPE "public"."zone_position" AS ENUM('front', 'left', 'right', 'back');--> statement-breakpoint
CREATE TABLE "admin_user" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"password_hash" text NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "admin_user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "cap_model" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"name_es" text NOT NULL,
	"name_en" text NOT NULL,
	"description_es" text DEFAULT '' NOT NULL,
	"description_en" text DEFAULT '' NOT NULL,
	"status" "model_status" DEFAULT 'draft' NOT NULL,
	"image_width" integer,
	"image_height" integer,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "cap_model_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "color" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name_es" text NOT NULL,
	"name_en" text NOT NULL,
	"supplier_ref" text NOT NULL,
	"material" text NOT NULL,
	"sample_image_url" text NOT NULL,
	"status" "color_status" DEFAULT 'available' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "component" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"model_id" uuid NOT NULL,
	"name_es" text NOT NULL,
	"name_en" text NOT NULL,
	"material" text NOT NULL,
	"customizable" boolean DEFAULT true NOT NULL,
	"layer_order" integer DEFAULT 0 NOT NULL,
	"default_color_id" uuid
);
--> statement-breakpoint
CREATE TABLE "component_color" (
	"component_id" uuid NOT NULL,
	"color_id" uuid NOT NULL,
	CONSTRAINT "component_color_component_id_color_id_pk" PRIMARY KEY("component_id","color_id")
);
--> statement-breakpoint
CREATE TABLE "component_image" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"model_id" uuid NOT NULL,
	"component_id" uuid NOT NULL,
	"color_id" uuid NOT NULL,
	"view" "view" NOT NULL,
	"image_url" text NOT NULL,
	"width" integer NOT NULL,
	"height" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "decoration_zone" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"model_id" uuid NOT NULL,
	"position" "zone_position" NOT NULL,
	"max_width_cm" numeric(6, 2) NOT NULL,
	"max_height_cm" numeric(6, 2) NOT NULL,
	"box_x" integer NOT NULL,
	"box_y" integer NOT NULL,
	"box_w" integer NOT NULL,
	"box_h" integer NOT NULL,
	"arc" numeric(6, 3) DEFAULT '0' NOT NULL,
	"tilt" numeric(6, 3) DEFAULT '0' NOT NULL,
	"taper" numeric(6, 3) DEFAULT '0' NOT NULL,
	"max_text_chars" integer DEFAULT 20 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "logo_asset" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"url" text NOT NULL,
	"mime" text NOT NULL,
	"bytes" integer NOT NULL,
	"original_filename" text NOT NULL,
	"width" integer,
	"height" integer,
	"request_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "model_size" (
	"model_id" uuid NOT NULL,
	"label" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "model_size_model_id_label_pk" PRIMARY KEY("model_id","label")
);
--> statement-breakpoint
CREATE TABLE "model_technique" (
	"model_id" uuid NOT NULL,
	"technique_id" uuid NOT NULL,
	CONSTRAINT "model_technique_model_id_technique_id_pk" PRIMARY KEY("model_id","technique_id")
);
--> statement-breakpoint
CREATE TABLE "model_view" (
	"model_id" uuid NOT NULL,
	"view" "view" NOT NULL,
	"base_image_url" text,
	CONSTRAINT "model_view_model_id_view_pk" PRIMARY KEY("model_id","view")
);
--> statement-breakpoint
CREATE TABLE "request" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"submission_id" uuid NOT NULL,
	"model_id" uuid NOT NULL,
	"design_snapshot" jsonb NOT NULL,
	"quantity" integer NOT NULL,
	"comments" text,
	"contact_name" text,
	"contact_email" text,
	"contact_phone" text,
	"privacy_accepted_at" timestamp with time zone NOT NULL,
	"status" "request_status" DEFAULT 'new' NOT NULL,
	"status_changed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"notification_status" "notification_status" DEFAULT 'pending' NOT NULL,
	"notification_attempts" integer DEFAULT 0 NOT NULL,
	"anonymized_at" timestamp with time zone,
	"anonymized_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "request_code_unique" UNIQUE("code"),
	CONSTRAINT "request_submission_id_unique" UNIQUE("submission_id")
);
--> statement-breakpoint
CREATE TABLE "request_image" (
	"request_id" uuid NOT NULL,
	"view" "request_view" NOT NULL,
	"image_url" text NOT NULL,
	CONSTRAINT "request_image_request_id_view_pk" PRIMARY KEY("request_id","view")
);
--> statement-breakpoint
CREATE TABLE "request_size" (
	"request_id" uuid NOT NULL,
	"size_label" text NOT NULL,
	"quantity" integer NOT NULL,
	CONSTRAINT "request_size_request_id_size_label_pk" PRIMARY KEY("request_id","size_label")
);
--> statement-breakpoint
CREATE TABLE "request_status_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"request_id" uuid NOT NULL,
	"from_status" text,
	"to_status" text NOT NULL,
	"admin_user_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "technique" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name_es" text NOT NULL,
	"name_en" text NOT NULL,
	"active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
ALTER TABLE "component" ADD CONSTRAINT "component_model_id_cap_model_id_fk" FOREIGN KEY ("model_id") REFERENCES "public"."cap_model"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "component" ADD CONSTRAINT "component_default_color_id_color_id_fk" FOREIGN KEY ("default_color_id") REFERENCES "public"."color"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "component_color" ADD CONSTRAINT "component_color_component_id_component_id_fk" FOREIGN KEY ("component_id") REFERENCES "public"."component"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "component_color" ADD CONSTRAINT "component_color_color_id_color_id_fk" FOREIGN KEY ("color_id") REFERENCES "public"."color"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "component_image" ADD CONSTRAINT "component_image_model_id_cap_model_id_fk" FOREIGN KEY ("model_id") REFERENCES "public"."cap_model"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "component_image" ADD CONSTRAINT "component_image_component_id_component_id_fk" FOREIGN KEY ("component_id") REFERENCES "public"."component"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "component_image" ADD CONSTRAINT "component_image_color_id_color_id_fk" FOREIGN KEY ("color_id") REFERENCES "public"."color"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "decoration_zone" ADD CONSTRAINT "decoration_zone_model_id_cap_model_id_fk" FOREIGN KEY ("model_id") REFERENCES "public"."cap_model"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "model_size" ADD CONSTRAINT "model_size_model_id_cap_model_id_fk" FOREIGN KEY ("model_id") REFERENCES "public"."cap_model"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "model_technique" ADD CONSTRAINT "model_technique_model_id_cap_model_id_fk" FOREIGN KEY ("model_id") REFERENCES "public"."cap_model"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "model_technique" ADD CONSTRAINT "model_technique_technique_id_technique_id_fk" FOREIGN KEY ("technique_id") REFERENCES "public"."technique"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "model_view" ADD CONSTRAINT "model_view_model_id_cap_model_id_fk" FOREIGN KEY ("model_id") REFERENCES "public"."cap_model"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "request" ADD CONSTRAINT "request_model_id_cap_model_id_fk" FOREIGN KEY ("model_id") REFERENCES "public"."cap_model"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "request" ADD CONSTRAINT "request_anonymized_by_admin_user_id_fk" FOREIGN KEY ("anonymized_by") REFERENCES "public"."admin_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "request_image" ADD CONSTRAINT "request_image_request_id_request_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."request"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "request_size" ADD CONSTRAINT "request_size_request_id_request_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."request"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "request_status_history" ADD CONSTRAINT "request_status_history_request_id_request_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."request"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "request_status_history" ADD CONSTRAINT "request_status_history_admin_user_id_admin_user_id_fk" FOREIGN KEY ("admin_user_id") REFERENCES "public"."admin_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "component_image_unique" ON "component_image" USING btree ("component_id","color_id","view");--> statement-breakpoint
CREATE UNIQUE INDEX "decoration_zone_model_position" ON "decoration_zone" USING btree ("model_id","position");--> statement-breakpoint
CREATE INDEX "logo_asset_request_created" ON "logo_asset" USING btree ("request_id","created_at");--> statement-breakpoint
CREATE INDEX "request_status_created" ON "request" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "request_status_changed" ON "request" USING btree ("status","status_changed_at");--> statement-breakpoint
CREATE INDEX "request_notification_status" ON "request" USING btree ("notification_status");