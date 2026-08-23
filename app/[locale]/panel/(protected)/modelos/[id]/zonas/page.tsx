import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { capModel, modelView, decorationZone } from "@/lib/db/schema";
import { getT, type Locale } from "@/lib/i18n/t";
import { env } from "@/lib/config/env";
import { ZonasEditor, type ZonaValue } from "./_ZonasEditor";
import { PanelHeader } from "../../../_PanelHeader";

export default async function ZonasPage({
  params,
}: {
  params: Promise<{ locale: Locale; id: string }>;
}) {
  const { locale, id } = await params;
  const t = getT(locale);

  const [model] = await db.select().from(capModel).where(eq(capModel.id, id)).limit(1);
  if (!model) notFound();

  const [views, zones] = await Promise.all([
    db.select().from(modelView).where(eq(modelView.modelId, id)),
    db.select().from(decorationZone).where(eq(decorationZone.modelId, id)),
  ]);

  const baseImagesByView = Object.fromEntries(
    views.map((v) => [v.view, v.baseImageUrl]),
  );

  const existing: Partial<Record<ZonaValue["position"], ZonaValue>> = {};
  for (const z of zones) {
    existing[z.position] = {
      position: z.position,
      maxWidthCm: Number(z.maxWidthCm),
      maxHeightCm: Number(z.maxHeightCm),
      boxX: z.boxX,
      boxY: z.boxY,
      boxW: z.boxW,
      boxH: z.boxH,
      arc: Number(z.arc),
      tilt: Number(z.tilt),
      taper: Number(z.taper),
      maxTextChars: z.maxTextChars,
    };
  }

  return (
    <div>
      <PanelHeader
        eyebrow={t("nav.models")}
        title={t("panel.modelos.zones")}
        backHref={`/${locale}/panel/modelos/${id}`}
        backLabel={t("common.back")}
      />
      <ZonasEditor
        modelId={id}
        baseImagesByView={baseImagesByView}
        existing={existing}
        defaultChars={env.defaultZoneTextChars}
        labels={{
          position_front: t("panel.modelos.zone.front"),
          position_left: t("panel.modelos.zone.left"),
          position_right: t("panel.modelos.zone.right"),
          position_back: t("panel.modelos.zone.back"),
          maxWidthCm: t("panel.modelos.maxWidthCm"),
          maxHeightCm: t("panel.modelos.maxHeightCm"),
          boxX: t("panel.modelos.boxX"),
          boxY: t("panel.modelos.boxY"),
          boxW: t("panel.modelos.boxW"),
          boxH: t("panel.modelos.boxH"),
          arc: t("panel.modelos.arc"),
          tilt: t("panel.modelos.tilt"),
          taper: t("panel.modelos.taper"),
          maxTextChars: t("panel.modelos.maxTextChars"),
          save: t("common.save"),
        }}
      />
    </div>
  );
}
