import { asc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import {
  request as requestTable,
  requestSize,
  requestImage,
  requestStatusHistory,
  adminUser,
  logoAsset,
} from "@/lib/db/schema";
import { getT, type Locale } from "@/lib/i18n/t";
import type { DesignSnapshot } from "@/lib/solicitud/snapshot";
import type { RequestStatus } from "@/lib/solicitud/estados";
import { Historial } from "./_components/Historial";
import { Anonimizar } from "./_components/Anonimizar";
import { PanelHeader } from "../../_PanelHeader";

export default async function SolicitudDetallePage({
  params,
}: {
  params: Promise<{ locale: Locale; id: string }>;
}) {
  const { locale, id } = await params;
  const t = getT(locale);

  const [req] = await db.select().from(requestTable).where(eq(requestTable.id, id)).limit(1);
  if (!req) notFound();

  const [sizes, images, history, logos] = await Promise.all([
    db.select().from(requestSize).where(eq(requestSize.requestId, id)),
    db.select().from(requestImage).where(eq(requestImage.requestId, id)),
    db
      .select({
        fromStatus: requestStatusHistory.fromStatus,
        toStatus: requestStatusHistory.toStatus,
        createdAt: requestStatusHistory.createdAt,
        adminName: adminUser.name,
      })
      .from(requestStatusHistory)
      .innerJoin(adminUser, eq(requestStatusHistory.adminUserId, adminUser.id))
      .where(eq(requestStatusHistory.requestId, id))
      .orderBy(asc(requestStatusHistory.createdAt)),
    db.select().from(logoAsset).where(eq(logoAsset.requestId, id)),
  ]);

  const snapshot = req.designSnapshot as DesignSnapshot;

  return (
    <div className="flex flex-col gap-6">
      <PanelHeader eyebrow={t("nav.requests")} title={req.code}>
        <a
          href={`/api/panel/solicitudes/${id}/ficha.pdf`}
          className="rounded border border-outline-variant px-4 py-2 font-button text-button text-on-surface-variant transition-colors hover:border-on-surface hover:text-on-surface"
        >
          {t("panel.solicitudes.downloadPdf")}
        </a>
      </PanelHeader>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {images.map((img) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={img.view}
            src={img.imageUrl}
            alt={img.view}
            className="rounded-lg border border-outline-variant/60"
          />
        ))}
      </div>

      <section className="rounded-lg border border-outline-variant/60 bg-surface-container-lowest p-6 font-body-md text-body-md text-on-surface ambient-shadow">
        <h2 className="mb-3 font-body-md text-body-md font-semibold text-on-surface">
          {t("panel.solicitudes.technicalSheet")}
        </h2>
        <p>
          {locale === "es" ? snapshot.model.nameEs : snapshot.model.nameEn} (
          {snapshot.model.code})
        </p>
        <p>
          {t("solicitud.quantity")}: {req.quantity}
        </p>
        <ul className="list-inside list-disc">
          {sizes.map((s) => (
            <li key={s.sizeLabel}>
              {s.sizeLabel}: {s.quantity}
            </li>
          ))}
        </ul>
        {snapshot.technique && (
          <p>
            {t("solicitud.technique")}:{" "}
            {locale === "es" ? snapshot.technique.nameEs : snapshot.technique.nameEn}
          </p>
        )}
        <ul className="list-inside list-disc">
          {snapshot.components.map((c) => (
            <li key={c.id}>
              {locale === "es" ? c.nameEs : c.nameEn}:{" "}
              {c.color
                ? `${locale === "es" ? c.color.nameEs : c.color.nameEn} — ${c.color.supplierRef}`
                : "—"}
            </li>
          ))}
        </ul>
        {snapshot.decorations.length > 0 && (
          <ul className="list-inside list-disc">
            {snapshot.decorations.map((d, i) => (
              <li key={i}>
                {d.zone} — {d.kind === "logo" ? d.logoFilename : `"${d.content}"`} —{" "}
                {d.widthCm.toFixed(1)}×{d.heightCm.toFixed(1)} cm
              </li>
            ))}
          </ul>
        )}
      </section>

      {!req.anonymizedAt && (
        <section className="rounded-lg border border-outline-variant/60 bg-surface-container-lowest p-6 font-body-md text-body-md text-on-surface ambient-shadow">
          <h2 className="mb-3 font-body-md text-body-md font-semibold text-on-surface">
            {t("panel.solicitudes.contact")}
          </h2>
          <p>{req.contactName}</p>
          <p>{req.contactEmail}</p>
          <p>{req.contactPhone}</p>
          {req.comments && <p>{req.comments}</p>}
          {logos.length > 0 && (
            <a
              href={`/api/panel/solicitudes/${id}/logo`}
              className="mt-2 inline-block text-primary underline hover:no-underline"
            >
              {t("panel.solicitudes.downloadLogo")}
            </a>
          )}
        </section>
      )}

      <section className="rounded-lg border border-outline-variant/60 bg-surface-container-lowest p-6 ambient-shadow">
        <h2 className="mb-3 font-body-md text-body-md font-semibold text-on-surface">
          {t("panel.solicitudes.statusHistory")}
        </h2>
        <Historial
          requestId={id}
          currentStatus={req.status as RequestStatus}
          history={history.map((h) => ({
            fromStatus: h.fromStatus,
            toStatus: h.toStatus,
            adminName: h.adminName,
            createdAt: h.createdAt.toISOString(),
          }))}
          labels={{
            error: t("errors.transicion_no_permitida"),
            status_new: t("panel.solicitudes.status.new"),
            status_in_review: t("panel.solicitudes.status.in_review"),
            status_quoted: t("panel.solicitudes.status.quoted"),
            status_closed: t("panel.solicitudes.status.closed"),
            status_rejected: t("panel.solicitudes.status.rejected"),
          }}
        />
      </section>

      {!req.anonymizedAt && (
        <Anonimizar
          requestId={id}
          labels={{
            anonymize: t("panel.solicitudes.anonymize"),
            confirmIrreversible: t("panel.solicitudes.anonymizeConfirm"),
            confirm: t("common.confirm"),
            cancel: t("common.cancel"),
            error: t("errors.generic"),
          }}
        />
      )}
      {req.anonymizedAt && (
        <p className="font-body-md text-body-md text-on-surface-variant">
          {t("panel.solicitudes.anonymized")}
        </p>
      )}
    </div>
  );
}
