import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import SignOutButton from "@/components/SignOutButton";

export default async function ProfilePage() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) redirect("/login");

    const { user } = session;
    const role = user.role as string;

    return (
        <div className="min-h-screen bg-gray-50 p-10">
            <div className="max-w-2xl mx-auto">
                <div className="flex justify-between mb-6">
                    <h1 className="text-2xl font-bold">My Profile</h1>
                    <SignOutButton />
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border space-y-4 mb-6">
                    <p><strong>Name:</strong> {user.name}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>Role:</strong> {role}</p>
                </div>

                {/* <div className="flex gap-4">
                    <Link href="/dashboard/buyer" className="text-blue-600 hover:underline">Buyer Dashboard</Link>
                    {(role === "seller" || role === "admin") && (
                        <Link href="/dashboard/seller" className="text-blue-600 hover:underline">Seller Dashboard</Link>
                    )}
                    {role === "admin" && (
                        <Link href="/dashboard/admin" className="text-blue-600 hover:underline">Admin Dashboard</Link>
                    )}
                </div> */}
            </div>
        </div>
    );
}
