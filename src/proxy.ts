import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const PROTECTED_ROUTES = [
  "/events/my-events",
  "/events/createvent",
  "/events/edit",
  "/events/:path*",
  "/participations",
  "/settings",
];

const AUTH_ROUTES = ["/auth/login", "/auth/register"];

async function isTokenValid(token: string): Promise<boolean> {
  try {
    const secret = new TextEncoder().encode(process.env.SECRET_KEY || "");
    await jwtVerify(token, secret);
    return true;
  } catch (error) {
    console.log(
      "[MIDDLEWARE] Token invalid or expired:",
      error instanceof Error ? error.message : error,
    );
    return false;
  }
}

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some(
    (route) =>
      pathname === route || pathname.startsWith(route.replace(":path*", "")),
  );
}

function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.includes(pathname);
}

export async function middleware(request: NextRequest) {
  console.log("🔍 [MIDDLEWARE] EXECUTED");

  try {
    const { nextUrl, cookies } = request;
    const token = cookies.get("token")?.value;
    const pathname = nextUrl.pathname;

    console.log("[MIDDLEWARE] pathname:", pathname, "token:", !!token);

    const isProtected = isProtectedRoute(pathname);

    if (isProtected) {
      if (!token) {
        console.log("[MIDDLEWARE] No token, redirecting to login");
        const loginUrl = new URL("/auth/login", nextUrl.origin);
        loginUrl.searchParams.set("from", pathname);
        return NextResponse.redirect(loginUrl);
      }

      const tokenValid = await isTokenValid(token);
      if (!tokenValid) {
        console.log("[MIDDLEWARE] Token expired, clearing and redirecting");
        const loginUrl = new URL("/auth/login", nextUrl.origin);
        loginUrl.searchParams.set("from", pathname);
        const response = NextResponse.redirect(loginUrl);
        response.cookies.set("token", "", { maxAge: 0, path: "/" });
        return response;
      }

      console.log("[MIDDLEWARE] Token valid, granting access");
      return NextResponse.next();
    }

    if (isAuthRoute(pathname) && token) {
      const tokenValid = await isTokenValid(token);
      if (tokenValid) {
        console.log(
          "[MIDDLEWARE] User already logged in, redirecting to /events",
        );
        return NextResponse.redirect(new URL("/events", nextUrl.origin));
      }
    }

    return NextResponse.next();
  } catch (error) {
    console.error(
      "[MIDDLEWARE ERROR]:",
      error instanceof Error ? error.message : error,
    );
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    "/events/:path*",
    "/participations/:path*",
    "/settings/:path*",
    "/auth/login",
    "/auth/register",
  ],
};
