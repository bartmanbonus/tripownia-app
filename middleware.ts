import { NextRequest, NextResponse } from "next/server";

const PRIVATE_APP_PATHS = [
  "/app", "/dla-ciebie", "/moja-podroz", "/porownaj", "/ulubione", "/alerty", "/profil",
];

const EXPERIENCE_IMAGE_FILES: Record<string, string> = {
  "/images/experiences/islandia-zorza.png": "Aurora Borealis activity on top of the Kirkjufell mountain in September 2018.jpg",
  "/images/experiences/japonia-sakura.png": "Mount Fuji April Cherry Blossom.jpg",
  "/images/experiences/norwegia-fiordy.png": "Geirangerfjord from Ørnesvingen, 2013 June.jpg",
  "/images/experiences/nowa-zelandia.png": "Milford Sound, New Zealand (002).JPG",
  "/images/experiences/holandia-tulipany.png": "Tulip fields of Holland.jpg",
  "/images/experiences/kenia-safari.png": "Elephant in Maasai Mara landscape, Kenya.jpg",
  "/images/experiences/jarmarki.png": "Rathaus Wien Christkindlmarkt Front Panorama.jpg",
  "/images/experiences/egzotyka.png": "Anse Source d'Argent - La Digue - Seychelles - 03.jpg",
};

const LEGACY_CATEGORY_REDIRECTS: Record<string, string> = {
  "/kategoria-produktu/all-inclusive": "/wakacje",
  "/kategoria-produktu/wakacje": "/wakacje",
  "/kategoria-produktu/last-minute": "/last-minute",
  "/kategoria-produktu/city-break": "/city-break",
  "/kategoria-produktu/tanie-loty": "/tanie-loty",
  "/kategoria-produktu/ze-zwiedzaniem": "/podroze-po-przezycia",
};

const LEGACY_PAGE_REDIRECTS: Record<string, string> = {
  "/wakacje-z-gdanska-2": "/podroze/wakacje-z-gdanska",
  "/wakacje-z-rzeszowa-all-inclusive-last-minute-i-lot-hotel": "/podroze/wakacje-z-rzeszowa",
  "/wakacje-ze-szczecina-all-inclusive-last-minute-i-lot-hotel": "/podroze/wakacje-ze-szczecina",
  "/lublin-wakacje-city-break": "/podroze/city-break-z-lublina",
  "/wakacje-z-poznania": "/podroze/wakacje-z-poznania",
  "/wakacje-z-olsztyna-mazur-all-inclusive-last-minute-i-lot-hotel": "/podroze/wakacje-z-olsztyna-mazur",
  "/wroclaw": "/podroze/wakacje-z-wroclawia",
  "/katowice": "/podroze/wakacje-z-katowic",
  "/city-break-2": "/city-break",
};

function unauthorized() {
  return new NextResponse("Dostęp do panelu administracyjnego wymaga autoryzacji.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Tripownia Admin", charset="UTF-8"', "Cache-Control": "no-store" },
  });
}

function highQualityExperienceImageRedirect(request: NextRequest) {
  const filename = EXPERIENCE_IMAGE_FILES[request.nextUrl.pathname];
  if (!filename) return null;
  const target = new URL(`https://commons.wikimedia.org/wiki/Special:Redirect/file/${encodeURIComponent(filename)}`);
  target.searchParams.set("width", "2400");
  const response = NextResponse.redirect(target, 307);
  response.headers.set("Cache-Control", "public, max-age=86400, s-maxage=604800, stale-while-revalidate=2592000");
  return response;
}

function permanentRedirect(request: NextRequest, pathname: string) {
  const target = request.nextUrl.clone();
  target.pathname = pathname;
  target.search = "";
  return NextResponse.redirect(target, 308);
}

function cleanLegacyWordPressUrl(request: NextRequest) {
  const url = request.nextUrl.clone();
  const path = url.pathname.replace(/\/$/, "") || "/";
  const hasWpPostId = url.searchParams.has("p");
  const hasLegacyQueryPagination = Array.from(url.searchParams.keys()).some((key) => /^query-\d+-page$/i.test(key));

  if (path.endsWith("/post_id")) {
    const cleanPath = path.slice(0, -"/post_id".length) || "/";
    return permanentRedirect(request, cleanPath);
  }

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

  if (LEGACY_CATEGORY_REDIRECTS[path]) return permanentRedirect(request, LEGACY_CATEGORY_REDIRECTS[path]);
  if (LEGACY_PAGE_REDIRECTS[path]) return permanentRedirect(request, LEGACY_PAGE_REDIRECTS[path]);

  const isWooCategory = path.startsWith("/kategoria-produktu/");
  const isWooProduct = path.startsWith("/produkt/");
  const isOldShop = path === "/sklep" || path === "/tripownia-pl/sklep";
  const isOldDealsCatalog = path === "/tripownia-pl/okazje-tripownia";

  if (isWooCategory || isWooProduct || isOldShop || isOldDealsCatalog) return permanentRedirect(request, "/okazje");
  return null;
}

function isPrivateAppPath(pathname: string) {
  return PRIVATE_APP_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

export function middleware(request: NextRequest) {
  const experienceImageResponse = highQualityExperienceImageRedirect(request);
  if (experienceImageResponse) return experienceImageResponse;
  const legacyResponse = cleanLegacyWordPressUrl(request);
  if (legacyResponse) return legacyResponse;

  if (!request.nextUrl.pathname.startsWith("/admin")) {
    const response = NextResponse.next();
    if (isPrivateAppPath(request.nextUrl.pathname)) {
      response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
      response.headers.set("Cache-Control", "private, no-store");
    }
    return response;
  }

  const username = process.env.TRIPOWNIA_ADMIN_USER;
  const password = process.env.TRIPOWNIA_ADMIN_PASSWORD;
  if (!username || !password) {
    return new NextResponse("Panel administratora jest zablokowany do czasu ustawienia TRIPOWNIA_ADMIN_USER i TRIPOWNIA_ADMIN_PASSWORD w Vercel.", { status: 503, headers: { "Cache-Control": "no-store" } });
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

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"] };
