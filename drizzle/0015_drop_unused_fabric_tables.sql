-- fabric / fabric_translation / model_fabric existían en la base de datos
-- pero nunca estuvieron en el schema de Drizzle ni se usan en el código
-- (tablas vacías, restos de un experimento anterior).
DROP TABLE IF EXISTS "model_fabric" CASCADE;--> statement-breakpoint
DROP TABLE IF EXISTS "fabric_translation" CASCADE;--> statement-breakpoint
DROP TABLE IF EXISTS "fabric" CASCADE;
