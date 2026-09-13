import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { siteSocialLink, socialPlatformEnum } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";
import { errors, handleApiError } from "@/lib/http/errors";
import { validarUrlRedSocial } from "@/lib/ajustes/validacion";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return errors.noAutorizado();

  try {
    const body = await request.json();

    if (
      typeof body.platform !== "string" ||
      !socialPlatformEnum.enumValues.includes(body.platform)
    ) {
      return errors.datosInvalidos();
    }
    if (!validarUrlRedSocial(body.url)) {
      return errors.datosInvalidos();
    }

    const [created] = await db
      .insert(siteSocialLink)
      .values({ platform: body.platform, url: body.url })
      .returning({
        id: siteSocialLink.id,
        platform: siteSocialLink.platform,
        url: siteSocialLink.url,
      });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
