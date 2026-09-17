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
  "/kategoria-produktu/do-1000-zl": "/podroze/wyjazdy-do-1000-zl",
  "/kategoria-produktu/wylot-z-krakowa": "/podroze/wakacje-z-krakowa",
};

const LEGACY_TRIP_TYPE_REDIRECTS: Record<string, string> = {
  "/typ-wyjazdu/city-break": "/city-break",
  "/typ-wyjazdu/last-minute": "/last-minute",
  "/typ-wyjazdu/all-inclusive": "/wakacje",
  "/typ-wyjazdu/wakacje": "/wakacje",
  "/typ-wyjazdu/tanie-loty": "/tanie-loty",
  "/typ-wyjazdu/ze-zwiedzaniem": "/podroze-po-przezycia",
  "/typ-wyjazdu/dalekie-podroze": "/dalekie-podroze",
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
  "/aletry-todroznicze": "/alerty",
};

const SEO_CANONICAL_PATHS = {
  etna: "/etna-sparalizowala-loty-na-sycylie-co-zrobic-po-odwolaniu-lotu-do-katanii",
  liquids: "/lotniska-w-polsce-bez-limitu-100-ml-plynow",
  dogTravel: "/wakacje-z-psem-za-granica-gdzie-jechac-i-jak-sie-przygotowac",
  weekend: "/gdzie-poleciec-na-weekend-z-polski-12-pomyslow-na-city-break",
} as const;

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

function normalizedSeoPath(path: string) {
  try {
    return decodeURIComponent(path)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  } catch {
    return path.toLowerCase();
  }
}

function seoDuplicateCanonical(path: string) {
  const normalized = normalizedSeoPath(path);

  if (
    normalized !== SEO_CANONICAL_PATHS.etna &&
    normalized.startsWith("/etna-") &&
    normalized.includes("sycyli") &&
    (normalized.includes("lot") || normalized.includes("katani"))
  ) return SEO_CANONICAL_PATHS.etna;

  if (
    normalized !== SEO_CANONICAL_PATHS.liquids &&
    normalized.startsWith("/lotniska") &&
    normalized.includes("limit") &&
    normalized.includes("plyn")
  ) return SEO_CANONICAL_PATHS.liquids;

  if (
    normalized !== SEO_CANONICAL_PATHS.dogTravel &&
    normalized.startsWith("/wakacje-z-psem-za-granica")
  ) return SEO_CANONICAL_PATHS.dogTravel;

  if (
    normalized !== SEO_CANONICAL_PATHS.weekend &&
    normalized.startsWith("/gdzie-poleciec") &&
    normalized.includes("weekend") &&
    normalized.includes("city-break")
  ) return SEO_CANONICAL_PATHS.weekend;

  return null;
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

  const consolidatedPath = seoDuplicateCanonical(path);
  if (consolidatedPath) return permanentRedirect(request, consolidatedPath);

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
  if (LEGACY_TRIP_TYPE_REDIRECTS[path]) return permanentRedirect(request, LEGACY_TRIP_TYPE_REDIRECTS[path]);
  if (LEGACY_PAGE_REDIRECTS[path]) return permanentRedirect(request, LEGACY_PAGE_REDIRECTS[path]);

  const isWooCategory = path.startsWith("/kategoria-produktu/");
  const isWooProduct = path.startsWith("/produkt/");
  const isOldTripType = path.startsWith("/typ-wyjazdu/");
  const isOldShop = path === "/sklep" || path === "/tripownia-pl/sklep";
  const isOldDealsCatalog = path === "/tripownia-pl/okazje-tripownia";

  if (isWooCategory || isWooProduct || isOldTripType || isOldShop || isOldDealsCatalog) return permanentRedirect(request, "/okazje");
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
