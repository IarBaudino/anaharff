import type { Timestamp } from "firebase/firestore";

export type OrderStatus =
  | "pendiente"
  | "aprobado"
  | "rechazado"
  | "en_preparacion"
  | "completado"
  | "cancelado";

import type { ShippingAddress } from "@/lib/shipping";

export interface CheckoutLineItem {
  id: string;
  title: string;
  quantity: number;
  unit_price: number;
  currency_id: string;
  description?: string;
  picture_url?: string;
}

export interface OrderShipping {
  zona: string;
  zonaLabel: string;
  cost: number;
  address: ShippingAddress;
}

export interface CheckoutSession {
  preferenceId: string;
  items: CheckoutLineItem[];
  customerUid: string | null;
  customerEmail: string | null;
  shipping?: OrderShipping;
  status: "pendiente" | "expirado";
  createdAt: Timestamp | Date;
  amount?: number;
}

export interface OrderRecord {
  status: OrderStatus;
  items: CheckoutLineItem[];
  total: number;
  currency_id: string;
  customerUid: string | null;
  customerEmail: string | null;
  payerName: string | null;
  shipping?: OrderShipping;
  mercadoPagoPaymentId: string | null;
  mercadoPagoPreferenceId: string | null;
  mercadoPagoStatus: string | null;
  externalReference: string | null;
  notasAdmin?: string;
  /** Evita reenviar el mismo mail de estado de pago (pendiente / aprobado / rechazado). */
  lastEmailNotifiedStatus?: OrderStatus | null;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}

export interface CustomerRecord {
  uid: string;
  email: string;
  nombre?: string;
  telefono?: string;
  envio?: ShippingAddress;
  createdAt: Timestamp | Date;
  ordersCount?: number;
  lastOrderAt?: Timestamp | Date | null;
}
