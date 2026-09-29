import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { runVirtualTryOn, GarmentCategory } from "@/lib/tryon";

const ALLOWED_CATEGORIES: GarmentCategory[] = ["Upper-body", "Lower-body", "Dress"];

export async function POST(req: NextRequest) {
  try {
    // 1. Session verification
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Please sign in to use the AI Virtual Trial Room." },
        { status: 401 }
      );
    }

    // 2. Parse request body
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { success: false, error: "Invalid JSON payload." },
        { status: 400 }
      );
    }

    const { personImage, garmentImage, category } = body;

    if (!personImage || typeof personImage !== "string") {
      return NextResponse.json(
        { success: false, error: "A person photo is required." },
        { status: 400 }
      );
    }

    if (!garmentImage || typeof garmentImage !== "string") {
      return NextResponse.json(
        { success: false, error: "A garment image is required." },
        { status: 400 }
      );
    }

    // 3. Normalize category
    let targetCategory: GarmentCategory = "Upper-body";
    if (category && ALLOWED_CATEGORIES.includes(category)) {
      targetCategory = category;
    }

    // 4. Run AI Virtual Try-On inference
    const result = await runVirtualTryOn({
      personImageUrl: personImage,
      garmentImageUrl: garmentImage,
      category: targetCategory,
    });

    if (!result.success || !result.resultImageUrl) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Virtual try-on generation failed. Please try another photo.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      resultImageUrl: result.resultImageUrl,
    });
  } catch (error: unknown) {
    console.error("[API /api/trial-room] Error:", error);
    const message = error instanceof Error ? error.message : "Internal server error occurred.";
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
