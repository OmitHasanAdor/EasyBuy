import type { Metadata } from "next";
import type { ReactNode } from "react";

// The page is a Client Component, which can't export metadata itself.
// Keep the site template for the success/fail/cancel pages below.
export const metadata: Metadata = {
  title: { template: "%s | EasyBuy", default: "Checkout" },
  robots: { index: false },
};

export default function CheckoutLayout({ children }: { children: ReactNode }) {
  return children;
}
