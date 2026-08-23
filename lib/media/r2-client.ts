import { S3Client } from "@aws-sdk/client-s3";
import { env } from "@/lib/config/env";

let client: S3Client | undefined;

/**
 * Cliente S3 apuntando a Cloudflare R2 (API compatible con S3, research.md
 * decisión 1). `forcePathStyle` es requerido por R2 para direccionar el
 * bucket por ruta en vez de por subdominio.
 */
export function r2Client(): S3Client {
  if (!client) {
    client = new S3Client({
      region: "auto",
      endpoint: `https://${env.r2AccountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: env.r2AccessKeyId,
        secretAccessKey: env.r2SecretAccessKey,
      },
      forcePathStyle: true,
      // R2 no soporta el checksum flexible que el SDK agrega por defecto desde
      // la v3.729 (x-amz-checksum-crc32); si va firmado, la URL prefirmada
      // exige ese header y el navegador nunca lo manda, así que R2 responde
      // 403 (y sin cabeceras CORS en el error, por eso el navegador lo
      // reporta como bloqueo CORS en vez de como 403).
      requestChecksumCalculation: "WHEN_REQUIRED",
    });
  }
  return client;
}
