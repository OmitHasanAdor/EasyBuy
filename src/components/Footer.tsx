import Link from "next/link";
import { Globe } from "lucide-react";
import {
  FaInstagram,
  FaFacebookF,
  FaPinterestP,
  FaYoutube,
  FaApple,
  FaGooglePlay,
} from "react-icons/fa";

const shopLinks = [
  "Gift cards",
  "Brand Registry",
  "Sitemap",
  "Blog",
  "United Kingdom",
  "Germany",
  "Canada",
];

const sellLinks = ["Sell with us", "Teams", "Forums", "Affiliates & Creators"];

const aboutLinks = [
  "EasyBuy, Inc.",
  "Policies",
  "Investors",
  "Careers",
  "Press",
  "Impact",
  "Legal imprint",
];

const helpLinks = ["Help Center", "Privacy settings"];

const bottomLinks = [
  "Terms of Use",
  "Privacy",
  "Interest-based ads",
  "Local Shops",
  "Regions",
];

function FooterColumn({ title, links }: { title: string; links: string[] }) {
  return (
    <div className="min-w-40">
      <h3 className="mb-4 text-sm font-bold text-[#2B2420]">{title}</h3>
      <ul className="flex flex-col gap-3">
        {links.map((link) => (
          <li key={link}>
            <Link
              href="#"
              className="text-[15px] text-[#5B5145] transition-colors hover:text-[#C05620] hover:underline"
            >
              {link}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="w-full bg-[#F7F2E7] px-6 pb-6 pt-14 sm:px-10 lg:px-16">
      {/* Mission headline */}
      <h2 className="mb-10 max-w-xl font-serif text-4xl font-medium leading-tight text-[#2B2420] sm:text-[44px]">
        We&apos;re on a mission to
        <br />
        keep <em className="font-light italic text-[#C05620]">commerce</em>{" "}
        human.
      </h2>

      {/* Link columns */}
      <div className="mb-12 flex flex-wrap gap-12">
        <FooterColumn title="Shop" links={shopLinks} />
        <FooterColumn title="Sell" links={sellLinks} />
        <FooterColumn title="About" links={aboutLinks} />
        <FooterColumn title="Help" links={helpLinks} />
      </div>

      {/* App badges */}
      <div className="mb-14 flex flex-wrap gap-3">
        <Link
          href="#"
          className="flex items-center gap-2 rounded-lg bg-[#2B2420] px-4 py-2 text-[#F7F2E7] transition-opacity hover:opacity-90"
        >
          <FaApple size={22} />
          <span className="leading-tight">
            <span className="block text-[11px]">Download on the</span>
            <span className="block text-base font-semibold">App Store</span>
          </span>
        </Link>
        <Link
          href="#"
          className="flex items-center gap-2 rounded-lg bg-[#2B2420] px-4 py-2 text-[#F7F2E7] transition-opacity hover:opacity-90"
        >
          <FaGooglePlay size={20} />
          <span className="leading-tight">
            <span className="block text-[11px]">GET IT ON</span>
            <span className="block text-base font-semibold">Google Play</span>
          </span>
        </Link>
      </div>

      <hr className="mb-5 border-t border-[#E7DCC4]" />

      {/* Bottom bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-[#5B5145]">
        <div className="flex flex-wrap items-center gap-5">
          <span className="flex items-center gap-1.5">
            <Globe size={16} className="text-[#8E3D14]" />
            Bangladesh
          </span>
          <Link href="#" aria-label="Instagram" className="transition-colors hover:text-[#C05620]">
            <FaInstagram size={18} />
          </Link>
          <Link href="#" aria-label="Facebook" className="transition-colors hover:text-[#C05620]">
            <FaFacebookF size={18} />
          </Link>
          <Link href="#" aria-label="Pinterest" className="transition-colors hover:text-[#C05620]">
            <FaPinterestP size={18} />
          </Link>
          <Link href="#" aria-label="YouTube" className="transition-colors hover:text-[#C05620]">
            <FaYoutube size={18} />
          </Link>
        </div>

        <div className="flex flex-wrap items-center gap-5">
          <span>© {new Date().getFullYear()} EasyBuy, Inc.</span>
          {bottomLinks.map((link) => (
            <Link
              key={link}
              href="#"
              className="transition-colors hover:text-[#C05620] hover:underline"
            >
              {link}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}