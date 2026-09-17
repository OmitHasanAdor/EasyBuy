// Keep in sync with easybuy-server/src/lib/orders.ts

export const ORDER_STATUSES = ["PENDING", "SHIPPED", "DELIVERED", "CANCELLED"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

// An order only moves forward; DELIVERED and CANCELLED are final and an
// order can only be cancelled before it is delivered.
export const ORDER_TRANSITIONS: Record<OrderStatus, readonly OrderStatus[]> = {
  PENDING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED", "CANCELLED"],
  DELIVERED: [],
  CANCELLED: [],
};

export function nextStatuses(status: string): readonly OrderStatus[] {
  return ORDER_TRANSITIONS[status as OrderStatus] ?? [];
}
