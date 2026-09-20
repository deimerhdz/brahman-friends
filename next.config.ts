import type { NextConfig } from "next";

// El hostname público de R2 depende del bucket (dominio propio o *.r2.dev), así que se deriva de
// R2_PUBLIC_BASE_URL en vez de quedar fijo en el código.
const r2Hostname = process.env.R2_PUBLIC_BASE_URL
  ? new URL(process.env.R2_PUBLIC_BASE_URL).hostname
  : undefined;

const nextConfig: NextConfig = {
  output: "export",
  images: {
    remotePatterns: [
      // Vercel Blob: archivos subidos antes de la migración a R2 (FR-011), se conserva mientras
      // sigan existiendo URLs antiguas en uso.
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
      ...(r2Hostname
        ? [
            {
              protocol: "https" as const,
              hostname: r2Hostname,
            },
          ]
        : []),
    ],
  },
};

export default nextConfig;
