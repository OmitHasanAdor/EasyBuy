"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Search, Heart, ShoppingBag, User, Menu, X } from "lucide-react";
import { API_URL } from "@/config/api";
import { useCart } from "@/lib/cart-context";
import { useWishlist } from "@/lib/wishlist";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState("");
  const router = useRouter();
  const { totalCount } = useCart();
  const { count: wishlistCount } = useWishlist();

// Shared cache for category queries
  const { data: categories = [] } = useQuery<string[]>({
    queryKey: ["categories"],
    queryFn: () => fetch(`${API_URL}/api/categories`).then((res) => res.json()),
  });

  const navLinks = [
    ...categories.map((c) => ({ label: c, href: `/products?category=${encodeURIComponent(c)}` })),
    { label: "Sell on EasyBuy", href: "/profile" },
  ];

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!search.trim()) return;
    router.push(`/products?search=${encodeURIComponent(search.trim())}`);
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#E7DCC4] bg-[#F7F2E7]/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3 sm:px-10 lg:px-16">
        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <Image
            src="/logo.png"
            alt="EasyBuy"
            width={36}
            height={36}
            className="h-9 w-9 object-contain"
            priority
          />
          <span className="font-serif text-xl font-medium text-[#2B2420]">
            EasyBuy
          </span>
        </Link>

        {/* Nav links - desktop */}
        <nav className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-[#3A342C] transition-colors hover:text-[#C05620]"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Search bar - desktop */}
        <form onSubmit={submitSearch} className="relative hidden flex-1 max-w-sm items-center md:flex">
          <Search className="pointer-events-none absolute left-3.5 h-4 w-4 text-[#8E3D14]/70" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search for anything"
            className="w-full rounded-full border border-[#E7DCC4] bg-white py-2.5 pl-10 pr-4 text-sm text-[#2B2420] placeholder:text-[#A89A80] outline-none transition-colors focus:border-[#C05620]"
          />
        </form>

        {/* Icons */}
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            aria-label="Search"
            onClick={() => setMobileOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-full text-[#2B2420] transition-colors hover:bg-[#F0E6D2] md:hidden"
          >
            <Search className="h-5 w-5" strokeWidth={1.8} />
          </button>

          <Link
            href="/wishlist"
            aria-label={wishlistCount > 0 ? `Wishlist (${wishlistCount})` : "Wishlist"}
            className="relative hidden h-10 w-10 items-center justify-center rounded-full text-[#2B2420] transition-colors hover:bg-[#F0E6D2] sm:flex"
          >
            <Heart
              className="h-5 w-5"
              strokeWidth={1.8}
              fill={wishlistCount > 0 ? "#8E3D14" : "none"}
            />
            {wishlistCount > 0 && (
              <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#C05620] text-[10px] font-bold text-[#F7F2E7]">
                {wishlistCount > 99 ? "99+" : wishlistCount}
              </span>
            )}
          </Link>

          {/* was a plain button with no destination — now consistent with the wishlist link above */}
          <Link
            href="/cart"
            aria-label={totalCount > 0 ? `Cart (${totalCount})` : "Cart"}
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-[#2B2420] transition-colors hover:bg-[#F0E6D2]"
          >
            <ShoppingBag className="h-5 w-5" strokeWidth={1.8} />
            {totalCount > 0 && (
              <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#C05620] text-[10px] font-bold text-[#F7F2E7]">
                {totalCount > 99 ? "99+" : totalCount}
              </span>
            )}
          </Link>

          <Link
            href="/profile"
            className="ml-1 hidden items-center gap-1.5 rounded-full bg-[#2B2420] px-4 py-2 text-sm font-semibold text-[#F7F2E7] transition-opacity hover:opacity-90 sm:flex"
          >
            <User className="h-4 w-4" strokeWidth={2} />
            Account
          </Link>

          {/* Mobile menu toggle */}
          <button
            aria-label="Toggle menu"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="flex h-10 w-10 items-center justify-center rounded-full text-[#2B2420] transition-colors hover:bg-[#F0E6D2] lg:hidden"
          >
            {mobileOpen ? (
              <X className="h-5 w-5" strokeWidth={1.8} />
            ) : (
              <Menu className="h-5 w-5" strokeWidth={1.8} />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-[#E7DCC4] bg-[#F7F2E7] px-6 py-4 lg:hidden">
          <form onSubmit={submitSearch} className="relative mb-4 flex items-center md:hidden">
            <Search className="pointer-events-none absolute left-3.5 h-4 w-4 text-[#8E3D14]/70" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search for anything"
              className="w-full rounded-full border border-[#E7DCC4] bg-white py-2.5 pl-10 pr-4 text-sm text-[#2B2420] placeholder:text-[#A89A80] outline-none focus:border-[#C05620]"
            />
          </form>

          <nav className="flex flex-col gap-1">
            <Link
              href="/wishlist"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-between rounded-md px-2 py-2.5 text-sm font-medium text-[#3A342C] transition-colors hover:bg-[#F0E6D2] hover:text-[#C05620]"
            >
              <span className="flex items-center gap-2">
                <Heart
                  className="h-4 w-4"
                  strokeWidth={1.8}
                  fill={wishlistCount > 0 ? "#8E3D14" : "none"}
                />
                Wishlist
              </span>

              {wishlistCount > 0 && (
                <span className="rounded-full bg-[#C05620] px-2 py-0.5 text-[10px] font-bold text-white">
                  {wishlistCount > 99 ? "99+" : wishlistCount}
                </span>
              )}
            </Link>

            <Link
              href="/cart"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-between rounded-md px-2 py-2.5 text-sm font-medium text-[#3A342C] transition-colors hover:bg-[#F0E6D2] hover:text-[#C05620]"
            >
              <span className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4" strokeWidth={1.8} />
                Cart
              </span>

              {totalCount > 0 && (
                <span className="rounded-full bg-[#C05620] px-2 py-0.5 text-[10px] font-bold text-white">
                  {totalCount > 99 ? "99+" : totalCount}
                </span>
              )}
            </Link>

            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-md px-2 py-2.5 text-sm font-medium text-[#3A342C] transition-colors hover:bg-[#F0E6D2] hover:text-[#C05620]"
              >
                {link.label}
              </Link>
            ))}

            <Link
              href="/profile"
              className="mt-2 flex items-center justify-center gap-1.5 rounded-full bg-[#2B2420] px-4 py-2.5 text-sm font-semibold text-[#F7F2E7]"
            >
              <User className="h-4 w-4" strokeWidth={2} />
              Account
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}