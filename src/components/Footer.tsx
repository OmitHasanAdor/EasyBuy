"use client";

import Link from "next/link";
import Image from "next/image";
import { Globe } from "lucide-react";
import { motion } from "framer-motion";
import {
  FaInstagram,
  FaFacebookF,
  FaPinterestP,
  FaYoutube,
  FaApple,
  FaGooglePlay,
} from "react-icons/fa";

const ease = [0.22, 1, 0.36, 1] as const;

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
    <div className="min-w-36">
      <h3 className="mb-5 text-[11px] font-bold uppercase tracking-[3px] text-[#2B2420]">
        {title}
      </h3>
      <ul className="flex flex-col gap-3">
        {links.map((link) => (
          <li key={link}>
            <Link
              href="#"
              className="text-[14.5px] text-[#5B5145] transition-colors duration-200 hover:text-[#C05620]"
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

            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, ease }}
              className="font-serif text-3xl font-medium leading-[1.15] text-[#2B2420] sm:text-[36px]"
            >
              We&apos;re on a mission to keep{" "}
              <em className="font-medium not-italic text-[#C05620]">commerce</em>{" "}
              human.
            </motion.h2>

            {/* App badges */}
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="#"
                className="flex items-center gap-2.5 rounded-xl border border-[#2B2420] px-4 py-2.5 text-[#2B2420] transition-all duration-300 hover:bg-[#2B2420] hover:text-[#F7F2E7]"
              >
                <FaApple size={20} />
                <span className="leading-tight">
                  <span className="block text-[10px] font-medium tracking-wide opacity-70">
                    Download on the
                  </span>
                  <span className="block text-[13px] font-semibold">App Store</span>
                </span>
              </Link>
              <Link
                href="#"
                className="flex items-center gap-2.5 rounded-xl border border-[#2B2420] px-4 py-2.5 text-[#2B2420] transition-all duration-300 hover:bg-[#2B2420] hover:text-[#F7F2E7]"
              >
                <FaGooglePlay size={18} />
                <span className="leading-tight">
                  <span className="block text-[10px] font-medium tracking-wide opacity-70">
                    GET IT ON
                  </span>
                  <span className="block text-[13px] font-semibold">Google Play</span>
                </span>
              </Link>
            </div>
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

          {/* Left — region + socials */}
          <div className="flex flex-wrap items-center gap-5">
            <span className="flex items-center gap-1.5">
              <Globe size={15} className="text-[#8E3D14]" />
              Bangladesh
            </span>
            <div className="flex items-center gap-4">
              {[
                { icon: FaInstagram, label: "Instagram" },
                { icon: FaFacebookF, label: "Facebook" },
                { icon: FaPinterestP, label: "Pinterest" },
                { icon: FaYoutube, label: "YouTube" },
              ].map(({ icon: Icon, label }) => (
                <Link
                  key={label}
                  href="#"
                  aria-label={label}
                  className="transition-colors duration-200 hover:text-[#C05620]"
                >
                  <Icon size={17} />
                </Link>
              ))}
            </div>
          </div>

          {/* Right — copyright + legal */}
          <div className="flex flex-wrap items-center gap-5">
            <span>© {new Date().getFullYear()} EasyBuy, Inc.</span>
            {bottomLinks.map((link) => (
              <Link
                key={link}
                href="#"
                className="transition-colors duration-200 hover:text-[#C05620]"
              >
                {link}
              </Link>
            ))}
          </div>
        </div>

      </div>
    </footer>
  );
}