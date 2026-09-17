import type { Metadata } from "next";
import type { ReactNode } from "react";

// The page is a Client Component, which can't export metadata itself
export const metadata: Metadata = {
  title: "Trending Now",
  description: "See what shoppers across Bangladesh are looking at on EasyBuy.",
};

export default function TrendingLayout({ children }: { children: ReactNode }) {
  return children;
}
