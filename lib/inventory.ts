import type { Firestore } from "firebase-admin/firestore";
import type { CheckoutLineItem } from "@/lib/commerce-types";
import { SHIPPING_LINE_ITEM_ID } from "@/lib/shipping";
import { mergeSiteContentFromFirestore, type SiteContent } from "@/lib/site-content";
import { normalizeStockValue } from "@/lib/stock";

const CONTENT_DOC = "site/content";

/** Descuenta stock en `site/content` cuando un pago queda aprobado. */
export async function decrementProductStock(
  db: Firestore,
  items: CheckoutLineItem[]
): Promise<void> {
  const snap = await db.doc(CONTENT_DOC).get();
  if (!snap.exists) return;

  const content = mergeSiteContentFromFirestore(snap.data() as Partial<SiteContent>);
  const nextItems = content.tienda.items.map((item) => ({ ...item }));
  const byId = new Map(nextItems.map((p) => [p.id, p]));
  let changed = false;

  for (const line of items) {
    if (line.id === SHIPPING_LINE_ITEM_ID) continue;
    const product = byId.get(line.id);
    if (!product) continue;
    const current = normalizeStockValue(product.stock);
    if (current === null) continue;
    const qty = Math.max(1, Math.round(line.quantity || 1));
    const next = Math.max(0, current - qty);
    if (next !== current) {
      product.stock = next;
      changed = true;
    }
  }

  if (!changed) return;

  await db.doc(CONTENT_DOC).set(
    {
      tienda: {
        ...content.tienda,
        items: nextItems,
      },
    },
    { merge: true }
  );
}
