"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import { authFetch } from "@/lib/auth-fetch";
import { API_URL } from "@/config/api";

// Supports product variants in the cart
export type CartItem = {
  cartItemId?: number; 
  id: number; 
  variantId: number | null;
  name: string;
  price: number;
  imageUrl: string;
  size?: string | null;
  color?: string | null;
  qty: number;
};

type AddItemInput = Omit<CartItem, "qty" | "cartItemId"> & { qty?: number };

type CartContextType = {
  items: CartItem[];
  addItem: (item: AddItemInput) => boolean;
  removeItem: (productId: number, variantId?: number | null) => boolean;
  updateQty: (productId: number, qty: number, variantId?: number | null) => boolean;
  totalCount: number;
};

const STORAGE_KEY = "easybuy-cart";
const CartContext = createContext<CartContextType | null>(null);

function readLocalCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeLocalCart(items: CartItem[]): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    return true;
  } catch {
    return false;
  }
}

// Maps API cart data to the UI shape
type ServerCartRow = {
  id: number;
  productId: number;
  variantId: number | null;
  quantity: number;
  product: { name: string; price: number; images: string[] };
  variant: { size: string | null; color: string | null } | null;
};

function serverRowToCartItem(row: ServerCartRow): CartItem {
  return {
    cartItemId: row.id,
    id: row.productId,
    variantId: row.variantId,
    name: row.product.name,
    price: row.product.price,
    imageUrl: row.product.images?.[0] ?? "",
    size: row.variant?.size ?? null,
    color: row.variant?.color ?? null,
    qty: row.quantity,
  };
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { data: session, isPending: sessionLoading } = authClient.useSession();
  const userId = session?.user?.id ?? null;
  const queryClient = useQueryClient();

  // Guest cart
  const [guestItems, setGuestItems] = useState<CartItem[]>([]);
  useEffect(() => {
    setGuestItems(readLocalCart());
  }, []);

  // Logged-in cart 
  const { data: serverRows = [] } = useQuery<ServerCartRow[]>({
    queryKey: ["cart", userId],
    queryFn: () => authFetch(`${API_URL}/api/cart`).then((res) => res.json()),
    enabled: !!userId,
  });
  const serverItems = serverRows.map(serverRowToCartItem);

// Merge guest cart after login
  const mergedRef = useRef(false);
  useEffect(() => {
    if (!userId || mergedRef.current) return;
    mergedRef.current = true;
    const local = readLocalCart();
    if (local.length === 0) return;

    Promise.all(
      local.map((item) =>
        authFetch(`${API_URL}/api/cart`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId: item.id,
            variantId: item.variantId,
            quantity: item.qty,
          }),
        })
      )
    ).then(() => {
      localStorage.removeItem(STORAGE_KEY);
      queryClient.invalidateQueries({ queryKey: ["cart", userId] });
    });
  }, [userId, queryClient]);

  const items = userId ? serverItems : guestItems;

  const addItem = useCallback(
    (item: AddItemInput): boolean => {
      const qty = item.qty ?? 1;
      const variantId = item.variantId ?? null;

      if (userId) {
        authFetch(`${API_URL}/api/cart`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: item.id, variantId, quantity: qty }),
        })
          .catch(() => {})
          .finally(() => queryClient.invalidateQueries({ queryKey: ["cart", userId] }));
        return true;
      }

      const existing = guestItems.find((i) => i.id === item.id && i.variantId === variantId);
      const next = existing
        ? guestItems.map((i) =>
            i.id === item.id && i.variantId === variantId ? { ...i, qty: i.qty + qty } : i
          )
        : [...guestItems, { ...item, variantId, qty }];
      if (!writeLocalCart(next)) return false;
      setGuestItems(next);
      return true;
    },
    [userId, guestItems, queryClient]
  );

  const removeItem = useCallback(
    (productId: number, variantId: number | null = null): boolean => {
      if (userId) {
        const row = serverRows.find((r) => r.productId === productId && r.variantId === variantId);
        if (!row) return false;
        authFetch(`${API_URL}/api/cart/${row.id}`, { method: "DELETE" })
          .catch(() => {})
          .finally(() => queryClient.invalidateQueries({ queryKey: ["cart", userId] }));
        return true;
      }
      const next = guestItems.filter((i) => !(i.id === productId && i.variantId === variantId));
      if (!writeLocalCart(next)) return false;
      setGuestItems(next);
      return true;
    },
    [userId, guestItems, serverRows, queryClient]
  );

  const updateQty = useCallback(
    (productId: number, qty: number, variantId: number | null = null): boolean => {
      if (qty <= 0) return removeItem(productId, variantId);

      if (userId) {
        const row = serverRows.find((r) => r.productId === productId && r.variantId === variantId);
        if (!row) return false;
        authFetch(`${API_URL}/api/cart/${row.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quantity: qty }),
        })
          .catch(() => {})
          .finally(() => queryClient.invalidateQueries({ queryKey: ["cart", userId] }));
        return true;
      }

      const next = guestItems.map((i) =>
        i.id === productId && i.variantId === variantId ? { ...i, qty } : i
      );
      if (!writeLocalCart(next)) return false;
      setGuestItems(next);
      return true;
    },
    [userId, guestItems, serverRows, removeItem]
  );

  const totalCount = items.reduce((sum, i) => sum + i.qty, 0);

  if (sessionLoading) {
    return (
      <CartContext.Provider
        value={{ items: [], addItem: () => false, removeItem: () => false, updateQty: () => false, totalCount: 0 }}
      >
        {children}
      </CartContext.Provider>
    );
  }

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQty, totalCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}