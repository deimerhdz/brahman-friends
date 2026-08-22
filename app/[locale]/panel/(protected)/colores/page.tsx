import Link from "next/link";
import { desc } from "drizzle-orm";
import { color } from "@/lib/db/schema";
import { colorConNombre } from "@/lib/catalogo/consultas-traducidas";
import { getT, type Locale } from "@/lib/i18n/t";
import { MATERIAL_LABELS, isMaterial } from "@/lib/catalogo/materiales";
import { PanelHeader } from "../_PanelHeader";
import { EstadoBadge } from "../_EstadoBadge";

const TONE_BY_STATUS = {
  available: "success",
  out_of_stock: "warning",
  discontinued: "neutral",
} as const;

export default async function ColoresPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = getT(locale);
  const colors = await colorConNombre().orderBy(desc(color.createdAt));

  return (
    <div>
      <PanelHeader
        eyebrow={t("nav.panel")}
        title={t("nav.colors")}
        primaryAction={{
          label: t("panel.colores.new"),
          href: `/${locale}/panel/colores/nuevo`,
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
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded border border-outline-variant/60 bg-surface-container">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={c.sampleImageUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/${locale}/panel/colores/${c.id}`}
                    className="font-body-md text-body-md font-semibold text-on-surface hover:text-primary"
                  >
                    {locale === "es" ? c.nameEs : c.nameEn}
                  </Link>
                  <p className="mt-1 text-label-caps font-label-caps text-on-surface-variant">
                    {isMaterial(c.material)
                      ? MATERIAL_LABELS[c.material][locale]
                      : c.material}{" "}
                    · {c.supplierRef}
                  </p>
                </div>
                <EstadoBadge
                  label={t(`panel.colores.status.${c.status}`)}
                  tone={TONE_BY_STATUS[c.status]}
                />
                <Link
                  href={`/${locale}/panel/colores/${c.id}`}
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
