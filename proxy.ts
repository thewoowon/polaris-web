import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes under (authed) route group. proxy.ts is the hard gate —
// AuthGuard is a belt-and-suspenders client check for runtime session expiry.
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/reviews",
  "/queue",
  "/kb",
  "/audit",
  "/settings",
];

function isProtected(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!isProtected(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get("polaris.access")?.value;
  if (token) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/login", request.url);
  // Optional: remember where we tried to go so /login can redirect back.
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/reviews/:path*",
    "/queue/:path*",
    "/kb/:path*",
    "/audit/:path*",
    "/settings/:path*",
  ],
};
