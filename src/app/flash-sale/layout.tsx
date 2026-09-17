import type { Metadata } from "next";
import type { ReactNode } from "react";

// The page is a Client Component, which can't export metadata itself
export const metadata: Metadata = {
  title: "Flash Sale",
  description: "Limited-time discounts from EasyBuy sellers. Grab them before the timer runs out.",
};

export default function FlashSaleLayout({ children }: { children: ReactNode }) {
  return children;
}
