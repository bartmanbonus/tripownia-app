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

function cleanLegacyWordPressUrl(request: NextRequest) {
  const url = request.nextUrl.clone();
  const path = url.pathname.replace(/\/$/, "") || "/";
  const hasWpPostId = url.searchParams.has("p");
  const hasLegacyQueryPagination = Array.from(url.searchParams.keys()).some((key) => /^query-\d+-page$/i.test(key));

  if (hasWpPostId) {
    return new NextResponse("Ta stara strona WordPress nie jest już dostępna.", {
      status: 410,
      headers: { "X-Robots-Tag": "noindex, nofollow, noarchive", "Cache-Control": "public, max-age=3600" },
    });
  }

  if (hasLegacyQueryPagination) {
    for (const key of Array.from(url.searchParams.keys())) if (/^query-\d+-page$/i.test(key)) url.searchParams.delete(key);
    return NextResponse.redirect(url, 308);
  }

  const isWooCategory = path.startsWith("/kategoria-produktu/");
  const isWooProduct = path.startsWith("/produkt/");
  const isOldShop = path === "/sklep" || path === "/tripownia-pl/sklep";
  const isOldDealsCatalog = path === "/tripownia-pl/okazje-tripownia";

  if (isWooCategory || isWooProduct || isOldShop || isOldDealsCatalog) {
    const target = request.nextUrl.clone();
    target.pathname = "/okazje";
    target.search = "";
    return NextResponse.redirect(target, 308);
  }
  return null;
}

export function middleware(request: NextRequest) {
  // Wyszukiwarka i Radar są niezależne. Zapytania wyszukiwarki czytają katalog,
  // a nie dzienną selekcję ani mechanizm rescue. __direct jest tylko dla joba,
  // który buduje nowy snapshot bez zapętlenia przez middleware.
  if (
    request.nextUrl.pathname === "/api/today-offers" &&
    request.nextUrl.searchParams.get("mode") === "search" &&
    request.nextUrl.searchParams.get("__direct") !== "1"
  ) {
    const target = request.nextUrl.clone();
    target.pathname = "/api/catalog";
    target.searchParams.delete("mode");
    target.searchParams.delete("broad");
    target.searchParams.delete("rescue");
    return NextResponse.rewrite(target);
  }

  const legacyResponse = cleanLegacyWordPressUrl(request);
  if (legacyResponse) return legacyResponse;

  const isAdminArea = request.nextUrl.pathname.startsWith("/admin") || request.nextUrl.pathname.startsWith("/api/admin");
  if (!isAdminArea) return NextResponse.next();

  const username = process.env.TRIPOWNIA_ADMIN_USER;
  const password = process.env.TRIPOWNIA_ADMIN_PASSWORD;
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
    if (suppliedUser !== username || suppliedPassword !== password) return unauthorized();
  } catch {
    return unauthorized();
  }

  const response = NextResponse.next();
  response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"],
};