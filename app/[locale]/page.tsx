import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { capModel } from "@/lib/db/schema";
import { getT, type Locale } from "@/lib/i18n/t";

// La portada depende de qué modelos están publicados en este momento
// (FR-014, RN1): nunca se genera estáticamente.
export const dynamic = "force-dynamic";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = getT(locale);

  const models = await db
    .select()
    .from(capModel)
    .where(eq(capModel.status, "published"))
    .orderBy(desc(capModel.publishedAt));

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold">{t("home.title")}</h1>

      {models.length === 0 && (
        <p className="text-gray-500">{t("home.empty")}</p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {models.map((m) => (
          <Link
            key={m.id}
            href={`/${locale}/configurador/${m.id}`}
            className="rounded border border-gray-200 p-4 hover:bg-gray-50"
          >
            <h2 className="font-medium text-brand">
              {locale === "es" ? m.nameEs : m.nameEn}
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              {locale === "es" ? m.descriptionEs : m.descriptionEn}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
