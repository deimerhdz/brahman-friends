import { asc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { capModel, modelSize } from "@/lib/db/schema";
import { getT, type Locale } from "@/lib/i18n/t";
import { TallasForm } from "./_TallasForm";

export default async function TallasPage({
  params,
}: {
  params: Promise<{ locale: Locale; id: string }>;
}) {
  const { locale, id } = await params;
  const t = getT(locale);

  const [model] = await db.select().from(capModel).where(eq(capModel.id, id)).limit(1);
  if (!model) notFound();

  const sizes = await db
    .select()
    .from(modelSize)
    .where(eq(modelSize.modelId, id))
    .orderBy(asc(modelSize.sortOrder));

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">{t("panel.modelos.sizes")}</h1>
      <TallasForm
        modelId={id}
        sizes={sizes}
        labels={{
          placeholder: t("panel.modelos.sizeLabel"),
          add: t("common.save"),
          remove: t("common.delete"),
        }}
      />
    </div>
  );
}
