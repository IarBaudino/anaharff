import { describe, expect, it } from "vitest";
import type { CheckoutLineItem } from "@/lib/commerce-types";
import type { StoreItem } from "@/lib/site-content";
import {
  getStockInfo,
  isProductSoldOut,
  normalizeStockValue,
  stockBadgeText,
  validateCheckoutStock,
} from "@/lib/stock";

const catalog: StoreItem[] = [
  {
    id: "a",
    titulo: "Obra A",
    descripcion: "",
    precio: 1000,
    imagenUrl: "https://example.com/a.jpg",
    stock: 2,
  },
  {
    id: "b",
    titulo: "Obra B",
    descripcion: "",
    precio: 2000,
    imagenUrl: "https://example.com/b.jpg",
    stock: null,
  },
  {
    id: "c",
    titulo: "Obra C",
    descripcion: "",
    precio: 3000,
    imagenUrl: "https://example.com/c.jpg",
    stock: 0,
  },
];

describe("normalizeStockValue", () => {
  it("null o vacío = sin límite", () => {
    expect(normalizeStockValue(null)).toBeNull();
    expect(normalizeStockValue("")).toBeNull();
  });

  it("redondea hacia abajo", () => {
    expect(normalizeStockValue(3.9)).toBe(3);
  });
});

describe("stock helpers", () => {
  it("detecta agotado", () => {
    expect(isProductSoldOut(catalog[2])).toBe(true);
    expect(isProductSoldOut(catalog[1])).toBe(false);
  });

  it("muestra badge de stock", () => {
    expect(stockBadgeText(catalog[0])).toBe("2 disponibles");
    expect(stockBadgeText(catalog[2])).toBe("Agotado");
    expect(stockBadgeText(catalog[1])).toBeNull();
  });

  it("getStockInfo unlimited", () => {
    expect(getStockInfo(catalog[1])).toEqual({ limited: false, available: null });
  });
});

describe("validateCheckoutStock", () => {
  const line = (id: string, q: number): CheckoutLineItem => ({
    id,
    title: id,
    quantity: q,
    unit_price: 100,
    currency_id: "ARS",
  });

  it("permite cuando hay stock", () => {
    expect(validateCheckoutStock(catalog, [line("a", 2)])).toBeNull();
  });

  it("rechaza si supera stock", () => {
    expect(validateCheckoutStock(catalog, [line("a", 3)])).toMatch(/Solo quedan 2/);
  });

  it("rechaza producto agotado", () => {
    expect(validateCheckoutStock(catalog, [line("c", 1)])).toMatch(/agotado/i);
  });

  it("sin límite en obra B", () => {
    expect(validateCheckoutStock(catalog, [line("b", 99)])).toBeNull();
  });
});
