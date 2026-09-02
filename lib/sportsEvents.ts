import { buildEskyFlightsUrl, partners } from "@/lib/partners";

export type SportsClub = {
  slug: string;
  names: string[];
  displayName: string;
  city: string;
  country: string;
  airportCode: string;
  competitionCodes: string[];
  ticketUrl: string;
  emoji: string;
};

export type SportsTrip = {
  id: string;
  clubSlug: string;
  club: string;
  opponent: string;
  city: string;
  country: string;
  competition: string;
  kickoff: string;
  venue?: string | null;
  source: "football-data" | "seed";
  ticketUrl: string;
  flightUrl: string;
  hotelUrl: string;
  packageUrl: string;
};

export const sportsClubs: SportsClub[] = [
  {
    slug: "fc-barcelona",
    names: ["FC Barcelona", "Barcelona"],
    displayName: "FC Barcelona",
    city: "Barcelona",
    country: "Hiszpania",
    airportCode: "BCN",
    competitionCodes: ["PD", "CL"],
    ticketUrl: "https://www.fcbarcelona.com/en/tickets/football",
    emoji: "🔵🔴",
  },
  {
    slug: "inter-mediolan",
    names: ["FC Internazionale Milano", "Inter Milan", "Inter Milano", "Internazionale"],
    displayName: "Inter Mediolan",
    city: "Mediolan",
    country: "Włochy",
    airportCode: "MIL",
    competitionCodes: ["SA", "CL"],
    ticketUrl: "https://www.inter.it/en/tickets",
    emoji: "⚫🔵",
  },
  {
    slug: "real-madryt",
    names: ["Real Madrid CF", "Real Madrid"],
    displayName: "Real Madryt",
    city: "Madryt",
    country: "Hiszpania",
    airportCode: "MAD",
    competitionCodes: ["PD", "CL"],
    ticketUrl: "https://www.realmadrid.com/en-US/tickets",
    emoji: "⚪",
  },
  {
    slug: "ac-milan",
    names: ["AC Milan", "Milan"],
    displayName: "AC Milan",
    city: "Mediolan",
    country: "Włochy",
    airportCode: "MIL",
    competitionCodes: ["SA", "CL"],
    ticketUrl: "https://www.acmilan.com/en/tickets",
    emoji: "🔴⚫",
  },
  {
    slug: "bayern-monachium",
    names: ["FC Bayern München", "Bayern Munich", "Bayern München"],
    displayName: "Bayern Monachium",
    city: "Monachium",
    country: "Niemcy",
    airportCode: "MUC",
    competitionCodes: ["BL1", "CL"],
    ticketUrl: "https://fcbayern.com/en/tickets",
    emoji: "🔴⚪",
  },
  {
    slug: "arsenal",
    names: ["Arsenal FC", "Arsenal"],
    displayName: "Arsenal",
    city: "Londyn",
    country: "Wielka Brytania",
    airportCode: "LON",
    competitionCodes: ["PL", "CL"],
    ticketUrl: "https://www.arsenal.com/tickets",
    emoji: "🔴",
  },
  {
    slug: "liverpool",
    names: ["Liverpool FC", "Liverpool"],
    displayName: "Liverpool",
    city: "Liverpool",
    country: "Wielka Brytania",
    airportCode: "LPL",
    competitionCodes: ["PL", "CL"],
    ticketUrl: "https://www.liverpoolfc.com/tickets",
    emoji: "🔴",
  },
];

type FootballDataMatch = {
  id: number;
  utcDate: string;
  status: string;
  venue?: string | null;
  competition?: { name?: string; code?: string };
  homeTeam?: { name?: string; shortName?: string };
  awayTeam?: { name?: string; shortName?: string };
};

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function addDays(date: Date, days: number) {
  const copy = new Date(date);
  copy.setUTCDate(copy.getUTCDate() + days);
  return copy;
}

function normalize(value?: string | null) {
  return (value || "").trim().toLocaleLowerCase("pl");
}

function clubMatchesTeam(club: SportsClub, name?: string | null) {
  const normalized = normalize(name);
  return club.names.some(alias =>
    normalized === normalize(alias) || normalized.includes(normalize(alias))
  );
}

