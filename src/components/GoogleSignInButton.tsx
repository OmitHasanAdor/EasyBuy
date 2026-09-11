"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { signIn } from "@/lib/auth-client";

interface GoogleSignInButtonProps {
    text?: string;
    callbackURL?: string;
    onError?: (errorMessage: string) => void;
    className?: string;
}

export function GoogleIcon({ className = "h-4 w-4" }: { className?: string }) {
    return (
        <svg
            className={className}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
        >
            <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
            />
            <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
            />
            <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                fill="#FBBC05"
            />
            <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                fill="#EA4335"
            />
        </svg>
    );
}

export default function GoogleSignInButton({
    text = "Continue with Google",
    callbackURL = "/profile",
    onError,
    className = "",
}: GoogleSignInButtonProps) {
    const [loading, setLoading] = useState(false);

    async function handleGoogleSignIn() {
        try {
            setLoading(true);
            const res = await signIn.social({
                provider: "google",
                callbackURL,
                prompt: "select_account",
            } as Parameters<typeof signIn.social>[0]);

            if (res?.error) {
                onError?.(res.error.message || "Failed to sign in with Google.");
                setLoading(false);
            }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Something went wrong with Google sign in.";
            onError?.(message);
            setLoading(false);
        }
    }

    return (
        <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className={`group relative flex w-full items-center justify-center gap-3 rounded-xl border border-[#E7DCC4] bg-white px-5 py-3 text-[14px] font-semibold text-[#2B2420] shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-200 hover:border-[#C05620]/40 hover:bg-[#F7F2E7]/70 hover:shadow-md active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
        >
            {loading ? (
                <>
                    <Loader2 className="h-4 w-4 animate-spin text-[#C05620]" />
                    <span>Connecting to Google…</span>
                </>
            ) : (
                <>
                    <GoogleIcon className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-110" />
                    <span>{text}</span>
                </>
            )}
        </button>
    );
}
