/**
 * Sube un archivo directo desde el navegador a R2, pidiendo primero una URL
 * prefirmada al servidor (contracts/subidas-presignadas.md). Compartido por
 * los tres flujos que suben directo sin pasar el archivo por el servidor:
 * SubidaArchivo, la carga masiva y las vistas compuestas de solicitud.
 */
export async function subirDirecto(
  presignEndpoint: string,
  pathname: string,
  file: File | Blob,
  contentType: string,
): Promise<string> {
  const presignResponse = await fetch(presignEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pathname, contentType, contentLength: file.size }),
  });
  if (!presignResponse.ok) throw new Error("presign_failed");
  const { uploadUrl, publicUrl } = (await presignResponse.json()) as {
    uploadUrl: string;
    publicUrl: string;
  };

  const putResponse = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body: file,
  });
  if (!putResponse.ok) throw new Error("upload_failed");

  return publicUrl;
}
