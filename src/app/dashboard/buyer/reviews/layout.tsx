import type { Metadata } from "next";
import type { ReactNode } from "react";

// The page is a Client Component, which can't export metadata itself
export const metadata: Metadata = {
  title: "My Reviews",
};

export default function BuyerReviewsLayout({ children }: { children: ReactNode }) {
  return children;
}
