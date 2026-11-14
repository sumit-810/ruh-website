type Line = { handle: string; variantId: string; qty: number };
export declare const deliveryFor: (subtotal: number) => number;
export declare const quote: (
  lines: Line[],
  opts?: { paymentMethod?: 'online' | 'cod' },
) => { items: any[]; subtotal: number; delivery: number; codFee: number; total: number; currency: string; freeDeliveryRemaining: number | null; errors: string[] };
