"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "@/lib/auth-client";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setLoading(true);

        const { error: authError } = await signIn.email({
            email,
            password,
        });

        setLoading(false);

        if (authError) {
            setError(authError.message || "Invalid email or password.");
            return;
        }

        router.push("/dashboard");
        router.refresh();
    }

    return (
        <>
            <div className="mb-6 text-center">
                <h1 className="text-2xl font-bold text-gray-900">Sign In</h1>
                <p className="mt-1 text-sm text-gray-500">Welcome back to EasyBuy</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500" />
                </div>
                {error && <p className="text-sm text-red-600 bg-red-50 p-2 rounded-lg border border-red-200">{error}</p>}
                <button type="submit" disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium">
                    {loading ? "Signing in…" : "Sign In"}
                </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-500">
                Don't have an account? <Link href="/signup" className="text-blue-600 hover:underline">Create one</Link>
            </p>
        </>
    );
}
