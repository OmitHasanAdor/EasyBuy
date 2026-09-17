"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { authFetch } from "@/lib/auth-fetch";
import { API_URL } from "@/config/api";
import { unitPrice } from "@/lib/pricing";

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
  // resolves to false (after showing why) when the item could not be added
  addItem: (item: AddItemInput) => Promise<boolean>;
  removeItem: (productId: number, variantId?: number | null) => boolean;
  updateQty: (productId: number, qty: number, variantId?: number | null) => boolean;
  totalCount: number;
};

const STORAGE_KEY = "easybuy-cart";
const CartContext = createContext<CartContextType | null>(null);

const CART_ERROR = "Couldn't update your cart. Please try again.";

// Shows the API's reason (e.g. "Only 3 in stock") when a cart change is refused
async function isCartRequestOk(res: Response) {
  if (res.ok) return true;
  const data = await res.json().catch(() => null);
  toast.error(data?.error || CART_ERROR);
  return false;
}

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
  product: {
    name: string;
    price: number;
    images: string[];
    discountPercent: number | null;
    saleEndsAt: string | null;
  };
  variant: { size: string | null; color: string | null; price: number | null } | null;
};

function serverRowToCartItem(row: ServerCartRow): CartItem {
  return {
    cartItemId: row.id,
    id: row.productId,
    variantId: row.variantId,
    name: row.product?.name ?? "",
    // same unit price the checkout charges (variant override + running sale)
    price: row.product ? unitPrice(row.product, row.variant?.price) : 0,
    imageUrl: row.product?.images?.[0] ?? "",
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
 const [guestItems, setGuestItems] = useState<CartItem[]>(() => readLocalCart());
  useEffect(() => {
    setGuestItems(readLocalCart());
  }, []);

  // Logged-in cart (Safe API Fetching)
  const { data: serverRows = [] } = useQuery<ServerCartRow[]>({
    queryKey: ["cart", userId],
    queryFn: async () => {
      const res = await authFetch(`${API_URL}/api/cart`);
      const data = await res.json();

      // Check all common response wrapper formats
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.data)) return data.data;
      if (Array.isArray(data?.items)) return data.items;
      if (Array.isArray(data?.cart)) return data.cart;

      return [];
    },
    enabled: !!userId,
  });

  // Safety Fallback check
 const safeServerRows = useMemo(
  () => (Array.isArray(serverRows) ? serverRows : []),
  [serverRows]
);
  const serverItems = safeServerRows.map(serverRowToCartItem);

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
    async (item: AddItemInput): Promise<boolean> => {
      const qty = item.qty ?? 1;
      const variantId = item.variantId ?? null;

      if (userId) {
        // wait for the server: it may refuse because of stock (EB-07)
        try {
          const res = await authFetch(`${API_URL}/api/cart`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId: item.id, variantId, quantity: qty }),
          });
          return await isCartRequestOk(res);
        } catch {
          toast.error(CART_ERROR);
          return false;
        } finally {
          queryClient.invalidateQueries({ queryKey: ["cart", userId] });
        }
      }

      const existing = guestItems.find((i) => i.id === item.id && i.variantId === variantId);
      const next = existing
        ? guestItems.map((i) =>
            i.id === item.id && i.variantId === variantId ? { ...i, qty: i.qty + qty } : i
          )
        : [...guestItems, { ...item, variantId, qty }];
      if (!writeLocalCart(next)) {
        toast.error(CART_ERROR);
        return false;
      }
      setGuestItems(next);
      return true;
    },
    [userId, guestItems, queryClient]
  );

  const removeItem = useCallback(
    (productId: number, variantId: number | null = null): boolean => {
      if (userId) {
        const row = safeServerRows.find((r) => r.productId === productId && r.variantId === variantId);
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
    [userId, guestItems, safeServerRows, queryClient]
  );

const updateQty = useCallback(
  (productId: number, qty: number, variantId: number | null = null): boolean => {
      if (qty <= 0) return removeItem(productId, variantId);

      if (userId) {
        const row = safeServerRows.find((r) => r.productId === productId && r.variantId === variantId);
        if (!row) return false;
        authFetch(`${API_URL}/api/cart/${row.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quantity: qty }),
        })
          .then(isCartRequestOk)
          .catch(() => toast.error(CART_ERROR))
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
   [userId, guestItems, safeServerRows, removeItem, queryClient]
  );

  const totalCount = items.reduce((sum, i) => sum + i.qty, 0);

  if (sessionLoading) {
    return (
      <CartContext.Provider
        value={{ items: [], addItem: async () => false, removeItem: () => false, updateQty: () => false, totalCount: 0 }}
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