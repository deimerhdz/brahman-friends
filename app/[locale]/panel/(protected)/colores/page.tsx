import Link from "next/link";
import { desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { color } from "@/lib/db/schema";
import { getT, type Locale } from "@/lib/i18n/t";
import { MATERIAL_LABELS, isMaterial } from "@/lib/catalogo/materiales";

export default async function ColoresPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = getT(locale);
  const colors = await db.select().from(color).orderBy(desc(color.createdAt));

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">{t("nav.colors")}</h1>
        <Link
          href={`/${locale}/panel/colores/nuevo`}
          className="rounded bg-brand px-3 py-2 text-sm text-white"
        >
          {t("panel.colores.new")}
        </Link>
      </div>

      {colors.length === 0 && (
        <p className="text-gray-500">{t("panel.colores.empty")}</p>
      )}

      <ul className="divide-y divide-gray-200">
        {colors.map((c) => (
          <li key={c.id} className="flex items-center gap-3 py-3">
            <img
              src={c.sampleImageUrl}
              alt=""
              className="h-10 w-10 rounded object-cover"
            />
            <div className="flex-1">
              <Link
                href={`/${locale}/panel/colores/${c.id}`}
                className="font-medium text-brand"
              >
                {locale === "es" ? c.nameEs : c.nameEn}
              </Link>
              <p className="text-sm text-gray-500">
                {isMaterial(c.material)
                  ? MATERIAL_LABELS[c.material][locale]
                  : c.material}{" "}
                · {c.supplierRef}
              </p>
            </div>
            <span className="text-sm text-gray-500">
              {t(`panel.colores.status.${c.status}`)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
