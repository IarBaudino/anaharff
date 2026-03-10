import { NextRequest, NextResponse } from "next/server";

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
    const { items } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Se requiere al menos un item" },
        { status: 400 }
      );
    }

    const preferenceData = {
      items: items.map((item: { id?: string; title: string; quantity?: number; unit_price: number; description?: string; picture_url?: string }) => ({
        id: item.id || item.title,
        title: item.title,
        quantity: item.quantity || 1,
        unit_price: Number(item.unit_price),
        currency_id: "ARS",
        description: item.description,
        picture_url: item.picture_url,
      })),
      back_urls: {
        success: `${BASE_URL}/tienda/exito`,
        failure: `${BASE_URL}/tienda/error`,
        pending: `${BASE_URL}/tienda/pendiente`,
      },
      auto_return: "approved",
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

    return NextResponse.json({
      preferenceId: result.id,
      initPoint: result.init_point || result.sandbox_init_point,
    });
  } catch (error) {
    console.error("MercadoPago error:", error);
    return NextResponse.json(
      { error: "Error al crear la preferencia de pago" },
      { status: 500 }
    );
  }
}
