import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

// Páginas que requerem autenticação
const PRIVATE = ["/profile", "/admin"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // --- 1. Lógica de Analytics (Corre para TODAS as páginas do matcher) ---
  try {
    const { env } = await getCloudflareContext({ async: true });
    if (env.ANALYTICS) {
      env.ANALYTICS.writeDataPoint({
        blobs: [
          'pageview', 
          pathname, 
          request.headers.get('cf-ipcountry') || 'XX'
        ],
        doubles: [1],
        indexes: [crypto.randomUUID()]
      });
    }
  } catch (e) {
    // Falha silenciosa no analytics para não bloquear o site
    console.error("Analytics Error:", e);
  }

  // --- 2. Lógica de Autenticação (A tua lógica original) ---
  if (PRIVATE.some((p) => pathname.startsWith(p))) {
    const cookieHeader = request.headers.get("cookie") ?? "";
    const hasSession = cookieHeader.includes("better-auth.session_token=");

    if (!hasSession) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

// --- 3. Atualização do Matcher ---
export const config = {
  matcher: [
    /*
     * Protege as rotas privadas mas também permite ao middleware
     * correr em páginas públicas para o Analytics funcionar.
     */
    "/profile/:path*", 
    "/admin/:path*",
    "/",               // Home
    "/challenges/:path*", 
    "/leaderboard/:path*"
  ],
};