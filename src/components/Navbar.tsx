"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Search, Heart, ShoppingBag, User, Menu, X, Sparkles } from "lucide-react";
import { API_URL } from "@/config/api";
import { useCart } from "@/lib/cart-context";
import { useWishlist } from "@/lib/wishlist";
import { authClient } from "@/lib/auth-client";
import { authFetch } from "@/lib/auth-fetch";

type CurrentUser = { id: string; role: string };

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState("");

  const router = useRouter();
  const { totalCount } = useCart();
  const { count: wishlistCount } = useWishlist();

  const { data: session } = authClient.useSession();
  const userId = session?.user?.id ?? null;

  // Current user's role, taken from the session token (never looked up by email)
  const { data: me } = useQuery<CurrentUser | null>({
    queryKey: ["me", userId],
    queryFn: async () => {
      const response = await authFetch(`${API_URL}/api/me`);
      return response.ok ? response.json() : null;
    },
    enabled: !!userId,
  });
  const userRole = userId ? (me?.role ?? null) : null;

  // Shared cache for category queries
  const { data: categories = [] } = useQuery<string[]>({
    queryKey: ["categories"],
    queryFn: () =>
      fetch(`${API_URL}/api/categories`).then((res) => res.json()),
  });

  const navLinks = [
    ...categories.map((category) => ({
      label: category,
      href: `/products?category=${encodeURIComponent(category)}`,
    })),
    ...(userRole === "buyer"
      ? [{ label: "Sell on EasyBuy", href: "/dashboard/buyer/profile" }]
      : []),
  ];

  const profileHref =
    userRole === "buyer"
      ? "/dashboard/buyer/profile"
      : userRole === "seller"
        ? "/dashboard/seller/profile"
        : userRole === "admin"
          ? "/dashboard/admin/profile"
          : "/post-auth";

  const loggedIn = Boolean(userId);
  const finalProfileHref = !loggedIn
    ? "/login"
    : userRole
      ? profileHref
      : "/post-auth";

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
        <nav className="hidden items-center gap-6 lg:flex">
          <Link
            href="/products"
            className="group inline-flex items-center gap-1.5 rounded-full border border-[#C05620]/30 bg-[#C05620]/10 px-3 py-1 text-xs font-semibold text-[#8E3D14] transition-all hover:bg-[#8E3D14] hover:text-white"
          >
            <Sparkles className="h-3.5 w-3.5 text-[#C05620] transition-transform group-hover:rotate-12 group-hover:text-white" />
            <span>AI Trial Room</span>
            <span className="rounded bg-[#C05620] px-1.5 py-0.2 text-[9px] font-bold text-white uppercase tracking-wider">
              NEW
            </span>
          </Link>

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
        <form
          onSubmit={submitSearch}
          className="relative hidden max-w-sm flex-1 items-center md:flex"
        >
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
          {/* Mobile search */}
          <button
            aria-label="Search"
            onClick={() => setMobileOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-full text-[#2B2420] transition-colors hover:bg-[#F0E6D2] md:hidden"
          >
            <Search className="h-5 w-5" strokeWidth={1.8} />
          </button>

          {/* Wishlist - buyer only */}
          {userRole === "buyer" && (
            <Link
              href="/dashboard/buyer/wishlist"
              aria-label={
                wishlistCount > 0
                  ? `Wishlist (${wishlistCount})`
                  : "Wishlist"
              }
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
          )}

          {/* Cart - buyer only */}
          {userRole === "buyer" && (
            <Link
              href="/dashboard/buyer/cart"
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
          )}

          {/* Profile */}
          <Link
            href={finalProfileHref}
            className="ml-1 hidden items-center gap-1.5 rounded-full bg-[#2B2420] px-4 py-2 text-sm font-semibold text-[#F7F2E7] transition-opacity hover:opacity-90 sm:flex"
          >
            <User className="h-4 w-4" strokeWidth={2} />
            Profile
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
          {/* Mobile search */}
          <form
            onSubmit={submitSearch}
            className="relative mb-4 flex items-center md:hidden"
          >
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
            {/* AI Trial Room feature link */}
            <Link
              href="/products"
              onClick={() => setMobileOpen(false)}
              className="mb-1 flex items-center justify-between rounded-md bg-[#C05620]/10 px-3 py-2 text-sm font-semibold text-[#8E3D14] transition-colors hover:bg-[#C05620]/20"
            >
              <span className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#C05620]" />
                Virtual Trial Room
              </span>
              <span className="rounded-full bg-[#C05620] px-2 py-0.5 text-[10px] font-bold text-white">
                NEW
              </span>
            </Link>
            {/* Wishlist - buyer only */}
            {userRole === "buyer" && (
              <Link
                href="/dashboard/buyer/wishlist"
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
            )}

            {/* Cart - buyer only */}
            {userRole === "buyer" && (
              <Link
                href="/dashboard/buyer/cart"
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
            )}

            {/* Profile */}
            <Link
              href={finalProfileHref}
              onClick={() => setMobileOpen(false)}
              className="mt-2 flex items-center justify-center gap-1.5 rounded-full bg-[#2B2420] px-4 py-2.5 text-sm font-semibold text-[#F7F2E7]"
            >
              <User className="h-4 w-4" strokeWidth={2} />
              Profile
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}