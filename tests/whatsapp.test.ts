import { describe, it, expect } from "vitest";
import { numeroWhatsApp, enlaceWhatsApp } from "@/lib/ajustes/whatsapp";

type Red = { id: string; platform: "whatsapp" | "youtube"; url: string };

function ajustes(socialLinks: Red[], contactPhone: string | null = null) {
  return { contactPhone, socialLinks };
}

const wa = (url: string): Red => ({ id: "1", platform: "whatsapp", url });

describe("numeroWhatsApp (FR-027)", () => {
  it("lee el número de un enlace wa.me", () => {
    expect(numeroWhatsApp(ajustes([wa("https://wa.me/573001234567")]))).toBe(
      "573001234567",
    );
  });

  it("lee el número de api.whatsapp.com/send?phone=", () => {
    expect(
      numeroWhatsApp(
        ajustes([
          wa("https://api.whatsapp.com/send?phone=573001234567&text=hola"),
        ]),
      ),
    ).toBe("573001234567");
  });

  it("lee el número de whatsapp://send?phone=", () => {
    expect(
      numeroWhatsApp(ajustes([wa("whatsapp://send?phone=%2B573001234567")])),
    ).toBe("573001234567");
  });

  it("usa el teléfono de contacto si no hay red de WhatsApp", () => {
    expect(numeroWhatsApp(ajustes([], "+57 300 123 4567"))).toBe(
      "573001234567",
    );
  });

  it("cae al teléfono de contacto si el enlace no trae número", () => {
    expect(
      numeroWhatsApp(
        ajustes([wa("https://chat.whatsapp.com/AbCdEf")], "+57 300 123 4567"),
      ),
    ).toBe("573001234567");
  });

  it("ignora otras redes sociales", () => {
    expect(
      numeroWhatsApp(
        ajustes([
          { id: "2", platform: "youtube", url: "https://wa.me/573001234567" },
        ]),
      ),
    ).toBeNull();
  });

  it("devuelve null si no hay nada configurado", () => {
    expect(numeroWhatsApp(ajustes([]))).toBeNull();
  });

  it("devuelve null con un número demasiado corto", () => {
    expect(numeroWhatsApp(ajustes([], "12345"))).toBeNull();
  });
});

describe("enlaceWhatsApp", () => {
  it("codifica saltos de línea y tildes", () => {
    expect(
      enlaceWhatsApp("573001234567", "Hola, quiero cotizar:\n• 1 × Gorra"),
    ).toBe(
      "https://wa.me/573001234567?text=Hola%2C%20quiero%20cotizar%3A%0A%E2%80%A2%201%20%C3%97%20Gorra",
    );
  });
});
