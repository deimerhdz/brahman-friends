export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Este entorno no tiene ruta IPv6 de salida: sin esto, fetch() a veces
    // elige primero una dirección IPv6 de Neon y se cuelga hasta ETIMEDOUT
    // en vez de fallar rápido o usar IPv4.
    const dns = await import("node:dns");
    dns.setDefaultResultOrder("ipv4first");
  }
}
