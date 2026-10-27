/**
 * First-party, server-side COD quote. Values supplied by a browser are never
 * authoritative for price, availability, item names, or delivery fees.
 */
export interface CatalogProduct {
  id: string;
  name: { fr: string; ar?: string; en?: string };
  price: number;
  image: string;
  isActive?: boolean | string;
  inStock?: boolean;
  stockStatus?: string;
}

export interface PricedOrder {
  fullName: string;
  phoneNumber: string;
  city: string;
  deliveryAddress: string;
  notes: string;
  items: Array<{
    productId: string;
    productName: string;
    image: string;
    price: number;
    quantity: number;
    selectedSize?: string;
    selectedColor?: string;
  }>;
  subtotal: number;
  shippingCost: number;
  finalTotal: number;
  total: number;
  freeShipping: boolean;
}

export type QuoteResult =
  | { ok: true; order: PricedOrder }
  | { ok: false; status: 400 | 409; error: string };

const text = (value: unknown, max: number) =>
  typeof value === 'string' && value.trim().length <= max ? value.trim() : '';

const money = (cents: number) => Math.round(cents) / 100;
const matches = (provided: unknown, expected: number) =>
  typeof provided === 'number' && Number.isFinite(provided) && Math.abs(provided - expected) < 0.011;

export function quoteOrder(data: unknown, catalog: readonly CatalogProduct[]): QuoteResult {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return { ok: false, status: 400, error: 'Invalid order payload' };
  }
  const request = data as Record<string, unknown>;
  const fullName = text(request.fullName, 120);
  const phoneNumber = text(request.phoneNumber, 32).replace(/[.\s-]/g, '');
  const city = text(request.city, 100);
  const deliveryAddress = text(request.deliveryAddress, 300);
  const notes = request.notes === undefined ? '' : text(request.notes, 1000);
  if (fullName.length < 3 || !/^(?:(?:\+|00)212|0)[5-7][0-9]{8}$/.test(phoneNumber) ||
      !city || deliveryAddress.length < 5 || (request.notes !== undefined && typeof request.notes !== 'string')) {
    return { ok: false, status: 400, error: 'Invalid customer or delivery information' };
  }
  if (!Array.isArray(request.items) || request.items.length < 1 || request.items.length > 30) {
    return { ok: false, status: 400, error: 'Invalid item count' };
  }

  const catalogById = new Map(catalog.map(product => [product.id, product]));
  const items: PricedOrder['items'] = [];
  let subtotalCents = 0;
  for (const item of request.items as unknown[]) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      return { ok: false, status: 400, error: 'Invalid cart item' };
    }
    const raw = item as Record<string, unknown>;
    const id = text(raw.productId, 100);
    const quantity = raw.quantity;
    if (!id || typeof quantity !== 'number' || !Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
      return { ok: false, status: 400, error: 'Invalid product or quantity' };
    }
    const product = catalogById.get(id);
    if (!product || product.isActive === false || product.isActive === 'FALSE' ||
        product.inStock === false || product.stockStatus === 'out_of_stock' ||
        !Number.isFinite(product.price) || product.price <= 0 || product.price > 50000) {
      return { ok: false, status: 409, error: 'Product unavailable or price changed. Refresh your cart.' };
    }
    const unitCents = Math.round(product.price * 100);
    subtotalCents += unitCents * quantity;
    if (!Number.isSafeInteger(subtotalCents) || subtotalCents > 10_000_000) {
      return { ok: false, status: 400, error: 'Order exceeds allowed value' };
    }
    const selectedSize = text(raw.selectedSize, 60);
    const selectedColor = text(raw.selectedColor, 60);
    items.push({
      productId: product.id,
      productName: product.name.fr,
      image: product.image,
      price: money(unitCents),
      quantity,
      ...(selectedSize ? { selectedSize } : {}),
      ...(selectedColor ? { selectedColor } : {})
    });
  }
  const subtotal = money(subtotalCents);
  const shippingCost = subtotalCents >= 50000 ? 0 : 35;
  const total = money(subtotalCents + shippingCost * 100);

  // Never silently confirm one amount on screen and save another in D1.
  if (!matches(request.total, total) ||
      (request.subtotal !== undefined && !matches(request.subtotal, subtotal)) ||
      (request.shippingCost !== undefined && !matches(request.shippingCost, shippingCost))) {
    return { ok: false, status: 409, error: 'Price or shipping changed. Please reload your cart.' };
  }
  return {
    ok: true,
    order: {
      fullName, phoneNumber, city, deliveryAddress, notes, items, subtotal,
      shippingCost, total, finalTotal: total, freeShipping: shippingCost === 0
    }
  };
}
