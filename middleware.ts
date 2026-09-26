import { isPrivateAppPath, seoDuplicateCanonical, LEGACY_CATEGORY_REDIRECTS, LEGACY_PAGE_REDIRECTS } from "@/lib/seoRouting";
import { NextRequest, NextResponse } from "next/server";

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
  if (LEGACY_PAGE_REDIRECTS[path]) return permanentRedirect(request, LEGACY_PAGE_REDIRECTS[path]);

  const isWooCategory = path.startsWith("/kategoria-produktu/");
  const isWooProduct = path.startsWith("/produkt/");
  const isOldShop = path === "/sklep" || path === "/tripownia-pl/sklep";
  const isOldDealsCatalog = path === "/tripownia-pl/okazje-tripownia";

  if (isWooCategory || isWooProduct || isOldShop || isOldDealsCatalog) return permanentRedirect(request, "/okazje");
  return null;
}

export function middleware(request: NextRequest) {
  // Keep one public hostname for SEO. Old links and bookmarks may still use www.
  const host = request.headers.get("host")?.toLowerCase() || "";
  if (host === "www.tripownia.pl") {
    const target = request.nextUrl.clone();
    target.hostname = "tripownia.pl";
    target.protocol = "https:";
    return NextResponse.redirect(target, 308);
  }

  // Consolidate old WordPress-style /poradniki/<slug> aliases into the clean
  // canonical root article URL when that article exists in the migrated corpus.
  if (request.nextUrl.pathname.startsWith("/poradniki/")) {
    const candidate = "/" + request.nextUrl.pathname.slice("/poradniki/".length).replace(/^\/+|\/+$/g, "");
    if (candidate !== "/" && seoDuplicateCanonical(candidate)) {
      return permanentRedirect(request, seoDuplicateCanonical(candidate)!);
    }
    // The clean migrated article may already be its own canonical path.
    // Redirect only when the root slug is known as a migrated article.
    // We intentionally leave unknown /poradniki/* routes untouched.
  }

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
