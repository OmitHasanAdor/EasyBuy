import type { Metadata } from "next";
import type { ReactNode } from "react";

// The page is a Client Component, which can't export metadata itself.
// A plain string title here would hide the root "%s | EasyBuy" template
// from product pages below, so repeat the template for them.
export const metadata: Metadata = {
  title: { template: "%s | EasyBuy", default: "Shop All Products" },
  description: "Browse men's and women's fashion and lifestyle products from approved sellers on EasyBuy.",
};

export default function ProductsLayout({ children }: { children: ReactNode }) {
  return children;
}
