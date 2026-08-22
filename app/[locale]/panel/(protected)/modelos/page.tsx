import Link from "next/link";
import { desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { capModel } from "@/lib/db/schema";
import { getT, type Locale } from "@/lib/i18n/t";

export default async function ModelosPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = getT(locale);
  const models = await db
    .select()
    .from(capModel)
    .orderBy(desc(capModel.createdAt));

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">{t("nav.models")}</h1>
        <Link
          href={`/${locale}/panel/modelos/nuevo`}
          className="rounded bg-brand px-3 py-2 text-sm text-white"
        >
          {t("panel.modelos.new")}
        </Link>
      </div>

      {models.length === 0 && (
        <p className="text-gray-500">{t("panel.modelos.empty")}</p>
      )}

      <ul className="divide-y divide-gray-200">
        {models.map((m) => (
          <li key={m.id} className="flex items-center justify-between py-3">
            <div>
              <Link
                href={`/${locale}/panel/modelos/${m.id}`}
                className="font-medium text-brand"
              >
                {locale === "es" ? m.nameEs : m.nameEn}
              </Link>
              <p className="text-sm text-gray-500">{m.code}</p>
            </div>
            <span
              className={`rounded px-2 py-1 text-xs ${
                m.status === "published"
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {t(`panel.modelos.status.${m.status}`)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
