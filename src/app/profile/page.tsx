import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import SignOutButton from "@/components/SignOutButton";
import BecomeSellerSection from "@/components/profile/BecomeSellerSection";
import AdminSellerRequests from "@/components/profile/AdminSellerRequests";
import AdminUsersList from "@/components/profile/AdminUsersList";
import { User, Mail, Shield, Phone, Calendar, CheckCircle2 } from "lucide-react";

export default async function ProfilePage() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) redirect("/login");

    const { user: sessionUser } = session;

    // Fetch full user record from database
    const dbUser = await prisma.user.findUnique({
        where: { id: sessionUser.id },
    });

    if (!dbUser) redirect("/login");

    const role = dbUser.role || "buyer";
    const isAdmin = role === "admin";

    // For regular users (buyers/sellers), fetch their latest seller application
    let latestSellerRequest = null;
    if (!isAdmin) {
        latestSellerRequest = await prisma.sellerRequest.findFirst({
            where: { userId: dbUser.id },
            orderBy: { createdAt: "desc" },
        });
    }

    // For admins, fetch all seller applications and user lists
    let allSellerRequests: any[] = [];
    let allUsers: any[] = [];

    if (isAdmin) {
        const [requests, users] = await Promise.all([
            prisma.sellerRequest.findMany({
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            role: true,
                        },
                    },
                },
                orderBy: { createdAt: "desc" },
            }),
            prisma.user.findMany({
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    status: true,
                    phone: true,
                    banned: true,
                    createdAt: true,
                    sellerRequests: {
                        select: {
                            storeName: true,
                            status: true,
                        },
                    },
                },
                orderBy: { createdAt: "desc" },
            }),
        ]);

        allSellerRequests = requests;
        allUsers = users;
    }

    return (
        <div className="min-h-screen bg-gray-50/60 py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
                        <p className="text-xs text-gray-500 mt-0.5">
                            Manage your EasyBuy account settings and view roles.
                        </p>
                    </div>
                    <SignOutButton />
                </div>

                {/* Profile Overview Card */}
                <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-linear-to-tr from-[#2B2420] to-[#5C4D44] text-white flex items-center justify-center font-bold text-xl shadow-xs">
                                {dbUser.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">{dbUser.name}</h2>
                                <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
                                    <Mail className="w-3.5 h-3.5 text-gray-400" />
                                    {dbUser.email}
                                </p>
                            </div>
                        </div>

                        {/* Role Badge */}
                        <div>
                            {role === "admin" && (
                                <span className="inline-flex items-center gap-1.5 bg-purple-100 text-purple-800 text-xs font-semibold px-3 py-1 rounded-full border border-purple-200">
                                    <Shield className="w-3.5 h-3.5" /> Administrator
                                </span>
                            )}
                            {role === "seller" && (
                                <span className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-800 text-xs font-semibold px-3 py-1 rounded-full border border-amber-200">
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Verified Seller
                                </span>
                            )}
                            {role === "buyer" && (
                                <span className="inline-flex items-center gap-1.5 bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full border border-blue-200">
                                    <User className="w-3.5 h-3.5" /> Buyer Account
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-xs">
                        <div className="flex items-center gap-2 text-gray-600">
                            <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                            <span><strong>Phone:</strong> {dbUser.phone || "Not provided"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                            <CheckCircle2 className="w-4 h-4 text-gray-400 shrink-0" />
                            <span><strong>Status:</strong> <span className="capitalize text-emerald-600 font-semibold">{dbUser.status || "Active"}</span></span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                            <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                            <span>
                                <strong>Member since:</strong>{" "}
                                {new Date(dbUser.createdAt).toLocaleDateString(undefined, {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                })}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Section for Buyers / Sellers: Become a Seller / Seller Status */}
                {!isAdmin && (
                    <BecomeSellerSection
                        userRole={role}
                        initialPhone={dbUser.phone}
                        existingRequest={latestSellerRequest}
                    />
                )}

                {/* Sections for Admins: Seller Requests & User Management */}
                {isAdmin && (
                    <>
                        <AdminSellerRequests requests={allSellerRequests} />
                        <AdminUsersList users={allUsers} />
                    </>
                )}
            </div>
        </div>
    );
}
