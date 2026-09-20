import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Sin caché incremental: las páginas son dinámicas (force-dynamic) y no se usa ISR/revalidate.
// Si más adelante se necesita, ver https://opennext.js.org/cloudflare/caching
export default defineCloudflareConfig();
