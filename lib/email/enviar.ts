import { Resend } from "resend";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { request as requestTable } from "@/lib/db/schema";
import { env } from "@/lib/config/env";

function bodyHtml(code: string): string {
  return `
    <p><strong>ES</strong> — Solicitud registrada. Código: <strong>${code}</strong>.
    El equipo comercial va a responder con la cotización por fuera de este sistema.</p>
    <p><strong>EN</strong> — Request received. Code: <strong>${code}</strong>.
    Our sales team will follow up with a quote outside this system.</p>
  `;
}

/**
 * Notifica al cliente y al administrador, en ambos idiomas, después de
 * responder al cliente (FR-056, FR-056a, RN20a). Su resultado no afecta la
 * respuesta del registro de la solicitud: se dispara y se olvida, y guarda
 * su propio estado.
 */
export async function sendRequestNotifications(requestId: string): Promise<void> {
  const [req] = await db
    .select()
    .from(requestTable)
    .where(eq(requestTable.id, requestId))
    .limit(1);
  if (!req) return;

  try {
    const resend = new Resend(env.resendApiKey);
    const html = bodyHtml(req.code);
    const subject = `Brahman Friends — ${req.code}`;

    const recipients = [req.contactEmail, env.adminNotifyEmail].filter(
      (email): email is string => !!email,
    );

    await Promise.all(
      recipients.map((to) =>
        resend.emails.send({
          from: "Brahman Friends <no-reply@brahmanfriends.com>",
          to,
          subject,
          html,
        }),
      ),
    );

    await db
      .update(requestTable)
      .set({
        notificationStatus: "sent",
        notificationAttempts: req.notificationAttempts + 1,
      })
      .where(eq(requestTable.id, requestId));
  } catch (error) {
    await db
      .update(requestTable)
      .set({
        notificationStatus: "failed",
        notificationAttempts: req.notificationAttempts + 1,
      })
      .where(eq(requestTable.id, requestId));
    throw error;
  }
}
