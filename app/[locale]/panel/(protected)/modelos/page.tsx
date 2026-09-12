import Link from "next/link";
import { desc } from "drizzle-orm";
import { capModel } from "@/lib/db/schema";
import { capModelConNombre } from "@/lib/catalogo/consultas-traducidas";
import { getT, type Locale } from "@/lib/i18n/t";
import { PanelHeader } from "../_PanelHeader";
import { EstadoBadge } from "../_EstadoBadge";

export default async function ModelosPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = getT(locale);
  const models = await capModelConNombre().orderBy(desc(capModel.createdAt));

  return (
    <div>
      <PanelHeader
        eyebrow={t("nav.panel")}
        title={t("nav.models")}
        primaryAction={{
          label: t("panel.modelos.new"),
          href: `/${locale}/panel/modelos/nuevo`,
          icon: "add",
        }}
      />

      <div className="overflow-hidden rounded-lg border border-outline-variant/60 bg-surface-container-lowest ambient-shadow">
        {models.length === 0 ? (
          <p className="p-6 text-body-md font-body-md text-on-surface-variant">
            {t("panel.modelos.empty")}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead className="border-b border-outline-variant/30 bg-surface-container-lowest">
                <tr>
                  <th className="px-6 py-4 text-label-caps font-label-caps text-on-surface-variant">
                    {t("common.name")}
                  </th>
                  <th className="px-6 py-4 text-label-caps font-label-caps text-on-surface-variant">
                    {t("panel.modelos.status.label")}
                  </th>
                  <th className="px-6 py-4 text-label-caps font-label-caps text-on-surface-variant">
                    {t("panel.modelos.type.label")}
                  </th>
                  <th className="px-6 py-4 text-right text-label-caps font-label-caps text-on-surface-variant">
                    {t("common.edit")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {models.map((m) => (
                  <tr
                    key={m.id}
                    className="transition-colors hover:bg-surface-container-low/50"
                  >
                    <td className="px-6 py-4">
                      <Link
                        href={`/${locale}/panel/modelos/${m.id}`}
                        className="font-body-md text-body-md font-semibold text-on-surface hover:text-primary"
                      >
                        {locale === "es" ? m.nameEs : m.nameEn}
                      </Link>
                      <p className="mt-1 text-label-caps font-label-caps text-on-surface-variant">
                        {t("panel.modelos.code")}: {m.code}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <EstadoBadge
                        label={t(`panel.modelos.status.${m.status}`)}
                        tone={m.status === "published" ? "success" : "neutral"}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <EstadoBadge
                        label={t(`panel.modelos.type.${m.type}`)}
                        tone="neutral"
                      />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/${locale}/panel/modelos/${m.id}`}
                        className="inline-flex p-2 text-on-surface-variant transition-colors hover:text-primary"
                        title={t("common.edit")}
                        aria-label={t("common.edit")}
                      >
                        <span className="material-symbols-outlined" aria-hidden="true">
                          edit
                        </span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
