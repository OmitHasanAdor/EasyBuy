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
  "Company, Inc.",
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
      <h3 className="mb-4 text-sm font-bold text-neutral-900">{title}</h3>
      <ul className="flex flex-col gap-3">
        {links.map((link) => (
          <li key={link}>
            <a
              href="#"
              className="text-[15px] text-neutral-700 hover:underline"
            >
              {link}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="w-full bg-[#f3efe9] px-6 pb-6 pt-14 text-neutral-900 sm:px-10 lg:px-16">
      {/* Mission headline */}
      <h2 className="mb-10 max-w-xl font-serif text-4xl font-normal leading-tight sm:text-[44px]">
        We&apos;re on a mission to
        <br />
        keep commerce human.
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
        <a
          href="#"
          className="flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-white"
        >
          <FaApple size={22} />
          <span className="leading-tight">
            <span className="block text-[11px]">Download on the</span>
            <span className="block text-base font-semibold">App Store</span>
          </span>
        </a>
        <a
          href="#"
          className="flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-white"
        >
          <FaGooglePlay size={20} />
          <span className="leading-tight">
            <span className="block text-[11px]">GET IT ON</span>
            <span className="block text-base font-semibold">Google Play</span>
          </span>
        </a>
      </div>

      <hr className="mb-5 border-t border-[#ddd6c9]" />

      {/* Bottom bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-neutral-700">
        <div className="flex flex-wrap items-center gap-5">
          <span className="flex items-center gap-1.5">
            <Globe size={16} />
            Bangladesh
          </span>
          <a href="#" aria-label="Instagram" className="hover:text-black">
            <FaInstagram size={18} />
          </a>
          <a href="#" aria-label="Facebook" className="hover:text-black">
            <FaFacebookF size={18} />
          </a>
          <a href="#" aria-label="Pinterest" className="hover:text-black">
            <FaPinterestP size={18} />
          </a>
          <a href="#" aria-label="YouTube" className="hover:text-black">
            <FaYoutube size={18} />
          </a>
        </div>

        <div className="flex flex-wrap items-center gap-5">
          <span>© {new Date().getFullYear()} Company, Inc.</span>
          {bottomLinks.map((link) => (
            <a key={link} href="#" className="hover:underline">
              {link}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}