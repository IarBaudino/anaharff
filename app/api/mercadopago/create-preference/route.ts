import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase-admin";
import type { CheckoutLineItem } from "@/lib/commerce-types";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function POST(request: NextRequest) {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!accessToken) {
    return NextResponse.json(
      { error: "MercadoPago no configurado. Agregá MERCADOPAGO_ACCESS_TOKEN en .env.local" },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { items, customerUid, customerEmail } = body as {
      items: CheckoutLineItem[];
      customerUid?: string | null;
      customerEmail?: string | null;
    };

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Se requiere al menos un item" }, { status: 400 });
    }

    const normalizedItems: CheckoutLineItem[] = items.map(
      (item: {
        id?: string;
        title: string;
        quantity?: number;
        unit_price: number;
        description?: string;
        picture_url?: string;
      }) => ({
        id: item.id || item.title,
        title: item.title,
        quantity: item.quantity || 1,
        unit_price: Number(item.unit_price),
        currency_id: "ARS",
        description: item.description,
        picture_url: item.picture_url,
      })
    );

    const metadata: Record<string, string> = {};
    if (customerUid) metadata.customer_uid = String(customerUid);
    if (customerEmail) metadata.customer_email = String(customerEmail);

    const preferenceData = {
      items: normalizedItems.map((item) => ({
        id: item.id,
        title: item.title,
        quantity: item.quantity,
        unit_price: item.unit_price,
        currency_id: item.currency_id,
        description: item.description,
        picture_url: item.picture_url,
      })),
      metadata: Object.keys(metadata).length ? metadata : undefined,
      back_urls: {
        success: `${BASE_URL}/tienda/exito`,
        failure: `${BASE_URL}/tienda/error`,
        pending: `${BASE_URL}/tienda/pendiente`,
      },
      auto_return: "approved" as const,
    };

    const res = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(preferenceData),
    });

    const result = await res.json();

    if (!res.ok) {
      console.error("MercadoPago API error:", result);
      return NextResponse.json(
        { error: result.message || "Error al crear la preferencia" },
        { status: res.status }
      );
    }

    const preferenceId = result.id as string;

    const db = getAdminDb();
    if (db) {
      await db.collection("checkout_sessions").doc(preferenceId).set({
        preferenceId,
        items: normalizedItems,
        customerUid: customerUid ?? null,
        customerEmail: customerEmail ?? null,
        status: "pendiente",
        createdAt: FieldValue.serverTimestamp(),
      });
    }

    return NextResponse.json({
      preferenceId,
      initPoint: result.init_point || result.sandbox_init_point,
    });
  } catch (error) {
    console.error("MercadoPago error:", error);
    return NextResponse.json({ error: "Error al crear la preferencia de pago" }, { status: 500 });
  }
}
