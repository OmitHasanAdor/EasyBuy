"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type CartItem = {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  qty: number;
};

type CartContextType = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "qty">) => void;
  removeItem: (id: number) => void;
  updateQty: (id: number, qty: number) => void;
  totalCount: number;
};

const STORAGE_KEY = "easybuy-cart";
const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

// Load the saved cart when the component mounts
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // ignore corrupted storage
    }
  }, []);

  const persist = (next: CartItem[]) => {
    setItems(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const addItem = (item: Omit<CartItem, "qty">) => {
    const existing = items.find((i) => i.id === item.id);
    if (existing) {
      persist(items.map((i) => (i.id === item.id ? { ...i, qty: i.qty + 1 } : i)));
    } else {
      persist([...items, { ...item, qty: 1 }]);
    }
  };

  const removeItem = (id: number) => persist(items.filter((i) => i.id !== id));

  const updateQty = (id: number, qty: number) => {
    if (qty <= 0) return removeItem(id);
    persist(items.map((i) => (i.id === id ? { ...i, qty } : i)));
  };

  const totalCount = items.reduce((sum, i) => sum + i.qty, 0);

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