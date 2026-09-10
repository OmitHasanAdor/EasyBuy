"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
import { signIn } from "@/lib/auth-client";
import GoogleSignInButton from "@/components/GoogleSignInButton";

const ease = [0.22, 1, 0.36, 1] as const;

/* ── stagger container ── */
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease } },
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: authError } = await signIn.email({ email, password });
    setLoading(false);

    if (authError) {
      setError(authError.message || "Invalid email or password.");
      return;
    }

    router.push("/profile");
    router.refresh();
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show">

      {/* ── Heading ── */}
      <motion.div variants={item} className="mb-8 text-center">
        <span className="mb-3 inline-block text-[10px] font-bold uppercase tracking-[5px] text-[#C05620]">
          Welcome back
        </span>
        <h1 className="font-serif text-[30px] font-medium leading-tight text-[#2B2420]">
          Sign in to EasyBuy
        </h1>
        <p className="mt-2 text-[13.5px] leading-relaxed text-[#5B5145]">
          Sign in to your EasyBuy account
        </p>
      </motion.div>

      {/* ── Form ── */}
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Email */}
        <motion.div variants={item}>
          <label
            htmlFor="login-email"
            className="mb-1.5 block text-[12px] font-semibold uppercase tracking-[2px] text-[#2B2420]/70"
          >
            Email
          </label>
          <div className="relative">
            <Mail
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5B5145]/50"
              strokeWidth={1.8}
            />
            <input
              id="login-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jane@example.com"
              className="w-full rounded-xl border border-[#E7DCC4] bg-[#F7F2E7]/60 py-3 pl-10 pr-4 text-[14px] text-[#2B2420] placeholder:text-[#5B5145]/40 outline-none transition-all duration-200 focus:border-[#C05620] focus:bg-white focus:ring-3 focus:ring-[#C05620]/15"
            />
          </div>
        </motion.div>

        {/* Password */}
        <motion.div variants={item}>
          <div className="mb-1.5 flex items-center justify-between">
            <label
              htmlFor="login-password"
              className="text-[12px] font-semibold uppercase tracking-[2px] text-[#2B2420]/70"
            >
              Password
            </label>
            <span className="text-[12px] font-medium text-[#C05620] transition-opacity hover:opacity-70 cursor-pointer">
              Forgot password?
            </span>
          </div>
          <div className="relative">
            <Lock
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5B5145]/50"
              strokeWidth={1.8}
            />
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              className="w-full rounded-xl border border-[#E7DCC4] bg-[#F7F2E7]/60 py-3 pl-10 pr-11 text-[14px] text-[#2B2420] placeholder:text-[#5B5145]/40 outline-none transition-all duration-200 focus:border-[#C05620] focus:bg-white focus:ring-3 focus:ring-[#C05620]/15"
            />
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#5B5145]/50 transition-colors hover:text-[#C05620]"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" strokeWidth={1.8} />
              ) : (
                <Eye className="h-4 w-4" strokeWidth={1.8} />
              )}
            </button>
          </div>
        </motion.div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-[13px] text-red-600"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Submit */}
        <motion.div variants={item} className="pt-1">
          <button
            id="login-submit"
            type="submit"
            disabled={loading}
            className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#2B2420] px-6 py-3.5 text-[14px] font-semibold tracking-wide text-[#F7F2E7] transition-all duration-300 hover:bg-[#C05620] hover:shadow-[0_8px_24px_rgba(192,86,32,0.38)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing in…
              </>
            ) : (
              <>
                Sign In
                <ArrowRight
                  className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
                  strokeWidth={2}
                />
              </>
            )}
          </button>
        </motion.div>
      </form>

      {/* ── Divider ── */}
      <motion.div variants={item} className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-[#E7DCC4]" />
        <span className="text-[11px] font-medium uppercase tracking-[2px] text-[#5B5145]/50">
          or continue with
        </span>
        <div className="h-px flex-1 bg-[#E7DCC4]" />
      </motion.div>

      {/* ── Social Login ── */}
      <motion.div variants={item} className="mb-6">
        <GoogleSignInButton
          text="Sign in with Google"
          callbackURL="/profile"
          onError={(msg) => setError(msg)}
        />
      </motion.div>

      {/* ── Sign-up link ── */}
      <motion.p variants={item} className="text-center text-[13.5px] text-[#5B5145]">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="font-semibold text-[#C05620] underline-offset-2 transition-all hover:underline"
        >
          Create one
        </Link>
      </motion.p>
    </motion.div>
  );
}
