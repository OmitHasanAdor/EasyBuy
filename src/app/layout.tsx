import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import Providers from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Playfair Display ফন্টটি এখানে ডিফাইন করুন
const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EasyBuy - Your One-Stop Marketplace",
  description: "EasyBuy is your one-stop marketplace for men's and women's fashion, offering curated sellers, fair prices, and fast delivery across Bangladesh.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>
          <Navbar />
          <main>{children}</main>
          <Footer />
          <Toaster position="bottom-center" richColors />
        </Providers>
      </body>
    </html>
  );
}