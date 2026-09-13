import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import { neon, neonConfig } from "@neondatabase/serverless";
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

// El cómputo de Neon se suspende tras un rato sin uso (scale-to-zero): la
// primera consulta después de esa inactividad puede fallar con un
// "fetch failed" a nivel de red mientras el cómputo despierta, y la
// siguiente ya funciona sola (visto en el panel: la primera vez que se crea
// algo tira error, la segunda se guarda). Un solo reintento absorbe ese
// cold start sin ocultar errores reales (los que sí llegan a responder,
// aunque sea con un error HTTP, no se reintentan).
neonConfig.fetchFunction = async (input: RequestInfo | URL, init?: RequestInit) => {
  try {
    return await fetch(input, init);
  } catch {
    return await fetch(input, init);
  }
};

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
