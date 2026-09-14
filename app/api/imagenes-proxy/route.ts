import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/config/env";
import { apiError, handleApiError } from "@/lib/http/errors";

/**
 * Reenvía una imagen pública de R2 desde el mismo origen del sitio
 * (010-lateral-real / bug de composición): el bucket es público pero no
 * manda cabeceras CORS, así que un `<img crossOrigin="anonymous">` apuntando
 * directo a R2 nunca dispara `onload` — y sin eso, `canvas.toBlob()` en
 * `composeView` (la imagen congelada que se sube con cada solicitud) no
 * puede ni empezar. Sirviendo el mismo byte pero desde `/api/...`, el
 * navegador lo trata como mismo origen y el canvas nunca queda "manchado".
 * Solo reenvía URLs que ya son públicas dentro de nuestro propio bucket
 * (`R2_PUBLIC_BASE_URL`): no es un proxy abierto a cualquier URL.
 */
export async function GET(request: NextRequest) {
  try {
    const url = request.nextUrl.searchParams.get("url");
    if (!url || !url.startsWith(env.r2PublicBaseUrl)) {
      return apiError(400, "url_invalida");
    }

    const upstream = await fetch(url);
    if (!upstream.ok || !upstream.body) {
      return apiError(404, "no_encontrado");
    }

    return new NextResponse(upstream.body, {
      headers: {
        "Content-Type": upstream.headers.get("content-type") ?? "application/octet-stream",
        // Los objetos en R2 son inmutables por nombre (subir-directo.ts
        // siempre genera una key nueva); cachear agresivo evita repetir este
        // relevo en cada composición del mismo diseño.
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
