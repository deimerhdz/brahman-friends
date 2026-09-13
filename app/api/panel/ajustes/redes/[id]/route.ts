import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { siteSocialLink, socialPlatformEnum } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";
import { errors, handleApiError } from "@/lib/http/errors";
import { validarUrlRedSocial } from "@/lib/ajustes/validacion";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return errors.noAutorizado();

  try {
    const { id } = await params;
    const body = await request.json();

    type Platform = (typeof socialPlatformEnum.enumValues)[number];
    const patch: { platform?: Platform; url?: string } = {};

    if (body.platform !== undefined) {
      if (
        typeof body.platform !== "string" ||
        !socialPlatformEnum.enumValues.includes(body.platform)
      ) {
        return errors.datosInvalidos();
      }
      patch.platform = body.platform as Platform;
    }
    if (body.url !== undefined) {
      if (!validarUrlRedSocial(body.url)) {
        return errors.datosInvalidos();
      }
      patch.url = body.url;
    }

    const [updated] = await db
      .update(siteSocialLink)
      .set(patch)
      .where(eq(siteSocialLink.id, id))
      .returning({
        id: siteSocialLink.id,
        platform: siteSocialLink.platform,
        url: siteSocialLink.url,
      });

    if (!updated) {
      return NextResponse.json({ error: "no_encontrado" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return errors.noAutorizado();

  try {
    const { id } = await params;
    const [deleted] = await db
      .delete(siteSocialLink)
      .where(eq(siteSocialLink.id, id))
      .returning({ id: siteSocialLink.id });

    if (!deleted) {
      return NextResponse.json({ error: "no_encontrado" }, { status: 404 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleApiError(error);
  }
}
