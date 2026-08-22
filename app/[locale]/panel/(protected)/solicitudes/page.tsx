import Link from "next/link";
import { and, desc, eq, gte, lte, type SQL } from "drizzle-orm";
import { db } from "@/lib/db";
import { request as requestTable } from "@/lib/db/schema";
import { getT, type Locale } from "@/lib/i18n/t";
import { REQUEST_STATUSES } from "@/lib/solicitud/estados";
import { PanelHeader } from "../_PanelHeader";
import { EstadoBadge } from "../_EstadoBadge";

const TONE_BY_STATUS = {
  new: "warning",
  in_review: "warning",
  quoted: "success",
  closed: "neutral",
  rejected: "danger",
} as const;

export default async function SolicitudesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ estado?: string; desde?: string; hasta?: string }>;
}) {
  const { locale } = await params;
  const { estado, desde, hasta } = await searchParams;
  const t = getT(locale);

  const conditions: SQL[] = [];
  if (estado && (REQUEST_STATUSES as readonly string[]).includes(estado)) {
    conditions.push(eq(requestTable.status, estado as (typeof REQUEST_STATUSES)[number]));
  }
  if (desde) conditions.push(gte(requestTable.createdAt, new Date(desde)));
  if (hasta) conditions.push(lte(requestTable.createdAt, new Date(hasta)));

  const requests = await db
    .select()
    .from(requestTable)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(requestTable.createdAt));

  return (
    <div>
      <PanelHeader eyebrow={t("nav.panel")} title={t("nav.requests")}>
        <form className="flex flex-wrap items-center gap-2">
          <select
            name="estado"
            defaultValue={estado ?? ""}
            className="rounded border border-outline-variant bg-surface px-3 py-2 font-body-md text-body-md text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">{t("panel.solicitudes.allStatuses")}</option>
            {REQUEST_STATUSES.map((s) => (
              <option key={s} value={s}>
                {t(`panel.solicitudes.status.${s}`)}
              </option>
            ))}
          </select>
          <input
            type="date"
            name="desde"
            defaultValue={desde ?? ""}
            className="rounded border border-outline-variant bg-surface px-3 py-2 font-body-md text-body-md text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <input
            type="date"
            name="hasta"
            defaultValue={hasta ?? ""}
            className="rounded border border-outline-variant bg-surface px-3 py-2 font-body-md text-body-md text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <button
            type="submit"
            className="rounded bg-on-surface px-4 py-2 font-button text-button text-on-primary transition-colors duration-200 hover:bg-primary"
          >
            {t("panel.solicitudes.filter")}
          </button>
          <a
            href={`/api/panel/solicitudes.csv?estado=${estado ?? ""}&desde=${desde ?? ""}&hasta=${hasta ?? ""}`}
            className="rounded border border-outline-variant px-4 py-2 font-button text-button text-on-surface-variant transition-colors hover:border-on-surface hover:text-on-surface"
          >
            {t("panel.solicitudes.exportCsv")}
          </a>
        </form>
      </PanelHeader>

      <div className="overflow-hidden rounded-lg border border-outline-variant/60 bg-surface-container-lowest ambient-shadow">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead className="border-b border-outline-variant/30 bg-surface-container-lowest">
              <tr>
                <th className="px-6 py-4 text-label-caps font-label-caps text-on-surface-variant">
                  {t("panel.solicitudes.code")}
                </th>
                <th className="px-6 py-4 text-label-caps font-label-caps text-on-surface-variant">
                  {t("panel.solicitudes.date")}
                </th>
                <th className="px-6 py-4 text-label-caps font-label-caps text-on-surface-variant">
                  {t("solicitud.name")}
                </th>
                <th className="px-6 py-4 text-label-caps font-label-caps text-on-surface-variant">
                  {t("solicitud.quantity")}
                </th>
                <th className="px-6 py-4 text-label-caps font-label-caps text-on-surface-variant">
                  {t("panel.modelos.status.label")}
                </th>
                <th className="px-6 py-4 text-label-caps font-label-caps text-on-surface-variant">
                  {t("panel.solicitudes.notification")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {requests.map((r) => (
                <tr key={r.id} className="transition-colors hover:bg-surface-container-low/50">
                  <td className="px-6 py-4">
                    <Link
                      href={`/${locale}/panel/solicitudes/${r.id}`}
                      className="font-body-md text-body-md font-semibold text-on-surface hover:text-primary"
                    >
                      {r.code}
                    </Link>
                  </td>
                  <td className="px-6 py-4 font-body-md text-body-md text-on-surface-variant">
                    {r.createdAt.toISOString().slice(0, 10)}
                  </td>
                  <td className="px-6 py-4 font-body-md text-body-md text-on-surface-variant">
                    {r.contactName ?? "—"}
                  </td>
                  <td className="px-6 py-4 font-body-md text-body-md text-on-surface-variant">
                    {r.quantity}
                  </td>
                  <td className="px-6 py-4">
                    <EstadoBadge
                      label={t(`panel.solicitudes.status.${r.status}`)}
                      tone={TONE_BY_STATUS[r.status]}
                    />
                  </td>
                  <td className="px-6 py-4">
                    {r.notificationStatus !== "sent" && (
                      <EstadoBadge
                        label={t("panel.solicitudes.notificationPendingBadge")}
                        tone="warning"
                      />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {requests.length === 0 && (
          <p className="p-6 text-body-md font-body-md text-on-surface-variant">
            {t("panel.solicitudes.empty")}
          </p>
        )}
      </div>
    </div>
  );
}
