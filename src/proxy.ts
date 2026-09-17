import { NextResponse, type NextRequest } from "next/server";

// Product ids are positive integers. For anything else (/products/abc) the
// product can't exist, so answer with a real 404 status right away. Once the
// page starts streaming (root loading.tsx), notFound() can only send a 200
// with a noindex tag (EB-19).
export function proxy(request: NextRequest) {
  const id = request.nextUrl.pathname.split("/")[2] ?? "";

  if (!/^\d{1,10}$/.test(id)) {
    return NextResponse.rewrite(new URL("/_not-found", request.url), { status: 404 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/products/:id",
};
