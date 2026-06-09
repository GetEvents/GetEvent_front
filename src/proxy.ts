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
    const { payload } = await jwtVerify(token, secret);
    return !payload.type || payload.type === "access";
  } catch (error) {
    console.log(
      "[MIDDLEWARE] Token invalid or expired:",
      error instanceof Error ? error.message : error,
    );
    return false;
  }
}

async function refreshSession(
  refreshToken: string,
): Promise<{ token: string; refreshToken: string } | null> {
  const apiBaseUrl =
    process.env.NEXT_PUBLIC_SOCKET_URL ||
    process.env.NEXT_PUBLIC_API_ENDPOINT ||
    "http://localhost:3001";

  try {
    const response = await fetch(`${apiBaseUrl}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
    });

    if (!response.ok) return null;

    const data = await response.json();
    if (!data.token || !data.refreshToken) return null;

    return {
      token: data.token,
      refreshToken: data.refreshToken,
    };
  } catch {
    return null;
  }
}

function continueWithSession(
  request: NextRequest,
  tokens: { token: string; refreshToken: string },
): NextResponse {
  const secure = process.env.NODE_ENV === "production";
  const requestHeaders = new Headers(request.headers);
  const cookies = request.cookies
    .getAll()
    .filter(({ name }) => name !== "token" && name !== "refreshToken")
    .map(({ name, value }) => `${name}=${value}`);

  cookies.push(`token=${tokens.token}`);
  cookies.push(`refreshToken=${tokens.refreshToken}`);
  requestHeaders.set("cookie", cookies.join("; "));

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  response.cookies.set("token", tokens.token, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: 15 * 60,
  });
  response.cookies.set("refreshToken", tokens.refreshToken, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: 30 * 24 * 60 * 60,
  });

  return response;
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

export async function proxy(request: NextRequest) {
  console.log("🔍 [MIDDLEWARE] EXECUTED");

  try {
    const { nextUrl, cookies } = request;
    const token = cookies.get("token")?.value;
    const refreshToken = cookies.get("refreshToken")?.value;
    const pathname = nextUrl.pathname;

    console.log("[MIDDLEWARE] pathname:", pathname, "token:", !!token);

    const isProtected = isProtectedRoute(pathname);

    if (isProtected) {
      if (!token) {
        const refreshedTokens = refreshToken
          ? await refreshSession(refreshToken)
          : null;

        if (refreshedTokens) {
          return continueWithSession(request, refreshedTokens);
        }

        console.log("[MIDDLEWARE] No token, redirecting to login");
        const loginUrl = new URL("/auth/login", nextUrl.origin);
        loginUrl.searchParams.set("from", pathname);
        return NextResponse.redirect(loginUrl);
      }

      const tokenValid = await isTokenValid(token);
      if (!tokenValid) {
        const refreshedTokens = refreshToken
          ? await refreshSession(refreshToken)
          : null;

        if (refreshedTokens) {
          return continueWithSession(request, refreshedTokens);
        }

        console.log("[MIDDLEWARE] Session expired, clearing and redirecting");
        const loginUrl = new URL("/auth/login", nextUrl.origin);
        loginUrl.searchParams.set("from", pathname);
        const response = NextResponse.redirect(loginUrl);
        response.cookies.set("token", "", { maxAge: 0, path: "/" });
        response.cookies.set("refreshToken", "", { maxAge: 0, path: "/" });
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
