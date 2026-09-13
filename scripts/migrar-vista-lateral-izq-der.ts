import "../lib/config/dotenv";
import { and, eq } from "drizzle-orm";
import { db } from "../lib/db";
import { modelView, colorImage } from "../lib/db/schema";

// "left"/"right" reemplazan a la vista única "side" (antes ambos lados
// compartían la misma foto, espejada por CSS/canvas para el lado derecho —
// ver lib/design/compose.ts). Este backfill corre una sola vez: duplica cada
// fila "side" existente en una fila "right" y renombra la original a "left",
// para que ningún modelo/color quede sin foto mientras se suben las fotos
// reales de cada lado. Es seguro re-ejecutarlo (no hace nada si ya no queda
// ninguna fila "side").
async function main() {
  const sideViews = await db
    .select()
    .from(modelView)
    .where(eq(modelView.view, "side"));
  for (const row of sideViews) {
    await db
      .insert(modelView)
      .values({
        modelId: row.modelId,
        view: "right",
        baseImageUrl: row.baseImageUrl,
        active: row.active,
      })
      .onConflictDoNothing();
    await db
      .update(modelView)
      .set({ view: "left" })
      .where(
        and(eq(modelView.modelId, row.modelId), eq(modelView.view, "side")),
      );
  }

  const sideColorImages = await db
    .select()
    .from(colorImage)
    .where(eq(colorImage.view, "side"));
  for (const row of sideColorImages) {
    await db
      .insert(colorImage)
      .values({
        modelId: row.modelId,
        colorId: row.colorId,
        view: "right",
        imageUrl: row.imageUrl,
        width: row.width,
        height: row.height,
      })
      .onConflictDoNothing();
    await db
      .update(colorImage)
      .set({ view: "left" })
      .where(eq(colorImage.id, row.id));
  }

  console.log(`model_view: ${sideViews.length} fila(s) "side" migradas a left/right.`);
  console.log(`color_image: ${sideColorImages.length} fila(s) "side" migradas a left/right.`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
