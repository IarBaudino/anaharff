import { describe, expect, it } from "vitest";
import type { OrderRecord } from "@/lib/commerce-types";
import { ordersToCsv } from "@/lib/orders-csv";

describe("ordersToCsv", () => {
  it("genera encabezados y escapa comillas", () => {
    const orders: (OrderRecord & { id: string })[] = [
      {
        id: "ord-1",
        status: "aprobado",
        items: [{ id: "p1", title: 'Obra "Única"', quantity: 1, unit_price: 1000, currency_id: "ARS" }],
        total: 1000,
        currency_id: "ARS",
        customerUid: "u1",
        customerEmail: "cliente@example.com",
        payerName: "Cliente",
        mercadoPagoPaymentId: "123",
        mercadoPagoPreferenceId: "pref",
        mercadoPagoStatus: "approved",
        externalReference: null,
        createdAt: new Date("2026-06-01T12:00:00.000Z"),
        updatedAt: new Date("2026-06-01T12:00:00.000Z"),
      },
    ];

    const csv = ordersToCsv(orders);
    expect(csv.split("\n")[0]).toContain("cliente_email");
    expect(csv).toContain('"Obra ""Única"" x1"');
    expect(csv).toContain("cliente@example.com");
  });
});
