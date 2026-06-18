import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase-admin";
import type { CheckoutLineItem, OrderShipping } from "@/lib/commerce-types";
import { getServerSiteContent } from "@/lib/site-content-server";
import { validateCheckoutStock } from "@/lib/stock";
import {
  normalizeShippingAddress,
  shippingCostForZone,
  shippingZoneLabel,
  SHIPPING_LINE_ITEM_ID,
  validateShippingAddress,
  type ShippingAddress,
} from "@/lib/shipping";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function POST(request: NextRequest) {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!accessToken) {
    return NextResponse.json(
      {
        error:
          "Los pagos no están activos en el sitio todavía. Contactá a quien administra la tienda.",
      },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { items, customerUid, customerEmail, shipping } = body as {
      items: CheckoutLineItem[];
      customerUid?: string | null;
      customerEmail?: string | null;
      shipping?: {
        zona: ShippingAddress["zona"];
        zonaLabel?: string;
        cost?: number;
        address: ShippingAddress;
      } | null;
    };

    if (!customerUid) {
      return NextResponse.json(
        { error: "Tenés que iniciar sesión para comprar impresiones con envío." },
        { status: 401 }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Se requiere al menos un item" }, { status: 400 });
    }

    if (!shipping?.address) {
      return NextResponse.json({ error: "Faltan los datos de envío." }, { status: 400 });
    }

    const addressError = validateShippingAddress(shipping.address);
    if (addressError) {
      return NextResponse.json({ error: addressError }, { status: 400 });
    }

    const normalizedAddress = normalizeShippingAddress(shipping.address)!;
    const site = await getServerSiteContent();
    const expectedShippingCost = shippingCostForZone(site.tienda.envios, normalizedAddress.zona);

    const productItems = items.filter((item) => item.id !== SHIPPING_LINE_ITEM_ID);
    if (!productItems.length) {
      return NextResponse.json({ error: "Se requiere al menos un producto." }, { status: 400 });
    }

    const normalizedItems: CheckoutLineItem[] = productItems.map(
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

    const stockError = validateCheckoutStock(site.tienda.items, normalizedItems);
    if (stockError) {
      return NextResponse.json({ error: stockError }, { status: 400 });
    }

    if (expectedShippingCost > 0) {
      normalizedItems.push({
        id: SHIPPING_LINE_ITEM_ID,
        title: `Envío — ${shippingZoneLabel(normalizedAddress.zona)}`,
        quantity: 1,
        unit_price: expectedShippingCost,
        currency_id: "ARS",
        description: "Costo de envío de la impresión",
      });
    } else if (items.some((item) => item.id === SHIPPING_LINE_ITEM_ID)) {
      return NextResponse.json({ error: "El costo de envío no coincide." }, { status: 400 });
    }

    const clientShippingLine = items.find((item) => item.id === SHIPPING_LINE_ITEM_ID);
    if (expectedShippingCost > 0) {
      if (!clientShippingLine || Number(clientShippingLine.unit_price) !== expectedShippingCost) {
        return NextResponse.json({ error: "El costo de envío no coincide." }, { status: 400 });
      }
    }

    const orderShipping: OrderShipping = {
      zona: normalizedAddress.zona,
      zonaLabel: shippingZoneLabel(normalizedAddress.zona),
      cost: expectedShippingCost,
      address: normalizedAddress,
    };

    const metadata: Record<string, string> = {
      customer_uid: String(customerUid),
    };
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
      metadata,
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
        shipping: orderShipping,
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
