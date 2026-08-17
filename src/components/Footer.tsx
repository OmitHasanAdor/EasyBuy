import Link from "next/link";
import {
  Facebook,
  Github,
  Instagram,
  Mail,
  MapPin,
  Phone,
  Twitter,
} from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t bg-slate-950 text-slate-300">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <Link
              href="/"
              className="text-2xl font-bold tracking-tight text-white"
            >
              Easy<span className="text-blue-500">Buy</span>
            </Link>

            <p className="mt-4 max-w-sm text-sm leading-6 text-slate-400">
              A simple and trusted marketplace where buyers discover great
              products and sellers grow their businesses.
            </p>

            <div className="mt-6 flex gap-3">
              <a
                href="#"
                aria-label="Facebook"
                className="rounded-full bg-slate-900 p-2.5 transition hover:bg-blue-600 hover:text-white"
              >
                <Facebook size={18} />
              </a>

              <a
                href="#"
                aria-label="Instagram"
                className="rounded-full bg-slate-900 p-2.5 transition hover:bg-pink-600 hover:text-white"
              >
                <Instagram size={18} />
              </a>

              <a
                href="#"
                aria-label="Twitter"
                className="rounded-full bg-slate-900 p-2.5 transition hover:bg-sky-500 hover:text-white"
              >
                <Twitter size={18} />
              </a>

              <a
                href="#"
                aria-label="GitHub"
                className="rounded-full bg-slate-900 p-2.5 transition hover:bg-slate-700 hover:text-white"
              >
                <Github size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Quick Links
            </h3>

            <ul className="mt-5 space-y-3 text-sm">
              <li>
                <Link
                  href="/"
                  className="transition hover:text-blue-500"
                >
                  Home
                </Link>
              </li>

              <li>
                <Link
                  href="/products"
                  className="transition hover:text-blue-500"
                >
                  Products
                </Link>
              </li>

              <li>
                <Link
                  href="/categories"
                  className="transition hover:text-blue-500"
                >
                  Categories
                </Link>
              </li>

              <li>
                <Link
                  href="/sellers"
                  className="transition hover:text-blue-500"
                >
                  Sellers
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Support
            </h3>

            <ul className="mt-5 space-y-3 text-sm">
              <li>
                <Link
                  href="/help"
                  className="transition hover:text-blue-500"
                >
                  Help Center
                </Link>
              </li>

              <li>
                <Link
                  href="/privacy"
                  className="transition hover:text-blue-500"
                >
                  Privacy Policy
                </Link>
              </li>

              <li>
                <Link
                  href="/terms"
                  className="transition hover:text-blue-500"
                >
                  Terms & Conditions
                </Link>
              </li>

              <li>
                <Link
                  href="/refund"
                  className="transition hover:text-blue-500"
                >
                  Refund Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Contact Us
            </h3>

            <ul className="mt-5 space-y-4 text-sm text-slate-400">
              <li className="flex items-start gap-3">
                <MapPin
                  size={18}
                  className="mt-0.5 shrink-0 text-blue-500"
                />
                <span>Dhaka, Bangladesh</span>
              </li>

              <li className="flex items-center gap-3">
                <Phone size={18} className="shrink-0 text-blue-500" />
                <span>+880 1234-567890</span>
              </li>

              <li className="flex items-center gap-3">
                <Mail size={18} className="shrink-0 text-blue-500" />
                <span>support@easybuy.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 flex flex-col gap-4 border-t border-slate-800 pt-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} EasyBuy. All rights reserved.
          </p>

          <p>
            Built with ❤️ by the EasyBuy Team
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;