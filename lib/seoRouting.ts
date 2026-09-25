export const PRIVATE_APP_PATHS = [
  "/app", "/dla-ciebie", "/moja-podroz", "/moje-podroze", "/dodaj-podroz",
  "/organizer", "/konto", "/porownaj", "/ulubione", "/alerty", "/profil",
];

export function isPrivateAppPath(pathname: string) {
  return PRIVATE_APP_PATHS.some(path => pathname === path || pathname.startsWith(`${path}/`));
}

export const LEGACY_CATEGORY_REDIRECTS: Record<string, string> = {
  "/kategoria-produktu/all-inclusive": "/wakacje",
  "/kategoria-produktu/wakacje": "/wakacje",
  "/kategoria-produktu/last-minute": "/last-minute",
  "/kategoria-produktu/city-break": "/city-break",
  "/kategoria-produktu/tanie-loty": "/tanie-loty",
  "/kategoria-produktu/ze-zwiedzaniem": "/podroze-po-przezycia",
  "/kategoria-produktu/do-1000-zl": "/podroze/wyjazdy-do-1000-zl",
  "/kategoria-produktu/wylot-z-krakowa": "/podroze/wakacje-z-krakowa",
};

export const LEGACY_PAGE_REDIRECTS: Record<string, string> = {
  "/wakacje-z-gdanska-2": "/podroze/wakacje-z-gdanska",
  "/wakacje-z-rzeszowa-all-inclusive-last-minute-i-lot-hotel": "/podroze/wakacje-z-rzeszowa",
  "/wakacje-ze-szczecina-all-inclusive-last-minute-i-lot-hotel": "/podroze/wakacje-z-szczecina",
  "/lublin-wakacje-city-break": "/podroze/city-break-z-lublina",
  "/wakacje-z-poznania": "/podroze/wakacje-z-poznania",
  "/wakacje-z-olsztyna-mazur-all-inclusive-last-minute-i-lot-hotel": "/podroze/wakacje-z-olsztyna-mazur",
  "/wroclaw": "/podroze/wakacje-z-wroclawia",
  "/katowice": "/podroze/wakacje-z-katowic",
  "/city-break-2": "/city-break",
  "/aletry-todroznicze": "/alerty",
  "/moj-planner": "/moja-podroz",
  "/planner": "/moja-podroz",
  "/planer": "/moja-podroz",
};

const SEO_CANONICAL_PATHS = {
  etna: "/etna-sparalizowala-loty-na-sycylie-co-zrobic-po-odwolaniu-lotu-do-katanii",
  liquids: "/lotniska-w-polsce-bez-limitu-100-ml-plynow",
  dogTravel: "/wakacje-z-psem-za-granica-gdzie-jechac-i-jak-sie-przygotowac",
  weekend: "/gdzie-poleciec-na-weekend-z-polski-12-pomyslow-na-city-break",
} as const;

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

export function seoDuplicateCanonical(path: string) {
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

export function canonicalPublicPath(pathname: string): string {
  const path = pathname.replace(/\/$/, "") || "/";
  if (path.endsWith("/post_id")) return canonicalPublicPath(path.slice(0, -8) || "/");
  const target = seoDuplicateCanonical(path) || LEGACY_CATEGORY_REDIRECTS[path] || LEGACY_PAGE_REDIRECTS[path];
  if (target) return target;
  if (path.startsWith("/kategoria-produktu/") || path.startsWith("/produkt/") ||
      ["/sklep", "/tripownia-pl/sklep", "/tripownia-pl/okazje-tripownia"].includes(path)) return "/okazje";
  return path;
}
