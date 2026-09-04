declare const process: { env: Record<string, string | undefined> };

export type EskyFlightResult = {
  id: string;
  price: number;
  currency: string;
  bookingUrl: string;
  outbound?: {
    departureAirport?: string;
    arrivalAirport?: string;
    departureDate?: string;
    arrivalDate?: string;
    flightNumber?: string;
  };
  inbound?: {
    departureAirport?: string;
    arrivalAirport?: string;
    departureDate?: string;
    arrivalDate?: string;
    flightNumber?: string;
  };
};

function midnightUtcMs(isoDate: string) {
  const [year, month, day] = isoDate.split("-").map(Number);
  return Date.UTC(year, month - 1, day, 0, 0, 0, 0);
}

function normalizeDomain(value: string) {
  const trimmed = value.trim().replace(/\/$/, "");
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function parseEskyDate(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const match = value.match(/Date\((\d+)\)/);
  if (match) {
    const date = new Date(Number(match[1]));
    if (!Number.isNaN(date.getTime())) return date.toISOString();
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
}

function firstSegment(leg: any) {
  const segment = Array.isArray(leg?.Segs) ? leg.Segs[0] : undefined;
  if (!segment) return undefined;
  return {
    departureAirport: segment.DAC || undefined,
    arrivalAirport: segment.AAC || undefined,
    departureDate: parseEskyDate(segment.DD),
    arrivalDate: parseEskyDate(segment.AD),
    flightNumber: [segment.AC, segment.FN].filter(Boolean).join(" ") || undefined,
  };
}

export function eskyApiConfig() {
  const partnerCode = process.env.ESKY_PARTNER_CODE?.trim() || "";
  const partnerPrefix = process.env.ESKY_PARTNER_PREFIX?.trim() || "";
  const redirectDomain = process.env.ESKY_REDIRECT_DOMAIN?.trim() || "";
  const explicitApiUrl = process.env.ESKY_API_URL?.trim() || "";

  const apiUrl = explicitApiUrl || (partnerPrefix
    ? `https://${partnerPrefix}.api.lucky2go.com/ets/SearchFlights`
    : "");

  return {
    configured: Boolean(partnerCode && partnerPrefix && redirectDomain && apiUrl),
    partnerCode,
    partnerPrefix,
    redirectDomain: redirectDomain ? normalizeDomain(redirectDomain) : "",
    apiUrl,
  };
}

export async function searchEskyFlights(input: {
  departureCode: string;
  arrivalCode: string;
  departureDate: string;
  returnDate?: string;
  adults: number;
  currency?: string;
  language?: string;
}): Promise<EskyFlightResult[]> {
  const config = eskyApiConfig();
  if (!config.configured) return [];

  const legs = [
    {
      DepartureCode: input.departureCode,
      ArrivalCode: input.arrivalCode,
      DepartureDate: `/Date(${midnightUtcMs(input.departureDate)})/`,
    },
  ];

  if (input.returnDate) {
    legs.push({
      DepartureCode: input.arrivalCode,
      ArrivalCode: input.departureCode,
      DepartureDate: `/Date(${midnightUtcMs(input.returnDate)})/`,
    });
  }

  const payload = {
    partnerCode: config.partnerCode,
    partnerPrefix: config.partnerPrefix,
    requestType: 1,
    runtimeMode: 1,
    serviceType: 1,
    PricePerPax: true,
    CurrencyCode: input.currency || "PLN",
    LanguageCode: input.language || "PL",
    Airlines: [],
    DirectFlights: false,
    Legs: legs,
    Passengers: [{ Code: 1, Count: Math.max(1, Math.min(9, input.adults)) }],
    ServiceClass: 1,
    DeepLink: true,
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  let response: Response;
  try {
    response = await fetch(config.apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8", Accept: "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    throw new Error(`eSky API HTTP ${response.status}`);
  }

  const data = await response.json();
  const items = Array.isArray(data?.Items) ? data.Items : [];

  return items
    .map((item: any, index: number): EskyFlightResult | null => {
      const resultLegs = Array.isArray(item?.Legs) ? item.Legs : [];
      const hashes: string[] = resultLegs.map((leg: any) => leg?.PI).filter((value: unknown): value is string => typeof value === "string" && value.length > 0);
      if (!hashes.length) return null;

      const bookingPath = hashes.map(hash => encodeURIComponent(hash)).join("/");
      const bookingUrl = `${config.redirectDomain}/flights/deeplink/${bookingPath}?partner_id=${encodeURIComponent(config.partnerCode)}`;
      const price = Number(item?.P);

      return {
        id: String(item?.FlightId || item?.FID || `${index}-${hashes[0].slice(0, 12)}`),
        price: Number.isFinite(price) ? price : 0,
        currency: String(item?.C || input.currency || "PLN"),
        bookingUrl,
        outbound: firstSegment(resultLegs[0]),
        inbound: firstSegment(resultLegs[1]),
      };
    })
    .filter((item: EskyFlightResult | null): item is EskyFlightResult => Boolean(item))
    .sort((a: EskyFlightResult, b: EskyFlightResult) => a.price - b.price)
    .slice(0, 6);
}
