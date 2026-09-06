import Link from "next/link";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { capModel, modelTechnique } from "@/lib/db/schema";
import {
  capModelConNombre,
  techniqueConNombre,
} from "@/lib/catalogo/consultas-traducidas";
import { getT, type Locale } from "@/lib/i18n/t";
import { EstadoPublicacion } from "./_components/EstadoPublicacion";
import { TecnicasModelo } from "./_components/TecnicasModelo";
import { PanelHeader } from "../../_PanelHeader";

const SECTION_ICONS: Record<string, string> = {
  vistas: "photo_camera",
  colores: "palette",
  componentes: "widgets",
  zonas: "crop_free",
};

export default async function ModeloHubPage({
  params,
}: {
  params: Promise<{ locale: Locale; id: string }>;
}) {
  const { locale, id } = await params;
  const t = getT(locale);

  const [model] = await capModelConNombre().where(eq(capModel.id, id)).limit(1);
  if (!model) notFound();

  const [techniques, links] = await Promise.all([
    techniqueConNombre(),
    db.select().from(modelTechnique).where(eq(modelTechnique.modelId, id)),
  ]);

  const sections = [
    { href: "vistas", label: t("panel.modelos.views") },
    { href: "colores", label: t("panel.modelos.colors") },
    { href: "componentes", label: t("panel.modelos.components") },
    { href: "zonas", label: t("panel.modelos.zones") },
  ];

  return (
    <div>
      <PanelHeader
        eyebrow={`${t("panel.modelos.code")}: ${model.code}`}
        title={locale === "es" ? model.nameEs : model.nameEn}
        primaryAction={{
          label: t("common.edit"),
          href: `/${locale}/panel/modelos/${id}/editar`,
          icon: "edit",
        }}
      />

      <EstadoPublicacion
        modelId={id}
        status={model.status}
        labels={{
          status_draft: t("panel.modelos.status.draft"),
          status_published: t("panel.modelos.status.published"),
          publish: t("panel.modelos.publish"),
          unpublish: t("panel.modelos.unpublish"),
          incomplete: t("errors.publicacion_incompleta"),
          missingBaseViews: t("panel.modelos.missingBaseViews"),
          componentsWithoutColors: t("panel.modelos.componentsWithoutColors"),
        }}
      />

      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-3">
        {sections.map((s) => (
          <Link
            key={s.href}
            href={`/${locale}/panel/modelos/${id}/${s.href}`}
            className="flex flex-col items-center gap-2 rounded-lg border border-outline-variant/60 bg-surface-container-lowest p-6 text-center ambient-shadow transition-colors hover:border-primary hover:text-primary"
          >
            <span className="material-symbols-outlined text-on-surface-variant">
              {SECTION_ICONS[s.href]}
            </span>
            <span className="font-body-md text-body-md font-semibold text-on-surface">
              {s.label}
            </span>
          </Link>
        ))}
      </div>

      <TecnicasModelo
        locale={locale}
        modelId={id}
        techniques={techniques}
        enabledIds={links.map((l) => l.techniqueId)}
        label={t("panel.modelos.techniques")}
      />
    </div>
  );
}