function makeTrip(club: SportsClub, match: FootballDataMatch, source: SportsTrip["source"]): SportsTrip | null {
  const home = match.homeTeam?.name || match.homeTeam?.shortName || "";
  const away = match.awayTeam?.name || match.awayTeam?.shortName || "";
  if (!clubMatchesTeam(club, home)) return null;

  const hotelUrl = partners.booking.buildUrl(
    `https://www.booking.com/searchresults.pl.html?ss=${encodeURIComponent(club.city)}`
  );
  const flightUrl = buildEskyFlightsUrl(
    `https://www.esky.pl/tanie-loty/?to=${encodeURIComponent(club.airportCode)}`
  );

  const packageUrl = partners.esky.buildUrl(
    "https://www2.esky.pl/lot+hotel/portfolio?context=pl-packages"
  );

  return {
    id: String(match.id),
    clubSlug: club.slug,
    club: club.displayName,
    opponent: away,
    city: club.city,
    country: club.country,
    competition: match.competition?.name || match.competition?.code || "Mecz",
    kickoff: match.utcDate,
    venue: match.venue,
    source,
    ticketUrl: club.ticketUrl,
    flightUrl,
    hotelUrl,
    packageUrl,
  };
}

async function fetchCompetitionMatches(code: string, dateFrom: string, dateTo: string) {
  const token = process.env.FOOTBALL_DATA_API_KEY;
  if (!token) return [] as FootballDataMatch[];

  const url = new URL(`https://api.football-data.org/v4/competitions/${code}/matches`);
  url.searchParams.set("dateFrom", dateFrom);
  url.searchParams.set("dateTo", dateTo);
  url.searchParams.set("status", "SCHEDULED");

  const response = await fetch(url, {
    headers: { "X-Auth-Token": token },
    next: { revalidate: 21600 },
  });

  if (!response.ok) return [];
  const data = await response.json();
  return Array.isArray(data.matches) ? data.matches : [];
}

const seedMatches: FootballDataMatch[] = [
  { id: 100001, utcDate: "2026-09-09T16:45:00Z", status: "SCHEDULED", venue: "Spotify Camp Nou", competition: { name: "UEFA Champions League", code: "CL" }, homeTeam: { name: "FC Barcelona" }, awayTeam: { name: "Feyenoord Rotterdam" } },
  { id: 100002, utcDate: "2026-09-16T19:30:00Z", status: "SCHEDULED", venue: "Spotify Camp Nou", competition: { name: "La Liga", code: "PD" }, homeTeam: { name: "FC Barcelona" }, awayTeam: { name: "Racing Santander" } },
  { id: 100003, utcDate: "2026-10-25T20:00:00Z", status: "SCHEDULED", venue: "Spotify Camp Nou", competition: { name: "La Liga", code: "PD" }, homeTeam: { name: "FC Barcelona" }, awayTeam: { name: "Real Madrid" } },
  { id: 100004, utcDate: "2026-09-05T16:00:00Z", status: "SCHEDULED", venue: "San Siro", competition: { name: "Serie A", code: "SA" }, homeTeam: { name: "Inter Milan" }, awayTeam: { name: "SSC Napoli" } },
  { id: 100005, utcDate: "2026-10-10T13:00:00Z", status: "SCHEDULED", venue: "San Siro", competition: { name: "Serie A", code: "SA" }, homeTeam: { name: "Inter Milan" }, awayTeam: { name: "Parma Calcio" } },
  { id: 100006, utcDate: "2026-10-13T19:00:00Z", status: "SCHEDULED", venue: "San Siro", competition: { name: "UEFA Champions League", code: "CL" }, homeTeam: { name: "Inter Milan" }, awayTeam: { name: "Club Brugge" } },
];

export async function getSportsTrips(daysAhead = 120): Promise<SportsTrip[]> {
  const now = new Date();
  const dateFrom = isoDate(now);
  const dateTo = isoDate(addDays(now, daysAhead));
  const codes = [...new Set(sportsClubs.flatMap(club => club.competitionCodes))];
  const groups = await Promise.all(codes.map(code => fetchCompetitionMatches(code, dateFrom, dateTo)));
  const liveMatches = groups.flat();
  const sourceMatches = liveMatches.length ? liveMatches : seedMatches;
  const source: SportsTrip["source"] = liveMatches.length ? "football-data" : "seed";

  const trips = sportsClubs.flatMap(club =>
    sourceMatches
      .filter(match => match.status === "SCHEDULED")
      .map(match => makeTrip(club, match, source))
      .filter((trip): trip is SportsTrip => Boolean(trip))
  );

  const deduped = new Map<string, SportsTrip>();
  for (const trip of trips) {
    deduped.set(`${trip.clubSlug}|${trip.kickoff}|${normalize(trip.opponent)}`, trip);
  }

  return [...deduped.values()]
    .filter(trip => new Date(trip.kickoff).getTime() >= now.getTime())
    .sort((a, b) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime())
    .slice(0, 40);
}

export function formatKickoff(iso: string) {
  return new Intl.DateTimeFormat("pl-PL", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "Europe/Warsaw",
  }).format(new Date(iso));
}
