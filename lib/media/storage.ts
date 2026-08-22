import { put, del } from "@vercel/blob";
import { env } from "@/lib/config/env";

/**
 * Vercel Blob. Los objetos públicos se sirven con permiso de origen cruzado
 * por defecto, que es lo que el `<canvas>` del configurador necesita para
 * componer la imagen final sin quedar "manchado" (research.md, decisión 9).
 */
export async function uploadPublicFile(
  pathname: string,
  body: Buffer | Blob | ReadableStream,
  contentType: string,
): Promise<{ url: string }> {
  const blob = await put(pathname, body, {
    access: "public",
    addRandomSuffix: true,
    contentType,
    token: env.blobReadWriteToken,
  });
  return { url: blob.url };
}

export async function deletePublicFile(url: string): Promise<void> {
  await del(url, { token: env.blobReadWriteToken });
}
