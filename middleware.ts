import { NextRequest, NextResponse } from "next/server";

function unauthorized() {
  return new NextResponse("Dostęp do panelu administracyjnego wymaga autoryzacji.", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Tripownia Admin", charset="UTF-8"',
      "Cache-Control": "no-store",
    },
  });
}

export function middleware(request: NextRequest) {
  const username = process.env.TRIPOWNIA_ADMIN_USER;
  const password = process.env.TRIPOWNIA_ADMIN_PASSWORD;

  // Fail closed on production: an unconfigured admin must not become public.
  if (!username || !password) {
    return new NextResponse(
      "Panel administratora jest zablokowany do czasu ustawienia TRIPOWNIA_ADMIN_USER i TRIPOWNIA_ADMIN_PASSWORD w Vercel.",
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }

  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Basic ")) return unauthorized();

  try {
    const decoded = atob(authorization.slice(6));
    const separator = decoded.indexOf(":");
    const suppliedUser = separator >= 0 ? decoded.slice(0, separator) : "";
    const suppliedPassword = separator >= 0 ? decoded.slice(separator + 1) : "";

    if (suppliedUser !== username || suppliedPassword !== password) {
      return unauthorized();
    }
  } catch {
    return unauthorized();
  }

  const response = NextResponse.next();
  response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
