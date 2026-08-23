import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "@/lib/config/env";
import { r2Client } from "@/lib/media/r2-client";

const EXPIRES_IN_SECONDS = 300;

/**
 * URL prefirmada (PUT) para que el navegador suba directo a R2, sin pasar
 * por el servidor (research.md, decisión "reemplazar el patrón de subida
 * directa por URLs prefirmadas"). Reemplaza al token de subida directa que
 * entregaba `@vercel/blob/client`.
 */
export async function crearUrlPrefirmada(
  pathname: string,
  contentType: string,
): Promise<{ uploadUrl: string; publicUrl: string; expiresInSeconds: number }> {
  const uploadUrl = await getSignedUrl(
    r2Client(),
    new PutObjectCommand({
      Bucket: env.r2Bucket,
      Key: pathname,
      ContentType: contentType,
    }),
    { expiresIn: EXPIRES_IN_SECONDS },
  );
  return {
    uploadUrl,
    publicUrl: `${env.r2PublicBaseUrl}/${pathname}`,
    expiresInSeconds: EXPIRES_IN_SECONDS,
  };
}
