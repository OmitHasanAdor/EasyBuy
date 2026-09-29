import type { Metadata } from "next";
import type { ReactNode } from "react";

// The page is a Client Component, which can't export metadata itself
export const metadata: Metadata = {
  title: "Best Sellers",
  description: "The most popular products on EasyBuy right now.",
};

export default function BestSellersLayout({ children }: { children: ReactNode }) {
  return children;
}
