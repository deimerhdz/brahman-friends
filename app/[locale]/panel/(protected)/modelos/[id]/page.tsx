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
    { href: "componentes", label: t("panel.modelos.components") },
    { href: "imagenes", label: t("panel.modelos.images") },
    { href: "zonas", label: t("panel.modelos.zones") },
    { href: "tallas", label: t("panel.modelos.sizes") },
  ];

  return (
    <div>
      <h1 className="mb-2 text-xl font-semibold">
        {locale === "es" ? model.nameEs : model.nameEn}
      </h1>
      <p className="mb-6 text-sm text-gray-500">{model.code}</p>

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

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-3">
        {sections.map((s) => (
          <Link
            key={s.href}
            href={`/${locale}/panel/modelos/${id}/${s.href}`}
            className="rounded border border-gray-200 p-4 text-center text-brand hover:bg-gray-50"
          >
            {s.label}
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
