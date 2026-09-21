"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { MessageCircle, X, Send, Loader2, Sparkles } from "lucide-react";
import { API_URL } from "@/config/api";

type ChatProduct = {
  id: number;
  name: string;
  price: number;
  category: string;
  image: string | null;
};

type Msg = {
  role: "user" | "bot";
  text: string;
  products?: ChatProduct[];
};

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "bot",
      text: "Hi! Tell me your occasion and budget (e.g. birthday party, ৳1000–2000) — I’ll suggest outfits from our store.",
    },
  ]);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", text }]);
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessages((m) => [
          ...m,
          { role: "bot", text: data.error || "Something went wrong." },
        ]);
        return;
      }
      setMessages((m) => [
        ...m,
        {
          role: "bot",
          text:
            data.reply ||
            (data.products?.length
              ? "Here are some picks:"
              : "No matching products right now. Try a wider budget."),
          products: data.products ?? [],
        },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "bot", text: "Could not reach the assistant. Try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-5 right-5 z-60 flex h-14 w-14 items-center justify-center rounded-full bg-[#C05620] text-white shadow-lg transition hover:opacity-90"
        aria-label={open ? "Close chat" : "Open chat"}
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {open && (
        <div className="fixed bottom-22 right-5 z-60 flex h-[min(520px,70vh)] w-[min(380px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-[#E7DCC4] bg-[#FBF8F1] shadow-2xl sm:bottom-24">
          <div className="flex items-center gap-2 bg-[#2B2420] px-4 py-3 text-[#F7F2E7]">
            <Sparkles className="h-4 w-4 text-[#C05620]" />
            <div>
              <p className="text-sm font-semibold">EasyBuy Assistant</p>
              <p className="text-[11px] opacity-70">Outfit ideas from our catalogue</p>
            </div>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-3">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[90%] rounded-2xl px-3 py-2 text-sm ${
                    msg.role === "user"
                      ? "bg-[#2B2420] text-[#F7F2E7]"
                      : "bg-white border border-[#E7DCC4] text-[#2B2420]"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                  {msg.products && msg.products.length > 0 && (
                    <ul className="mt-2 space-y-2">
                      {msg.products.map((p) => (
                        <li key={p.id}>
                          <Link
                            href={`/products/${p.id}`}
                            className="flex gap-2 rounded-lg border border-[#E7DCC4] bg-[#FBF8F1] p-2 hover:border-[#C05620]"
                            onClick={() => setOpen(false)}
                          >
                            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded bg-[#F2EADA]">
                              {p.image ? (
                                <Image
                                  src={p.image}
                                  alt=""
                                  fill
                                  className="object-cover"
                                  sizes="48px"
                                />
                              ) : null}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-xs font-medium">{p.name}</p>
                              <p className="text-[11px] text-neutral-500">{p.category}</p>
                              <p className="text-xs font-semibold text-[#C05620]">
                                ৳{p.price.toLocaleString()}
                              </p>
                            </div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-xs text-neutral-500">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Finding products…
              </div>
            )}
            <div ref={endRef} />
          </div>

          <form
            className="flex gap-2 border-t border-[#E7DCC4] bg-white p-2"
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Budget, occasion…"
              className="flex-1 rounded-full border border-[#E7DCC4] bg-[#FBF8F1] px-3 py-2 text-sm outline-none focus:border-[#C05620]"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#C05620] text-white disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}