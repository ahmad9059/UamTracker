import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Public routes that don't require authentication
  const publicRoutes = ["/", "/calculator", "/login", "/register", "/api/auth"];
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // Check for an existing Better Auth session
  const sessionCookie = request.cookies.get("better-auth.session_token");

  // If the user hits login/register while already authenticated, send them back
  if (
    sessionCookie?.value &&
    (pathname === "/login" || pathname === "/register")
  ) {
    const target =
      request.nextUrl.searchParams.get("callbackUrl") || "/dashboard";
    return NextResponse.redirect(new URL(target, request.url));
  }

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Check for protected routes (dashboard)
  if (pathname.startsWith("/dashboard")) {
    if (!sessionCookie?.value) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
