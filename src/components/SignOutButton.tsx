"use client";

import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth-client";

export default function SignOutButton() {
    const router = useRouter();

    async function handleSignOut() {
        await signOut();
        router.push("/login");
        router.refresh();
    }

    return (
        <button onClick={handleSignOut} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg">
            Sign Out
        </button>
    );
}
