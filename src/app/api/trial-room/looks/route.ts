import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Please sign in to view your saved looks." },
        { status: 401 }
      );
    }

    const looks = await prisma.tryOnLook.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ success: true, looks });
  } catch (error: unknown) {
    console.error("[API /api/trial-room/looks GET] Error:", error);
    const message = error instanceof Error ? error.message : "Internal server error.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Please sign in to save your looks." },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body || !body.productId || !body.productName || !body.imageUrl) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: productId, productName, or imageUrl." },
        { status: 400 }
      );
    }

    const look = await prisma.tryOnLook.create({
      data: {
        userId: session.user.id,
        productId: Number(body.productId),
        productName: String(body.productName).trim(),
        imageUrl: String(body.imageUrl).trim(),
      },
    });

    return NextResponse.json({ success: true, look });
  } catch (error: unknown) {
    console.error("[API /api/trial-room/looks POST] Error:", error);
    const message = error instanceof Error ? error.message : "Internal server error.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Please sign in." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing look ID." },
        { status: 400 }
      );
    }

    const deleteResult = await prisma.tryOnLook.deleteMany({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (deleteResult.count === 0) {
      return NextResponse.json(
        { success: false, error: "Look not found or unauthorized." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("[API /api/trial-room/looks DELETE] Error:", error);
    const message = error instanceof Error ? error.message : "Internal server error.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
