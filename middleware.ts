import { NextRequest, NextResponse } from "next/server";

// Protect all (main) routes — require a valid session cookie
const PROTECTED = ["/challenges", "/leaderboard", "/profile"];
const ADMIN_ONLY = ["/admin"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED.some((p) => pathname.startsWith(p));
  const isAdmin = ADMIN_ONLY.some((p) => pathname.startsWith(p));

  if (isProtected || isAdmin) {
    // Better Auth sets a "better-auth.session_token" cookie
    const sessionCookie = request.cookies.get("better-auth.session_token");
    if (!sessionCookie) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/challenges/:path*", "/leaderboard/:path*", "/profile/:path*", "/admin/:path*"],
};
