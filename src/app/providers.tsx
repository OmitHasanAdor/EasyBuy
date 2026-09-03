"use client";

import { ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client";
import { CartProvider } from "@/lib/cart-context";
import { WishlistProvider } from "@/lib/wishlist";

// Keep client providers in one place
export default function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <WishlistProvider>{children}</WishlistProvider>
      </CartProvider>
    </QueryClientProvider>
  );
}