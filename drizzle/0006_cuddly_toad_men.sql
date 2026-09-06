ALTER TABLE "color" DROP COLUMN "supplier_ref";--> statement-breakpoint
ALTER TABLE "color" DROP COLUMN "material";--> statement-breakpoint
ALTER TABLE "color" DROP COLUMN "status";--> statement-breakpoint
DROP TYPE "public"."color_status";