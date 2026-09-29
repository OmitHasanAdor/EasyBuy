import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "My AI Looks",
  description: "View and manage your AI Virtual Trial Room outfits and saved looks.",
};

export default function LooksLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
