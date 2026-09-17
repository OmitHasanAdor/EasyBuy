import type { Metadata } from "next";
import type { ReactNode } from "react";

// The page is a Client Component, which can't export metadata itself
export const metadata: Metadata = {
  title: "Shop All Products",
  description: "Browse men's and women's fashion and lifestyle products from approved sellers on EasyBuy.",
};

export default function ProductsLayout({ children }: { children: ReactNode }) {
  return children;
}
