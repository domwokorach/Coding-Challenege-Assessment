import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// The learner cannot enter the coding assessment (or resume/save progress,
// or view completion) without an active session. This check runs server-side
// in middleware — it is the enforcement point, not a frontend boolean.
const isProtectedRoute = createRouteMatcher([
  "/programme(.*)",
  "/coding-assessment(.*)",
  "/challenges(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    const { userId } = await auth();
    if (!userId) {
      const gate = new URL("/auth-required", req.url);
      gate.searchParams.set("next", req.nextUrl.pathname);
      return NextResponse.redirect(gate);
    }
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/:path*",
  ],
};
