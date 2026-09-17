import Link from "next/link";
import Image from "next/image";
import { Globe } from "lucide-react";

type FooterLink = { label: string; href: string };

// Only pages that exist. Links for things that aren't built yet (apps,
// social accounts, legal pages, ...) stay out of the footer until they are.
const shopLinks: FooterLink[] = [
  { label: "All products", href: "/products" },
  { label: "Trending", href: "/trending" },
  { label: "Best sellers", href: "/best-sellers" },
  { label: "Flash sale", href: "/flash-sale" },
];
const sellLinks: FooterLink[] = [
  { label: "Sell on EasyBuy", href: "/dashboard/buyer/profile" },
  { label: "Seller FAQ", href: "/help" },
];
const aboutLinks: FooterLink[] = [{ label: "Our story", href: "/about" }];
const helpLinks: FooterLink[] = [
  { label: "Help Center", href: "/help" },
  { label: "Contact support", href: "mailto:support@easybuy.com" },
];

function FooterColumn({ title, links }: { title: string; links: FooterLink[] }) {
  return (
    <div className="min-w-36">
      <h3 className="mb-5 text-[11px] font-bold uppercase tracking-[3px] text-[#2B2420]">
        {title}
      </h3>
      <ul className="flex flex-col gap-3">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              href={link.href}
              className="text-[14.5px] text-[#5B5145] transition-colors duration-200 hover:text-[#C05620]"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="w-full bg-[#F7F2E7] px-6 pb-8 pt-16 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-7xl">

        {/* ── Top row: mission + columns ── */}
        <div className="mb-16 flex flex-col gap-14 lg:flex-row lg:justify-between">

          {/* Mission block */}
          <div className="max-w-sm shrink-0">
            {/* Logo + wordmark */}
            <Link href="/" className="mb-8 inline-flex items-center gap-2.5">
              <Image
                src="/logo.png"
                alt="EasyBuy"
                width={36}
                height={36}
                className="h-9 w-9 object-contain"
              />
              <span className="font-serif text-xl font-medium text-[#2B2420]">
                EasyBuy
              </span>
            </Link>

            <h2 className="font-serif text-3xl font-medium leading-[1.15] text-[#2B2420] sm:text-[36px]">
              We&apos;re on a mission to keep{" "}
              <em className="font-medium not-italic text-[#C05620]">commerce</em>{" "}
              human.
            </h2>
          </div>

          {/* Link columns */}
          <div className="flex flex-wrap gap-x-12 gap-y-10">
            <FooterColumn title="Shop" links={shopLinks} />
            <FooterColumn title="Sell" links={sellLinks} />
            <FooterColumn title="About" links={aboutLinks} />
            <FooterColumn title="Help" links={helpLinks} />
          </div>
        </div>

        {/* ── Divider ── */}
        <hr className="border-t border-[#E7DCC4]" />

        {/* ── Bottom bar ── */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-5 text-[13px] text-[#5B5145]">
          <span className="flex items-center gap-1.5">
            <Globe size={15} className="text-[#8E3D14]" />
            Delivering across Bangladesh
          </span>

          <span>© {new Date().getFullYear()} EasyBuy</span>
        </div>

      </div>
    </footer>
  );
}
