import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { env } from "@/lib/config/env";
import * as schema from "./schema";

/**
 * Driver HTTP de Neon (no el Pool por WebSocket): en Vercel, `ws` depende de
 * un addon nativo (`bufferutil`) que falla en entornos serverless
 * ("bufferUtil.mask is not a function", comprobado en local). El driver
 * HTTP no soporta transacciones interactivas, así que las rutas que
 * necesitan atomicidad usan `db.batch(...)` en su lugar (ver
 * app/api/solicitudes/route.ts y app/api/panel/solicitudes/[id]/estado/route.ts).
 */
let instance: NeonHttpDatabase<typeof schema> | undefined;

function getDb(): NeonHttpDatabase<typeof schema> {
  if (!instance) {
    instance = drizzle(neon(env.databaseUrl), { schema });
  }
  return instance;
}

export const db: NeonHttpDatabase<typeof schema> = new Proxy(
  {} as NeonHttpDatabase<typeof schema>,
  {
    get(_target, prop, receiver) {
      return Reflect.get(getDb(), prop, receiver);
    },
  },
);
