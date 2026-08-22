import Link from "next/link";
import { and, desc, eq, gte, lte, type SQL } from "drizzle-orm";
import { db } from "@/lib/db";
import { request as requestTable } from "@/lib/db/schema";
import { getT, type Locale } from "@/lib/i18n/t";
import { REQUEST_STATUSES } from "@/lib/solicitud/estados";

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
      <h1 className="mb-4 text-xl font-semibold">{t("nav.requests")}</h1>

      <form className="mb-4 flex flex-wrap gap-2 text-sm">
        <select name="estado" defaultValue={estado ?? ""} className="rounded border border-gray-300 px-2 py-1">
          <option value="">{t("panel.solicitudes.allStatuses")}</option>
          {REQUEST_STATUSES.map((s) => (
            <option key={s} value={s}>
              {t(`panel.solicitudes.status.${s}`)}
            </option>
          ))}
        </select>
        <input type="date" name="desde" defaultValue={desde ?? ""} className="rounded border border-gray-300 px-2 py-1" />
        <input type="date" name="hasta" defaultValue={hasta ?? ""} className="rounded border border-gray-300 px-2 py-1" />
        <button type="submit" className="rounded bg-brand px-3 py-1 text-white">
          {t("panel.solicitudes.filter")}
        </button>
        <a
          href={`/api/panel/solicitudes.csv?estado=${estado ?? ""}&desde=${desde ?? ""}&hasta=${hasta ?? ""}`}
          className="ml-auto rounded bg-gray-100 px-3 py-1"
        >
          {t("panel.solicitudes.exportCsv")}
        </a>
      </form>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500">
              <th className="pr-4">{t("panel.solicitudes.code")}</th>
              <th className="pr-4">{t("panel.solicitudes.date")}</th>
              <th className="pr-4">{t("solicitud.name")}</th>
              <th className="pr-4">{t("solicitud.quantity")}</th>
              <th className="pr-4">{t("panel.modelos.status.label")}</th>
              <th>{t("panel.solicitudes.notification")}</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((r) => (
              <tr key={r.id} className="border-t border-gray-100">
                <td className="pr-4 py-2">
                  <Link href={`/${locale}/panel/solicitudes/${r.id}`} className="text-brand">
                    {r.code}
                  </Link>
                </td>
                <td className="pr-4 py-2">{r.createdAt.toISOString().slice(0, 10)}</td>
                <td className="pr-4 py-2">{r.contactName ?? "—"}</td>
                <td className="pr-4 py-2">{r.quantity}</td>
                <td className="pr-4 py-2">{t(`panel.solicitudes.status.${r.status}`)}</td>
                <td className="py-2">
                  {r.notificationStatus !== "sent" && (
                    <span className="rounded bg-yellow-100 px-2 py-1 text-xs text-yellow-800">
                      {t("panel.solicitudes.notificationPendingBadge")}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {requests.length === 0 && (
          <p className="py-4 text-gray-500">{t("panel.solicitudes.empty")}</p>
        )}
      </div>
    </div>
  );
}
