ALTER TABLE "component_color" ADD COLUMN "view" "view";--> statement-breakpoint
UPDATE "component_color" SET "view" = 'front' WHERE "view" IS NULL;--> statement-breakpoint
INSERT INTO "component_color" (component_id, color_id, view)
SELECT cc.component_id, cc.color_id, mv.view
FROM "component_color" cc
JOIN "component" c ON c.id = cc.component_id
JOIN "model_view" mv ON mv.model_id = c.model_id
WHERE mv.view <> 'front';--> statement-breakpoint
ALTER TABLE "component_color" ALTER COLUMN "view" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "component_color" ADD CONSTRAINT "component_color_component_id_color_id_view_pk" PRIMARY KEY("component_id","color_id","view");
