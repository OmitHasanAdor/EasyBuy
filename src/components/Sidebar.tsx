"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  PackagePlus,
  Boxes,
  Tags,
  ClipboardList,
  BarChart3,
  Wallet,
  Percent,
  Star,
  Settings,
  MessageSquareText,
  Bell,
  HelpCircle,
  LogOut,
  Heart,
  MapPin,
  CreditCard,
  Truck,
  LayoutGrid,
  Users,
  Store,
  ShieldCheck,
  UserCog,
  type LucideIcon,
} from "lucide-react";

export type Role = "buyer" | "seller" | "admin";

type NavLink = {
  label: string;
  href: string;
  icon: LucideIcon;
};

type NavGroup = {
  title: string;
  links: NavLink[];
};

const NAV_BY_ROLE: Record<Role, NavGroup[]> = {
  buyer: [
    {
      title: "Shopping",
      links: [
        { label: "Overview", href: "/dashboard/buyer", icon: LayoutDashboard },
        { label: "My Orders", href: "/dashboard/buyer/orders", icon: Package },
        { label: "Cart", href: "/dashboard/buyer/cart", icon: Truck },
        { label: "Wishlist", href: "/dashboard/buyer/wishlist", icon: Heart },
        { label: "Browse Products", href: "/products", icon: LayoutGrid },
      ],
    },
    {
      title: "Account",
      links: [
        { label: "Profile Settings", href: "/dashboard/buyer/settings", icon: Settings },
        { label: "Saved Addresses", href: "/dashboard/buyer/addresses", icon: MapPin },
        { label: "Payment Methods", href: "/dashboard/buyer/payments", icon: CreditCard },
        { label: "My Reviews", href: "/dashboard/buyer/reviews", icon: Star },
        { label: "Notifications", href: "/dashboard/buyer/notifications", icon: Bell },
      ],
    },
    {
      title: "Support",
      links: [
        { label: "Messages", href: "/dashboard/buyer/messages", icon: MessageSquareText },
        { label: "Help Center", href: "/help", icon: HelpCircle },
      ],
    },
  ],

  seller: [
    {
      title: "Store",
      links: [
        { label: "Overview", href: "/dashboard/seller", icon: LayoutDashboard },
        { label: "My Products", href: "/dashboard/seller/products", icon: Package },
        { label: "Add New Product", href: "/dashboard/seller/products/new", icon: PackagePlus },
        { label: "Inventory", href: "/dashboard/seller/inventory", icon: Boxes },
        { label: "Categories", href: "/dashboard/seller/categories", icon: Tags },
      ],
    },
    {
      title: "Sales",
      links: [
        { label: "Orders & Invoices", href: "/dashboard/seller/orders", icon: ClipboardList },
        { label: "Sales Analytics", href: "/dashboard/seller/analytics", icon: BarChart3 },
        { label: "Earnings & Payouts", href: "/dashboard/seller/earnings", icon: Wallet },
        { label: "Promotions", href: "/dashboard/seller/promotions", icon: Percent },
        { label: "Customer Reviews", href: "/dashboard/seller/reviews", icon: Star },
      ],
    },
    {
      title: "Account",
      links: [
        { label: "Store Settings", href: "/dashboard/seller/settings", icon: Settings },
        { label: "Messages", href: "/dashboard/seller/messages", icon: MessageSquareText },
        { label: "Notifications", href: "/dashboard/seller/notifications", icon: Bell },
        { label: "Help Center", href: "/help", icon: HelpCircle },
      ],
    },
  ],

  admin: [
    {
      title: "Overview",
      links: [
        { label: "Dashboard", href: "/dashboard/admin", icon: LayoutDashboard },
        { label: "Reports & Analytics", href: "/dashboard/admin/reports", icon: BarChart3 },
      ],
    },
    {
      title: "Management",
      links: [
        { label: "Buyer Management", href: "/dashboard/admin/buyers", icon: Users },
        { label: "Seller Management", href: "/dashboard/admin/sellers", icon: Store },
        { label: "Product Moderation", href: "/dashboard/admin/products", icon: ShieldCheck },
        { label: "All Orders", href: "/dashboard/admin/orders", icon: ClipboardList },
        { label: "Categories", href: "/dashboard/admin/categories", icon: Tags },
        { label: "Review Moderation", href: "/dashboard/admin/reviews", icon: Star },
      ],
    },
    {
      title: "Platform",
      links: [
        { label: "Payments & Transactions", href: "/dashboard/admin/payments", icon: Wallet },
        { label: "Team & Roles", href: "/dashboard/admin/team", icon: UserCog },
        { label: "Site Settings", href: "/dashboard/admin/settings", icon: Settings },
        { label: "Notifications", href: "/dashboard/admin/notifications", icon: Bell },
        { label: "Help Center", href: "/help", icon: HelpCircle },
      ],
    },
  ],
};

const ROLE_LABEL: Record<Role, string> = {
  buyer: "Buyer",
  seller: "Seller",
  admin: "Admin",
};

type SidebarProps = {
  role: Role;
  userName?: string;
  userEmail?: string;
};

export default function Sidebar({
  role,
  userName = "Omit Hasan",
  userEmail = "omit@easybuy.com",
}: SidebarProps) {
  const pathname = usePathname();
  const groups = NAV_BY_ROLE[role];

  return (
    <aside className="flex h-screen w-72 shrink-0 flex-col border-r border-[#E7DCC4] bg-[#F7F2E7]">
      {/* Logo + role badge */}
      <div className="flex items-center gap-2.5 px-6 py-5">
        <Image
          src="/logo.png"
          alt="EasyBuy"
          width={34}
          height={34}
          className="h-8.5 w-8.5 object-contain"
        />
        <div className="flex flex-col leading-tight">
          <span className="font-serif text-base font-medium text-[#2B2420]">
            EasyBuy
          </span>
          <span className="w-fit rounded-full bg-[#C05620]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#C05620]">
            {ROLE_LABEL[role]}
          </span>
        </div>
      </div>

      <div className="mx-6 border-t border-[#E7DCC4]" />

      {/* Nav groups */}
      <nav className="flex-1 overflow-y-auto px-4 py-4">
        {groups.map((group) => (
          <div key={group.title} className="mb-5">
            <p className="mb-1.5 px-2 text-[11px] font-bold uppercase tracking-[2px] text-[#8E3D14]/70">
              {group.title}
            </p>
            <ul className="flex flex-col gap-0.5">
              {group.links.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-[#2B2420] text-[#F7F2E7]"
                          : "text-[#3A342C] hover:bg-[#F0E6D2]"
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" strokeWidth={2} />
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="mx-6 border-t border-[#E7DCC4]" />

      {/* Logout */}
      <div className="px-4 py-3">
        <Link
          href="/logout"
          className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-[#C05620] transition-colors hover:bg-[#C05620]/10"
        >
          <LogOut className="h-4 w-4" strokeWidth={2} />
          Logout
        </Link>
      </div>

      {/* User profile footer */}
      <div className="flex items-center gap-3 border-t border-[#E7DCC4] px-6 py-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#2B2420] text-xs font-bold text-[#F7F2E7]">
          {userName
            .split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2)
            .toUpperCase()}
        </div>
        <div className="flex min-w-0 flex-col leading-tight">
          <span className="truncate text-sm font-semibold text-[#2B2420]">
            {userName}
          </span>
          <span className="truncate text-xs text-[#8E3D14]/70">
            {userEmail}
          </span>
        </div>
      </div>
    </aside>
  );
}