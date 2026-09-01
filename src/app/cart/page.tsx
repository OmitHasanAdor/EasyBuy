"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/lib/cart-context";

export default function CartPage() {
  const { items, removeItem, updateQty, totalCount } = useCart();
  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);

  return (
    <section className="w-full bg-[#FBF8F1] px-6 py-16 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center gap-3">
          <motion.div
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-[#F2EADA] text-[#C05620]"
          >
            <ShoppingBag className="h-5 w-5" strokeWidth={2} />
          </motion.div>
          <div>
            <h1 className="font-serif text-3xl font-medium text-[#2B2420] sm:text-4xl">
              Your Cart
            </h1>
            <p className="text-sm text-neutral-500">
              {totalCount === 0 ? "No items yet" : `${totalCount} item${totalCount === 1 ? "" : "s"}`}
            </p>
          </div>
        </div>

        {items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center gap-4 rounded-lg border border-dashed border-[#E7DCC4] bg-white/60 py-20 text-center"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#F2EADA] text-[#C05620]">
              <ShoppingBag className="h-8 w-8" strokeWidth={1.6} />
            </div>
            <p className="max-w-xs text-sm text-neutral-500">
              Your cart is empty — browse products and add something you like.
            </p>
            <Link
              href="/products"
              className="mt-1 rounded-sm bg-[#2B2420] px-6 py-3 text-sm font-semibold text-[#F7F2E7] transition-opacity hover:opacity-90"
            >
              Browse Products
            </Link>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="grid gap-10 lg:grid-cols-3"
          >
            {/* item list */}
            <div className="flex flex-col gap-4 lg:col-span-2">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-wrap items-center gap-3 rounded-lg border border-[#E7DCC4] bg-white p-4 sm:flex-nowrap sm:gap-4"
                >
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-[#F2EADA]">
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>

                  <div className="flex min-w-[140px] flex-1 flex-col gap-1">
                    <Link
                      href={`/products/${item.id}`}
                      className="font-serif text-base text-[#2B2420] hover:text-[#C05620]"
                    >
                      {item.name}
                    </Link>
                    <span className="text-sm text-neutral-500">
                      ৳{item.price.toLocaleString()} each
                    </span>
                  </div>

                  <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-normal">
                    <div className="flex items-center gap-2 rounded-full border border-[#E7DCC4] px-2 py-1">
                      <button
                        aria-label="Decrease quantity"
                        onClick={() => updateQty(item.id, item.qty - 1)}
                        className="flex h-6 w-6 items-center justify-center text-[#2B2420] hover:text-[#C05620]"
                      >
                        <Minus className="h-3.5 w-3.5" strokeWidth={2} />
                      </button>
                      <span className="w-5 text-center text-sm font-medium">{item.qty}</span>
                      <button
                        aria-label="Increase quantity"
                        onClick={() => updateQty(item.id, item.qty + 1)}
                        className="flex h-6 w-6 items-center justify-center text-[#2B2420] hover:text-[#C05620]"
                      >
                        <Plus className="h-3.5 w-3.5" strokeWidth={2} />
                      </button>
                    </div>

                    <span className="text-right font-serif text-base text-[#2B2420] sm:w-20">
                      ৳{(item.price * item.qty).toLocaleString()}
                    </span>

                    <button
                      aria-label="Remove item"
                      onClick={() => {
                        removeItem(item.id);
                        toast.success(`${item.name} removed from cart`);
                      }}
                      className="text-neutral-400 hover:text-[#C05620]"
                    >
                      <Trash2 className="h-4 w-4" strokeWidth={2} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* summary */}
            <div className="h-fit rounded-lg border border-[#E7DCC4] bg-white p-6">
              <h2 className="mb-4 font-serif text-lg text-[#2B2420]">Order Summary</h2>
              <div className="flex justify-between text-sm text-neutral-600">
                <span>Subtotal</span>
                <span>৳{subtotal.toLocaleString()}</span>
              </div>
              <p className="mt-1 text-xs text-neutral-400">
                Shipping and taxes calculated at checkout
              </p>
              <div className="my-4 h-px bg-[#E7DCC4]" />
              <div className="flex justify-between font-serif text-lg text-[#2B2420]">
                <span>Total</span>
                <span>৳{subtotal.toLocaleString()}</span>
              </div>
              <button
                onClick={() => toast.info("Checkout is coming soon")}
                className="mt-6 w-full rounded-sm bg-[#2B2420] py-3.5 text-sm font-semibold text-[#F7F2E7] transition-opacity hover:opacity-90"
              >
                Proceed to Checkout
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}