import Link from "next/link";
import {
  HelpCircle,
  Package,
  ShoppingCart,
  Wallet,
  Store,
  MessageSquareText,
  ChevronDown,
} from "lucide-react";

const FAQ_GROUPS = [
  {
    title: "Buying",
    icon: ShoppingCart,
    items: [
      {
        q: "How do I place an order?",
        a: "Browse products, add items to your cart, then go to checkout. Choose your delivery address and payment method to complete the order.",
      },
      {
        q: "How can I track my order?",
        a: "Go to Dashboard → My Orders. Each order shows its current status: Pending, Shipped, or Delivered.",
      },
      {
        q: "Can I cancel an order?",
        a: "You can cancel while the order is still Pending. Once it is Shipped, please contact support for help.",
      },
      {
        q: "How do returns work?",
        a: "If an item is damaged or not as described, contact support within 7 days of delivery with your order ID and photos.",
      },
    ],
  },
  {
    title: "Selling",
    icon: Store,
    items: [
      {
        q: "How do I become a seller?",
        a: "Submit a seller request from your account. Once an admin approves it, your role becomes Seller and you can access the seller dashboard.",
      },
      {
        q: "How do I add products?",
        a: "Go to Seller Dashboard → Add New Product. Fill in name, price, category, stock, images, and optional variants (size/color).",
      },
      {
        q: "When do I get paid?",
        a: "Earnings are calculated from delivered orders. Check Earnings & Payouts in your seller dashboard. Full payout requests will be available later.",
      },
      {
        q: "How do I manage stock?",
        a: "Use the Inventory page to update product and variant stock levels. Low stock items are highlighted automatically.",
      },
    ],
  },
  {
    title: "Orders & Payments",
    icon: Package,
    items: [
      {
        q: "What payment methods are accepted?",
        a: "EasyBuy supports common local payment options. Available methods are shown at checkout.",
      },
      {
        q: "Why was my order cancelled?",
        a: "Orders may be cancelled due to stock issues, payment failure, or seller/admin action. Check your order details or contact support.",
      },
    ],
  },
  {
    title: "Account",
    icon: Wallet,
    items: [
      {
        q: "How do I update my profile?",
        a: "Buyers: Dashboard → Profile Settings. Sellers: Dashboard → Store Settings or Profile.",
      },
      {
        q: "I forgot my password",
        a: "Use the Forgot Password link on the login page. You will receive a reset link by email.",
      },
    ],
  },
];

export default function HelpCenterPage() {
  return (
    <div className="min-h-screen bg-[#FBF8F1]">
      <div className="mx-auto max-w-3xl px-4 py-12 md:py-16">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#F0E6D2]">
            <HelpCircle className="h-7 w-7 text-[#C05620]" />
          </div>
          <h1 className="font-serif text-3xl font-medium text-[#2B2420]">
            Help Center
          </h1>
          <p className="mt-2 text-sm text-[#8E3D14]/80">
            Answers to common questions about buying, selling, and your account
          </p>
        </div>

        {/* FAQ groups */}
        <div className="space-y-8">
          {FAQ_GROUPS.map((group) => {
            const Icon = group.icon;
            return (
              <section key={group.title}>
                <div className="mb-3 flex items-center gap-2">
                  <Icon className="h-4 w-4 text-[#C05620]" />
                  <h2 className="text-sm font-bold uppercase tracking-wider text-[#8E3D14]/80">
                    {group.title}
                  </h2>
                </div>
                <div className="space-y-2">
                  {group.items.map((item) => (
                    <details
                      key={item.q}
                      className="group rounded-xl border border-[#E7DCC4] bg-white open:shadow-sm"
                    >
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3.5 text-sm font-medium text-[#2B2420]">
                        {item.q}
                        <ChevronDown className="h-4 w-4 shrink-0 text-[#8E3D14]/60 transition group-open:rotate-180" />
                      </summary>
                      <div className="border-t border-[#E7DCC4] px-4 py-3 text-sm leading-relaxed text-[#3A342C]">
                        {item.a}
                      </div>
                    </details>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        {/* Contact */}
        <div className="mt-12 rounded-xl border border-[#E7DCC4] bg-white p-6 text-center">
          <MessageSquareText className="mx-auto mb-3 h-8 w-8 text-[#C05620]" />
          <h3 className="font-medium text-[#2B2420]">Still need help?</h3>
          <p className="mt-1 text-sm text-[#8E3D14]/80">
            Reach out and we&apos;ll get back to you as soon as possible.
          </p>
          <a
            href="mailto:support@easybuy.com"
            className="mt-4 inline-flex rounded-md bg-[#2B2420] px-5 py-2.5 text-sm font-medium text-[#F7F2E7] transition hover:bg-[#3A342C]"
          >
            Email Support
          </a>
        </div>

        <p className="mt-8 text-center text-sm text-[#8E3D14]/60">
          <Link href="/" className="hover:text-[#C05620] hover:underline">
            ← Back to EasyBuy
          </Link>
        </p>
      </div>
    </div>
  );
}