import type { NextConfig } from "next";

// El hostname público de R2 depende del bucket (dominio propio o *.r2.dev), así que se deriva de
// R2_PUBLIC_BASE_URL. Esta config se evalúa al compilar, no en runtime: en Workers Builds las
// variables del Worker no existen durante el build, así que se cae al bucket de producción para que
// /_next/image no rechace las imágenes con 400 ("url" parameter is not allowed).
const R2_HOSTNAME_PRODUCCION = "pub-d37043d7d0234039b25d42456022e066.r2.dev";
const r2Hostname = process.env.R2_PUBLIC_BASE_URL
  ? new URL(process.env.R2_PUBLIC_BASE_URL).hostname
  : R2_HOSTNAME_PRODUCCION;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Vercel Blob: archivos subidos antes de la migración a R2 (FR-011), se conserva mientras
      // sigan existiendo URLs antiguas en uso.
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
      {
        protocol: "https",
        hostname: r2Hostname,
      },
    ],
  },
};

export default nextConfig;
