import type { Metadata } from "next";
import type { ReactNode } from "react";

// The page is a Client Component, which can't export metadata itself
export const metadata: Metadata = {
  title: "Wishlist",
};

export default function BuyerWishlistLayout({ children }: { children: ReactNode }) {
  return children;
}
