import type { Metadata } from "next";
import type { ReactNode } from "react";

// The page is a Client Component, which can't export metadata itself
export const metadata: Metadata = {
  title: "Create Account",
  description: "Create a free EasyBuy account and start shopping from independent sellers across Bangladesh.",
};

export default function SignUpLayout({ children }: { children: ReactNode }) {
  return children;
}
