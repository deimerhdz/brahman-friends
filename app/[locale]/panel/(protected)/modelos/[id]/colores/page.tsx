import Link from "next/link";
import { eq, desc, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { capModel, color } from "@/lib/db/schema";
import { colorConNombre } from "@/lib/catalogo/consultas-traducidas";
import { getT, type Locale } from "@/lib/i18n/t";
import { PanelHeader } from "../../../_PanelHeader";

export default async function ColoresModeloPage({
  params,
}: {
  params: Promise<{ locale: Locale; id: string }>;
}) {
  const { locale, id: modelId } = await params;
  const t = getT(locale);

  const [model] = await db
    .select()
    .from(capModel)
    .where(eq(capModel.id, modelId))
    .limit(1);
  if (!model) notFound();

  const colors = await colorConNombre()
    .where(and(eq(color.modelId, modelId)))
    .orderBy(desc(color.createdAt));

  return (
    <div>
      <PanelHeader
        eyebrow={t("nav.models")}
        title={t("panel.modelos.colors")}
        backHref={`/${locale}/panel/modelos/${modelId}`}
        backLabel={t("common.back")}
        primaryAction={{
          label: t("panel.colores.new"),
          href: `/${locale}/panel/modelos/${modelId}/colores/nuevo`,
          icon: "add",
        }}
      />

      <div className="overflow-hidden rounded-lg border border-outline-variant/60 bg-surface-container-lowest ambient-shadow">
        {colors.length === 0 ? (
          <p className="p-6 text-body-md font-body-md text-on-surface-variant">
            {t("panel.colores.empty")}
          </p>
        ) : (
          <ul className="divide-y divide-outline-variant/20">
            {colors.map((c) => (
              <li
                key={c.id}
                className="flex flex-wrap items-center gap-x-4 gap-y-2 px-6 py-4 transition-colors hover:bg-surface-container-low/50"
              >
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/${locale}/panel/modelos/${modelId}/colores/${c.id}`}
                    className="font-body-md text-body-md font-semibold text-on-surface hover:text-primary"
                  >
                    {locale === "es" ? c.nameEs : c.nameEn}
                  </Link>
                </div>
                <Link
                  href={`/${locale}/panel/modelos/${modelId}/colores/${c.id}`}
                  className="inline-flex p-2 text-on-surface-variant transition-colors hover:text-primary"
                  title={t("common.edit")}
                  aria-label={t("common.edit")}
                >
                  <span className="material-symbols-outlined" aria-hidden="true">
                    edit
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
