import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

// Optimistic auth check — verifies the JWT's signature and expiry from the
// cookie alone (no database round-trip; Proxy should stay fast and run on
// every navigation). Every protected route handler and page still
// re-verifies via lib/auth.ts's getAuthenticatedUserId(), which additionally
// checks the live token_version column — that's the real line of defense.
const SESSION_COOKIE_NAME = "session";

const PROTECTED_PATH_PREFIXES = [
  "/dashboard",
  "/programme",
  "/challenges",
  "/coding-assessment",
  "/account",
];

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

async function hasValidSession(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return false;

  const secret = process.env.JWT_SECRET;
  if (!secret) return false;

  try {
    await jwtVerify(token, new TextEncoder().encode(secret), {
      algorithms: ["HS256"],
    });
    return true;
  } catch {
    return false;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  const authenticated = await hasValidSession(request);
  if (!authenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/programme/:path*",
    "/challenges/:path*",
    "/coding-assessment/:path*",
    "/account/:path*",
  ],
};
