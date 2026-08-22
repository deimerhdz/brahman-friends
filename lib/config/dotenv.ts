import { config } from "dotenv";

// Los scripts de línea de comandos (drizzle-kit, migrate, crear-admin) no pasan
// por el cargador de variables de entorno de Next.js, así que lo hacen a mano.
config({ path: ".env.local" });
