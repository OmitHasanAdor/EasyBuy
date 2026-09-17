"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

/**
 * Checks that the caller is an admin, using the role stored in the database.
 * The session's own copy of the role can be several minutes old because of
 * Better-Auth's cookie cache.
 */
async function requireAdminUser() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) return null;

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { id: true, role: true, status: true, banned: true },
    });
    if (!user || user.role !== "admin" || user.status !== "active" || user.banned) {
        return null;
    }
    return user;
}

function revalidateSellerPages() {
    revalidatePath("/profile");
    revalidatePath("/dashboard/admin/profile");
}

/**
 * Submit a request to become a seller.
 */
export async function submitSellerRequest(data: {
    storeName: string;
    phone?: string;
    description?: string;
}) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
        return { error: "You must be signed in to submit a seller request." };
    }

    const userId = session.user.id;
    const currentUser = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (!currentUser) {
        return { error: "User account not found." };
    }

    if (currentUser.role === "seller" || currentUser.role === "admin") {
        return { error: `You already have the '${currentUser.role}' role.` };
    }

    if (!data.storeName || data.storeName.trim().length < 2) {
        return { error: "Store name must be at least 2 characters." };
    }

    // Check for existing pending request
    const existingPending = await prisma.sellerRequest.findFirst({
        where: {
            userId,
            status: "PENDING",
        },
    });

    if (existingPending) {
        return { error: "You already have a pending seller request under review." };
    }

    // Update user's phone if provided
    if (data.phone?.trim()) {
        await prisma.user.update({
            where: { id: userId },
            data: { phone: data.phone.trim() },
        });
    }

    // Create the seller request
    const newRequest = await prisma.sellerRequest.create({
        data: {
            userId,
            storeName: data.storeName.trim(),
            phone: data.phone?.trim() || currentUser.phone || null,
            description: data.description?.trim() || null,
            status: "PENDING",
        },
    });

    revalidatePath("/profile");
    return { success: true, request: newRequest };
}

/**
 * Admin action to approve a seller request.
 * Only PENDING requests can be approved (EB-13).
 */
export async function approveSellerRequest(requestId: string) {
    const admin = await requireAdminUser();
    if (!admin) {
        return { error: "Unauthorized: Only administrators can approve seller requests." };
    }

    const sellerReq = await prisma.sellerRequest.findUnique({
        where: { id: requestId },
    });

    if (!sellerReq) {
        return { error: "Seller request not found." };
    }

    if (sellerReq.status !== "PENDING") {
        return { error: `This request was already ${sellerReq.status.toLowerCase()}.` };
    }

    const approved = await prisma.$transaction(async (tx) => {
        // conditional update: two admins clicking at once can't both act on it
        const updated = await tx.sellerRequest.updateMany({
            where: { id: requestId, status: "PENDING" },
            data: { status: "APPROVED", adminNote: null },
        });
        if (updated.count === 0) return false;

        await tx.user.update({
            where: { id: sellerReq.userId },
            data: { role: "seller" },
        });
        return true;
    });

    if (!approved) {
        return { error: "This request was already handled by another admin." };
    }

    revalidateSellerPages();
    return { success: true };
}

/**
 * Admin action to reject a seller request.
 * Only PENDING requests can be rejected; an approved seller is removed with
 * revokeSellerRequest instead, which also takes the seller role away (EB-13).
 */
export async function rejectSellerRequest(requestId: string, adminNote?: string) {
    const admin = await requireAdminUser();
    if (!admin) {
        return { error: "Unauthorized: Only administrators can reject seller requests." };
    }

    const sellerReq = await prisma.sellerRequest.findUnique({
        where: { id: requestId },
    });

    if (!sellerReq) {
        return { error: "Seller request not found." };
    }

    if (sellerReq.status !== "PENDING") {
        return { error: `This request was already ${sellerReq.status.toLowerCase()}.` };
    }

    const updated = await prisma.sellerRequest.updateMany({
        where: { id: requestId, status: "PENDING" },
        data: {
            status: "REJECTED",
            adminNote: adminNote?.trim() || null,
        },
    });

    if (updated.count === 0) {
        return { error: "This request was already handled by another admin." };
    }

    revalidateSellerPages();
    return { success: true };
}
