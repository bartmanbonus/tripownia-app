import { NextRequest, NextResponse } from "next/server";
import { GET as getTodayOffers } from "@/app/api/today-offers/route";
import type { Offer } from "@/lib/offers";
import { eskySearchUrl } from "@/lib/eskySearch";

type LiveOffer = Offer & {
  startDateISO?: string;
  endDateISO?: string;
};

type TurnConfig = {
  from: string;
  to: string;
  airports: string[];
  airportLabel: string;
};

const TURNS: Record<string, TurnConfig> = {
  all: {
    from: "2027-01-18",
    to: "2027-02-28",
    airports: [],
    airportLabel: "cała Polska",
  },
  "turn-1": {
    from: "2027-01-18",
    to: "2027-01-31",
    airports: ["KTW", "WRO", "RZE", "LCJ"],
    airportLabel: "Katowice, Wrocław, Rzeszów, Łódź",
  },
  "turn-2": {
    from: "2027-02-01",
    to: "2027-02-14",
    airports: ["WAWA", "GDN", "LUZ"],
    airportLabel: "Warszawa, Gdańsk, Lublin",
  },
  "turn-3": {
    from: "2027-02-15",
    to: "2027-02-28",
    airports: ["KRK", "POZ", "SZZ", "BZG", "SZY", "IEG"],
    airportLabel: "Kraków, Poznań, Szczecin, Bydgoszcz, Olsztyn, Zielona Góra",
  },
};

const PRESETS = [
  { id: "italy", query: "Włochy", label: "Włochy", preferBoard: "" },
  { id: "austria", query: "Austria", label: "Austria", preferBoard: "" },
  { id: "egypt", query: "Egipt", label: "Egipt", preferBoard: "allinclusive" },
  { id: "turkey", query: "Turcja", label: "Turcja", preferBoard: "allinclusive" },
] as const;

function inRange(offer: LiveOffer, turn: TurnConfig) {
  if (!offer.startDateISO) return false;
  return offer.startDateISO >= turn.from && offer.startDateISO <= turn.to;
}

function usable(offer: LiveOffer, turn: TurnConfig) {
  return Boolean(
    offer &&
    Number.isFinite(Number(offer.price)) &&
    Number(offer.price) > 0 &&
    offer.affiliateUrl &&
    offer.availabilityStatus !== "expired" &&
    inRange(offer, turn)
  );
}

function pickBest(rows: LiveOffer[], turn: TurnConfig) {
  return rows
    .filter((offer) => usable(offer, turn))
    .sort((a, b) => {
      const aIdeal = a.nights >= 6 && a.nights <= 8 ? 0 : 1;
      const bIdeal = b.nights >= 6 && b.nights <= 8 ? 0 : 1;
      return aIdeal - bIdeal || Number(a.price) - Number(b.price);
    })[0] || null;
}

async function loadOffer(
  request: NextRequest,
  query: string,
  turn: TurnConfig,
  airports: string[],
  board = ""
) {
  const sourceUrl = new URL("/api/today-offers", request.url);
  const params: Record<string, string> = {
    mode: "search",
    q: query,
    fast: "1",
    strict: "1",
    start: turn.from,
    end: turn.to,
    dateKind: "departure",
    minNights: "5",
    maxNights: "9",
  };

  if (airports.length) params.from = airports.join(",");
  if (board) params.board = board;

  Object.entries(params).forEach(([key, value]) => sourceUrl.searchParams.set(key, value));
  const sourceRequest = new NextRequest(sourceUrl, { headers: request.headers });
  const response = await getTodayOffers(sourceRequest);
  const payload = await response.json() as { offers?: LiveOffer[]; notice?: string };

  return {
    offer: pickBest(Array.isArray(payload.offers) ? payload.offers : [], turn),
    notice: typeof payload.notice === "string" ? payload.notice : "",
  };
}

export async function GET(request: NextRequest) {
  const requestedTurn = request.nextUrl.searchParams.get("turn") || "all";
  const turn = TURNS[requestedTurn] || TURNS.all;

  const regional = await Promise.all(
    PRESETS.map(async (preset) => {
      let result = await loadOffer(request, preset.query, turn, turn.airports, preset.preferBoard);

      if (!result.offer && preset.preferBoard) {
        result = await loadOffer(request, preset.query, turn, turn.airports);
      }

      return { preset, result };
    })
  );

  const missing = regional.filter((item) => !item.result.offer);

  const nationwideFallbacks = await Promise.all(
    missing.map(async ({ preset }) => {
      let result = await loadOffer(request, preset.query, turn, [], preset.preferBoard);

      if (!result.offer && preset.preferBoard) {
        result = await loadOffer(request, preset.query, turn, []);
      }

      return [preset.id, result] as const;
    })
  );

  const fallbackMap = new Map(nationwideFallbacks);

  const presets = regional.map(({ preset, result }) => {
    if (result.offer) {
      return {
        id: preset.id,
        query: preset.query,
        label: preset.label,
        offer: result.offer,
        regionalDeparture: true,
        airportLabel: turn.airportLabel,
        searchUrl: eskySearchUrl({
          query: preset.query,
          departure: turn.airports.join(","),
          minNights: 5,
          maxNights: 9,
          start: turn.from,
          end: turn.to,
        }),
        notice: result.notice,
      };
    }

    const fallback = fallbackMap.get(preset.id);
    return {
      id: preset.id,
      query: preset.query,
      label: preset.label,
      offer: fallback?.offer || null,
      regionalDeparture: false,
      airportLabel: fallback?.offer ? String(fallback.offer.departure || "inne lotnisko w Polsce") : turn.airportLabel,
      searchUrl: eskySearchUrl({
        query: preset.query,
        departure: turn.airports.join(","),
        minNights: 5,
        maxNights: 9,
        start: turn.from,
        end: turn.to,
      }),
      notice: fallback?.notice || result.notice,
    };
  });

  return NextResponse.json(
    {
      ok: true,
      turn: requestedTurn in TURNS ? requestedTurn : "all",
      dates: { from: turn.from, to: turn.to },
      airports: turn.airports,
      airportLabel: turn.airportLabel,
      presets,
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=900, stale-while-revalidate=3600",
      },
    }
  );
}
