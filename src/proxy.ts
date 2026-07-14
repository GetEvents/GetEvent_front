import { decodeJwt } from "jose";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_ROUTES = [
  "/events/my-events",
  "/events/createvent",
  "/events/editEvent",
  "/participations",
  "/settings",
  "/dashboard",
];

const GUEST_ONLY_ROUTES = ["/", "/auth/login", "/auth/register"];
const REFRESH_SKEW_SECONDS = 60;

type SessionTokens = {
  token: string;
  refreshToken: string;
};

const getApiBaseUrl = () =>
  process.env.API_INTERNAL_URL ||
  process.env.NEXT_PUBLIC_SOCKET_URL ||
  process.env.NEXT_PUBLIC_API_ENDPOINT ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:3001";

const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
});

function isAccessTokenUsable(token: string): boolean {
  try {
    const payload = decodeJwt(token);

    if (payload.type && payload.type !== "access") {
      return false;
    }

    if (!payload.exp) {
      return false;
    }

    const expiresAt = payload.exp * 1000;
    const refreshBefore = Date.now() + REFRESH_SKEW_SECONDS * 1000;
    return expiresAt > refreshBefore;
  } catch {
    return false;
  }
}

function getTokensFromPayload(payload: unknown): SessionTokens | null {
  const data = payload as {
    token?: unknown;
    refreshToken?: unknown;
    data?: {
      token?: unknown;
      refreshToken?: unknown;
    };
  };

  const token = data.token || data.data?.token;
  const refreshToken = data.refreshToken || data.data?.refreshToken;

  if (typeof token !== "string" || typeof refreshToken !== "string") {
    return null;
  }

  return { token, refreshToken };
}

async function refreshSession(
  refreshToken: string,
): Promise<SessionTokens | null> {
  try {
    const response = await fetch(`${getApiBaseUrl()}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    return getTokensFromPayload(await response.json());
  } catch {
    return null;
  }
}

function continueWithSession(
  request: NextRequest,
  tokens: SessionTokens,
): NextResponse {
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
    ...getCookieOptions(),
    maxAge: 15 * 60,
  });
  response.cookies.set("refreshToken", tokens.refreshToken, {
    ...getCookieOptions(),
    maxAge: 30 * 24 * 60 * 60,
  });

  return response;
}

function clearSession(response: NextResponse): NextResponse {
  response.cookies.set("token", "", {
    ...getCookieOptions(),
    maxAge: 0,
  });
  response.cookies.set("refreshToken", "", {
    ...getCookieOptions(),
    maxAge: 0,
  });
  return response;
}

function redirectWithSession(
  request: NextRequest,
  pathname: string,
  tokens: SessionTokens,
): NextResponse {
  const response = NextResponse.redirect(
    new URL(pathname, request.nextUrl.origin),
  );

  response.cookies.set("token", tokens.token, {
    ...getCookieOptions(),
    maxAge: 15 * 60,
  });
  response.cookies.set("refreshToken", tokens.refreshToken, {
    ...getCookieOptions(),
    maxAge: 30 * 24 * 60 * 60,
  });

  return response;
}

function redirectToLogin(request: NextRequest): NextResponse {
  const loginUrl = new URL("/auth/login", request.nextUrl.origin);
  loginUrl.searchParams.set("from", request.nextUrl.pathname);
  return clearSession(NextResponse.redirect(loginUrl));
}

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

function isGuestOnlyRoute(pathname: string): boolean {
  return GUEST_ONLY_ROUTES.includes(pathname);
}

export async function proxy(request: NextRequest) {
  const { nextUrl, cookies } = request;
  const pathname = nextUrl.pathname;
  const token = cookies.get("token")?.value;
  const refreshToken = cookies.get("refreshToken")?.value;
  const isProtected = isProtectedRoute(pathname);

  if (isProtected) {
    if (token && isAccessTokenUsable(token)) {
      return NextResponse.next();
    }

    if (refreshToken) {
      const refreshedTokens = await refreshSession(refreshToken);
      if (refreshedTokens) {
        return continueWithSession(request, refreshedTokens);
      }
    }

    return redirectToLogin(request);
  }

  if (isGuestOnlyRoute(pathname)) {
    if (token && isAccessTokenUsable(token)) {
      return NextResponse.redirect(new URL("/events", nextUrl.origin));
    }

    if (refreshToken) {
      const refreshedTokens = await refreshSession(refreshToken);
      if (refreshedTokens) {
        return redirectWithSession(request, "/events", refreshedTokens);
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/events/my-events/:path*",
    "/events/createvent/:path*",
    "/events/editEvent/:path*",
    "/participations/:path*",
    "/settings/:path*",
    "/dashboard/:path*",
    "/auth/login",
    "/auth/register",
  ],
};
