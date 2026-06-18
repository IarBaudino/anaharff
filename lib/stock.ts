import type { CheckoutLineItem } from "@/lib/commerce-types";
import { SHIPPING_LINE_ITEM_ID } from "@/lib/shipping";
import type { StoreItem } from "@/lib/site-content";

export type StockInfo = { limited: boolean; available: number | null };

/** `null` en el producto = sin límite de stock. */
export function normalizeStockValue(raw: unknown): number | null {
  if (raw === null || raw === undefined || raw === "") return null;
  const n = typeof raw === "number" ? raw : Number(raw);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.floor(n);
}

export function getStockInfo(item: Pick<StoreItem, "stock">): StockInfo {
  const stock = normalizeStockValue(item.stock);
  if (stock === null) return { limited: false, available: null };
  return { limited: true, available: stock };
}

export function isProductSoldOut(item: Pick<StoreItem, "stock">): boolean {
  const { limited, available } = getStockInfo(item);
  return limited && available === 0;
}

export function stockBadgeText(item: Pick<StoreItem, "stock">): string | null {
  const { limited, available } = getStockInfo(item);
  if (!limited || available === null) return null;
  if (available === 0) return "Agotado";
  if (available === 1) return "Última unidad";
  return `${available} disponibles`;
}

export function validateCheckoutStock(
  catalog: StoreItem[],
  lines: CheckoutLineItem[]
): string | null {
  const byId = new Map(catalog.map((p) => [p.id, p]));
  const qtyNeeded = new Map<string, number>();

  for (const line of lines) {
    if (line.id === SHIPPING_LINE_ITEM_ID) continue;
    const q = Math.max(1, Math.round(line.quantity || 1));
    qtyNeeded.set(line.id, (qtyNeeded.get(line.id) ?? 0) + q);
  }

  for (const [id, qty] of qtyNeeded) {
    const product = byId.get(id);
    if (!product) {
      return "Uno de los productos del carrito ya no está disponible.";
    }
    const { limited, available } = getStockInfo(product);
    if (limited && available !== null && qty > available) {
      return available === 0
        ? `«${product.titulo}» está agotado.`
        : `Solo quedan ${available} unidad(es) de «${product.titulo}».`;
    }
  }

  return null;
}
