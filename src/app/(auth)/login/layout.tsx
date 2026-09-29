import type { Metadata } from "next";
import type { ReactNode } from "react";

// The page is a Client Component, which can't export metadata itself
export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your EasyBuy account to shop, track orders and manage your store.",
};

export default function LoginLayout({ children }: { children: ReactNode }) {
  return children;
}
