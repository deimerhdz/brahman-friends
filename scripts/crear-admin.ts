import "../lib/config/dotenv";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { db } from "../lib/db";
import { adminUser } from "../lib/db/schema";
import { hashPassword } from "../lib/auth/password";

// Alta de usuarios del panel por comando: no hay registro público (Assumption 13).
async function main() {
  const rl = createInterface({ input: stdin, output: stdout });
  try {
    const name = await rl.question("Nombre: ");
    const email = await rl.question("Correo: ");
    const password = await rl.question("Contraseña: ");

    if (!name || !email || !password) {
      throw new Error("Nombre, correo y contraseña son obligatorios.");
    }

    await db.insert(adminUser).values({
      name,
      email: email.toLowerCase().trim(),
      passwordHash: hashPassword(password),
    });

    console.log(`Usuario ${email} creado.`);
  } finally {
    rl.close();
  }
}

main().catch((error) => {
  console.error(error.message ?? error);
  process.exit(1);
});
