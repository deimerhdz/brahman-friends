import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { env } from "@/lib/config/env";
import { r2Client } from "@/lib/media/r2-client";

/**
 * Cloudflare R2, con el bucket configurado como público. Los objetos
 * públicos se sirven sin restricción de origen cruzado, que es lo que el
 * `<canvas>` del configurador necesita para componer la imagen final sin
 * quedar "manchado" (spec FR-013, research.md).
 */
export async function uploadPublicFile(
  pathname: string,
  body: Buffer | Blob | ReadableStream,
  contentType: string,
): Promise<{ url: string }> {
  await r2Client().send(
    new PutObjectCommand({
      Bucket: env.r2Bucket,
      Key: pathname,
      Body: body,
      ContentType: contentType,
    }),
  );
  return { url: `${env.r2PublicBaseUrl}/${pathname}` };
}

export async function deletePublicFile(url: string): Promise<void> {
  const key = new URL(url).pathname.replace(/^\/+/, "");
  await r2Client().send(
    new DeleteObjectCommand({ Bucket: env.r2Bucket, Key: key }),
  );
}
