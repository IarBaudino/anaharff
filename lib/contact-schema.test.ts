import { describe, expect, it } from "vitest";
import { contactFormSchema } from "@/lib/contact-schema";

const validPayload = {
  nombre: "Ana Test",
  email: "ana@example.com",
  tipoConsulta: "tienda",
  preferenciaContacto: "email" as const,
  mensaje: "Hola, quisiera consultar por una impresión en formato grande.",
  consentimiento: true as const,
  website: "",
};

describe("contactFormSchema", () => {
  it("acepta un envío válido", () => {
    const parsed = contactFormSchema.safeParse(validPayload);
    expect(parsed.success).toBe(true);
  });

  it("rechaza mensaje corto", () => {
    const parsed = contactFormSchema.safeParse({
      ...validPayload,
      mensaje: "Hola",
    });
    expect(parsed.success).toBe(false);
  });

  it("rechaza honeypot", () => {
    const parsed = contactFormSchema.safeParse({
      ...validPayload,
      website: "spam-bot",
    });
    expect(parsed.success).toBe(false);
  });

  it("exige consentimiento", () => {
    const parsed = contactFormSchema.safeParse({
      ...validPayload,
      consentimiento: false,
    });
    expect(parsed.success).toBe(false);
  });
});
