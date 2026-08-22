import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { capModel, modelView } from "@/lib/db/schema";
import { getT, type Locale } from "@/lib/i18n/t";
import { VistasForm } from "./_VistasForm";

export default async function VistasPage({
  params,
}: {
  params: Promise<{ locale: Locale; id: string }>;
}) {
  const { locale, id } = await params;
  const t = getT(locale);

  const [model] = await db.select().from(capModel).where(eq(capModel.id, id)).limit(1);
  if (!model) notFound();

  const views = await db
    .select()
    .from(modelView)
    .where(eq(modelView.modelId, id));

  if (views.length === 0) {
    // front siempre debe existir para poder trabajar el modelo (FR-006).
    await db.insert(modelView).values({ modelId: id, view: "front" });
  }

  const initial = Object.fromEntries(
    (views.length ? views : [{ view: "front", baseImageUrl: null }]).map(
      (v) => [v.view, v.baseImageUrl ?? ""],
    ),
  );

  if (!initial.front) initial.front = initial.front ?? "";

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">{t("panel.modelos.views")}</h1>
      <VistasForm
        modelId={id}
        initial={initial}
        labels={{
          view_front: t("panel.modelos.view.front"),
          view_side: t("panel.modelos.view.side"),
          view_back: t("panel.modelos.view.back"),
          frontRequired: t("panel.modelos.frontRequired"),
          uploading: t("common.loading"),
          error: t("errors.generic"),
          dimensionMismatch: t("panel.modelos.dimensionMismatch"),
        }}
      />
    </div>
  );
}
