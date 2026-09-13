import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { siteSettings, SITE_SETTINGS_ID } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";
import { errors, handleApiError } from "@/lib/http/errors";
import { obtenerAjustesSitio } from "@/lib/ajustes/consultas";
import { validarAjustesBasicos } from "@/lib/ajustes/validacion";

function serializar(ajustes: Awaited<ReturnType<typeof obtenerAjustesSitio>>) {
  return {
    siteName: { es: ajustes.siteNameEs, en: ajustes.siteNameEn },
    contactEmail: ajustes.contactEmail,
    contactPhone: ajustes.contactPhone,
    logoUrl: ajustes.logoUrl,
    bannerUrl: ajustes.bannerUrl,
    seo: {
      title: { es: ajustes.seoTitleEs, en: ajustes.seoTitleEn },
      description: { es: ajustes.seoDescriptionEs, en: ajustes.seoDescriptionEn },
      imageUrl: ajustes.seoImageUrl,
    },
    socialLinks: ajustes.socialLinks,
  };
}

function optionalString(value: unknown): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  return typeof value === "string" ? value : undefined;
}

export async function GET() {
  const session = await getSession();
  if (!session) return errors.noAutorizado();

  try {
    const ajustes = await obtenerAjustesSitio();
    return NextResponse.json(serializar(ajustes));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest) {
  const session = await getSession();
  if (!session) return errors.noAutorizado();

  try {
    const body = await request.json();

    if (!validarAjustesBasicos({ siteNameEs: body.siteName?.es, siteNameEn: body.siteName?.en })) {
      return errors.datosInvalidos();
    }

    const contactEmail = optionalString(body.contactEmail);
    const contactPhone = optionalString(body.contactPhone);
    const logoUrl = optionalString(body.logoUrl);
    const bannerUrl = optionalString(body.bannerUrl);
    const seoTitleEs = optionalString(body.seo?.title?.es);
    const seoTitleEn = optionalString(body.seo?.title?.en);
    const seoDescriptionEs = optionalString(body.seo?.description?.es);
    const seoDescriptionEn = optionalString(body.seo?.description?.en);
    const seoImageUrl = optionalString(body.seo?.imageUrl);

    if (
      [
        contactEmail,
        contactPhone,
        logoUrl,
        bannerUrl,
        seoTitleEs,
        seoTitleEn,
        seoDescriptionEs,
        seoDescriptionEn,
        seoImageUrl,
      ].includes(undefined)
    ) {
      return errors.datosInvalidos();
    }

    await db
      .update(siteSettings)
      .set({
        siteNameEs: body.siteName.es.trim(),
        siteNameEn: body.siteName.en.trim(),
        contactEmail,
        contactPhone,
        logoUrl,
        bannerUrl,
        seoTitleEs,
        seoTitleEn,
        seoDescriptionEs,
        seoDescriptionEn,
        seoImageUrl,
        updatedAt: new Date(),
      })
      .where(eq(siteSettings.id, SITE_SETTINGS_ID));

    const ajustes = await obtenerAjustesSitio();
    return NextResponse.json(serializar(ajustes));
  } catch (error) {
    return handleApiError(error);
  }
}
