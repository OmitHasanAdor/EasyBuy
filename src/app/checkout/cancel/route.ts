import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const form = await req.formData().catch(() => null);
  const q = new URLSearchParams(req.nextUrl.search);

  if (form) {
    form.forEach((v, k) => {
      if (typeof v === "string") q.set(k, v);
    });
  }

  if (!q.get("orderId") && q.get("value_a")) {
    q.set("orderId", q.get("value_a")!);
  }

  const dest = new URL("/checkout/cancel-page", req.url);
  q.forEach((v, k) => dest.searchParams.set(k, v));
  return NextResponse.redirect(dest, 303);
}

export async function GET(req: NextRequest) {
  const dest = new URL("/checkout/cancel-page", req.url);
  req.nextUrl.searchParams.forEach((v, k) => dest.searchParams.set(k, v));
  return NextResponse.redirect(dest, 307);
}