import { cache } from "react";
import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { siteSettings, siteSocialLink, SITE_SETTINGS_ID } from "@/lib/db/schema";

/**
 * Fila única de configuración del sitio, sembrada por la migración
 * (drizzle/0016_awesome_bill_hollister.sql) — siempre existe, así que no hay
 * caso de "no encontrado" que manejar. `cache()` deduplica la consulta
 * dentro de un mismo render de servidor aunque varios componentes la llamen
 * (research.md #3).
 */
export const obtenerAjustesSitio = cache(async () => {
  const [settings] = await db
    .select()
    .from(siteSettings)
    .where(eq(siteSettings.id, SITE_SETTINGS_ID))
    .limit(1);

  const socialLinks = await db
    .select({
      id: siteSocialLink.id,
      platform: siteSocialLink.platform,
      url: siteSocialLink.url,
    })
    .from(siteSocialLink)
    .orderBy(asc(siteSocialLink.createdAt));

  return { ...settings!, socialLinks };
});

export type AjustesSitio = Awaited<ReturnType<typeof obtenerAjustesSitio>>;
