import { partners } from "@/lib/partners";

export type SportsDeparture = {
  code: string;
  label: string;
};

export type SportsClub = {
  slug: string;
  names: string[];
  displayName: string;
  city: string;
  country: string;
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
  competitionCode: string;
  kickoff: string;
  venue?: string | null;
  source: "football-data" | "seed";
  homeTeam: string;
  awayTeam: string;
  homeCrest?: string | null;
  awayCrest?: string | null;
  isHome: boolean;
  ticketUrl: string;
  flightUrl: string;
  hotelUrl: string;
};

export const sportsCompetitions = [
  { code: "PL", name: "Premier League" },
  { code: "PD", name: "La Liga" },
  { code: "SA", name: "Serie A" },
  { code: "BL1", name: "Bundesliga" },
  { code: "CL", name: "Liga Mistrzów" },
] as const;

export const sportsDepartures: SportsDeparture[] = [
  { code: "WAWA", label: "Warszawa — Chopin + Modlin" },
  { code: "KRK", label: "Kraków" },
  { code: "GDN", label: "Gdańsk" },
  { code: "KTW", label: "Katowice" },
  { code: "WRO", label: "Wrocław" },
  { code: "POZ", label: "Poznań" },
  { code: "RZE", label: "Rzeszów" },
  { code: "LUZ", label: "Lublin" },
  { code: "SZZ", label: "Szczecin" },
];

export const sportsClubs: SportsClub[] = [
  {
    slug: "fc-barcelona",
    names: ["FC Barcelona", "Barcelona"],
    displayName: "FC Barcelona",
    city: "Barcelona",
    country: "Hiszpania",
    competitionCodes: ["PD", "CL"],
    ticketUrl: "https://www.fcbarcelona.com/en/tickets/football",
    emoji: "🔵🔴",
  },
  {
    slug: "inter-mediolan",
    names: ["FC Internazionale Milano", "Inter Milan", "Inter Milano", "Internazionale", "Inter"],
    displayName: "Inter Mediolan",
    city: "Mediolan",
    country: "Włochy",
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
    competitionCodes: ["PL", "CL"],
    ticketUrl: "https://www.arsenal.com/tickets",
    emoji: "🔴",
  },
  {
    slug: "chelsea",
    names: ["Chelsea FC", "Chelsea"],
    displayName: "Chelsea",
    city: "Londyn",
    country: "Wielka Brytania",
    competitionCodes: ["PL", "CL"],
    ticketUrl: "https://www.chelseafc.com/en/tickets",
    emoji: "🔵",
  },
  {
    slug: "tottenham",
    names: ["Tottenham Hotspur FC", "Tottenham Hotspur", "Tottenham", "Spurs"],
    displayName: "Tottenham",
    city: "Londyn",
    country: "Wielka Brytania",
    competitionCodes: ["PL", "CL"],
    ticketUrl: "https://www.tottenhamhotspur.com/tickets/",
    emoji: "⚪🔵",
  },
  {
    slug: "manchester-city",
    names: ["Manchester City FC", "Manchester City", "Man City"],
    displayName: "Manchester City",
    city: "Manchester",
    country: "Wielka Brytania",
    competitionCodes: ["PL", "CL"],
    ticketUrl: "https://www.mancity.com/tickets",
    emoji: "🔵⚪",
  },
  {
    slug: "manchester-united",
    names: ["Manchester United FC", "Manchester United", "Man United", "Man Utd"],
    displayName: "Manchester United",
    city: "Manchester",
    country: "Wielka Brytania",
    competitionCodes: ["PL"],
    ticketUrl: "https://www.manutd.com/en/tickets-and-hospitality",
    emoji: "🔴⚫",
  },
  {
    slug: "liverpool",
    names: ["Liverpool FC", "Liverpool"],
    displayName: "Liverpool",
    city: "Liverpool",
    country: "Wielka Brytania",
    competitionCodes: ["PL", "CL"],
    ticketUrl: "https://www.liverpoolfc.com/tickets",
    emoji: "🔴",
  },
];

const teamTravelData: Array<{ names: string[]; city: string; country: string; crest?: string }> = [
  { names:["AS Roma","Roma"], city:"Rzym", country:"Włochy", crest:"https://crests.football-data.org/100.png" },
  { names:["Bologna FC 1909","Bologna"], city:"Bolonia", country:"Włochy" },
  { names:["Venezia FC","Venezia"], city:"Wenecja", country:"Włochy" },
  { names:["AC Milan","Milan"], city:"Mediolan", country:"Włochy", crest:"https://crests.football-data.org/98.png" },
  { names:["Atalanta BC","Atalanta"], city:"Bergamo", country:"Włochy" },
  { names:["Frosinone Calcio","Frosinone"], city:"Rzym", country:"Włochy" },
  { names:["US Lecce","Lecce"], city:"Bari", country:"Włochy" },
  { names:["Real Madrid CF","Real Madrid"], city:"Madryt", country:"Hiszpania", crest:"https://crests.football-data.org/86.png" },
  { names:["Feyenoord Rotterdam","Feyenoord"], city:"Rotterdam", country:"Holandia" },
  { names:["Borussia Dortmund","Dortmund"], city:"Dortmund", country:"Niemcy", crest:"https://crests.football-data.org/4.png" },
  { names:["SSC Napoli","Napoli"], city:"Neapol", country:"Włochy", crest:"https://crests.football-data.org/113.png" },
  { names:["Udinese Calcio","Udinese"], city:"Udine", country:"Włochy", crest:"https://crests.football-data.org/115.png" },
  { names:["Parma Calcio 1913","Parma Calcio","Parma"], city:"Parma", country:"Włochy" },
  { names:["Club Brugge KV","Club Brugge"], city:"Brugia", country:"Belgia" },
  { names:["FC Shakhtar Donetsk","Shakhtar Donetsk"], city:"Warszawa", country:"Polska" },
  { names:["VfB Stuttgart","Stuttgart"], city:"Stuttgart", country:"Niemcy" },
];

function teamInfo(name: string) {
  const n = normalize(name);
  return teamTravelData.find(item => item.names.some(alias => n === normalize(alias) || n.includes(normalize(alias))));
}

function destinationForMatch(homeTeam: string, club: SportsClub, isHome: boolean) {
  if (isHome) return { city: club.city, country: club.country };
  const info = teamInfo(homeTeam);
  return info || { city: club.city, country: club.country };
}

function cityToKiwiSlug(city: string) {
  const key = normalize(city);
  const known: Record<string,string> = {
    "mediolan":"mediolan-wlochy","barcelona":"barcelona-hiszpania","madryt":"madryt-hiszpania","monachium":"monachium-niemcy",
    "londyn":"londyn-wielka-brytania","manchester":"manchester-wielka-brytania","liverpool":"liverpool-wielka-brytania",
    "rzym":"rzym-wlochy","bolonia":"bolonia-wlochy","wenecja":"wenecja-wlochy","bergamo":"bergamo-wlochy",
    "neapol":"neapol-wlochy","brugia":"brugia-belgia","rotterdam":"rotterdam-holandia","dortmund":"dortmund-niemcy",
    "stuttgart":"stuttgart-niemcy","parma":"parma-wlochy","bari":"bari-wlochy","warszawa":"warszawa-polska"
  };
  return known[key] || city.toLocaleLowerCase("pl").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
}

type FootballDataMatch = {
  id: number;
  utcDate: string;
  status: string;
  venue?: string | null;
  competition?: { name?: string; code?: string };
  homeTeam?: { id?: number; name?: string; shortName?: string; crest?: string | null };
  awayTeam?: { id?: number; name?: string; shortName?: string; crest?: string | null };
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

function isUpcomingMatch(match: FootballDataMatch) {
  return match.status === "SCHEDULED" || match.status === "TIMED";
}

export function getSportsTravelWindow(kickoff: string, nights = 3) {
  const safeNights = [2, 3, 4].includes(nights) ? nights : 3;
  const match = new Date(kickoff);
  const departure = new Date(Date.UTC(match.getUTCFullYear(), match.getUTCMonth(), match.getUTCDate()));
  departure.setUTCDate(departure.getUTCDate() - 1);
  const returning = addDays(departure, safeNights);

  return {
    nights: safeNights,
    departureDate: isoDate(departure),
    returnDate: isoDate(returning),
    checkin: isoDate(departure),
    checkout: isoDate(returning),
  };
}

export function buildSportsTripLinks(
  trip: Pick<SportsTrip, "clubSlug" | "kickoff" | "city" | "ticketUrl">,
  departureCode = "WAWA",
  nights = 3,
  passengers = 2,
) {
  const departure = sportsDepartures.find(item => item.code === departureCode) || sportsDepartures[0];
  const window = getSportsTravelWindow(trip.kickoff, nights);
  const safePassengers = [1, 2, 3, 4].includes(passengers) ? passengers : 2;

  const originByCode: Record<string, string> = {
    WAWA: "warszawa-polska", KRK: "krakow-polska", GDN: "gdansk-polska",
    KTW: "katowice-polska", WRO: "wroclaw-polska", POZ: "poznan-polska",
    RZE: "rzeszow-polska", LUZ: "lublin-polska", SZZ: "szczecin-polska",
  };
  const flightSearch = new URL("https://www.kiwi.com/pl/");
  flightSearch.searchParams.set("origin", originByCode[departure.code] || "warszawa-polska");
  flightSearch.searchParams.set("destination", cityToKiwiSlug(trip.city));
  flightSearch.searchParams.set("outboundDate", window.departureDate);
  flightSearch.searchParams.set("inboundDate", window.returnDate);
  flightSearch.searchParams.set("adults", String(safePassengers));
  flightSearch.searchParams.set("currency", "PLN");

  const hotelUrl = new URL("https://www.booking.com/searchresults.pl.html");
  hotelUrl.searchParams.set("ss", trip.city);
  hotelUrl.searchParams.set("checkin", window.checkin);
  hotelUrl.searchParams.set("checkout", window.checkout);
  hotelUrl.searchParams.set("group_adults", String(safePassengers));
  hotelUrl.searchParams.set("no_rooms", "1");
  hotelUrl.searchParams.set("group_children", "0");
  hotelUrl.searchParams.set("aid", "818288");

  return {
    ...window,
    departureLabel: departure.label,
    arrivalLabel: trip.city,
    flightUrl: partners.kiwi.buildUrl(flightSearch.toString()),
    hotelUrl: hotelUrl.toString(),
    ticketUrl: trip.ticketUrl,
  };
}

function makeTrip(club: SportsClub, match: FootballDataMatch, source: SportsTrip["source"]): SportsTrip | null {
  const home = match.homeTeam?.name || match.homeTeam?.shortName || "";
  const away = match.awayTeam?.name || match.awayTeam?.shortName || "";
  const isHome = clubMatchesTeam(club, home);
  const isAway = clubMatchesTeam(club, away);
  if (!isHome && !isAway) return null;

  const destination = destinationForMatch(home, club, isHome);
  const homeInfo = teamInfo(home);
  const awayInfo = teamInfo(away);
  const baseTrip: Omit<SportsTrip, "flightUrl" | "hotelUrl"> = {
    id: String(match.id),
    clubSlug: club.slug,
    club: club.displayName,
    opponent: isHome ? away : home,
    city: destination.city,
    country: destination.country,
    competition: match.competition?.name || match.competition?.code || "Mecz",
    competitionCode: match.competition?.code || "",
    kickoff: match.utcDate,
    venue: match.venue,
    source,
    homeTeam: home,
    awayTeam: away,
    homeCrest: match.homeTeam?.crest || homeInfo?.crest || null,
    awayCrest: match.awayTeam?.crest || awayInfo?.crest || null,
    isHome,
    ticketUrl: isHome ? club.ticketUrl : (sportsClubs.find(c => clubMatchesTeam(c, home))?.ticketUrl || club.ticketUrl),
  };

  const links = buildSportsTripLinks(baseTrip, "WAWA", 3, 2);
  return { ...baseTrip, flightUrl: links.flightUrl, hotelUrl: links.hotelUrl };
}

async function fetchCompetitionMatches(code: string, dateFrom: string, dateTo: string) {
  const token = process.env.FOOTBALL_DATA_API_KEY;
  if (!token) return [] as FootballDataMatch[];

  // Nie ograniczamy API tylko do SCHEDULED. Premier League po nadaniu godzin
  // często ma status TIMED i wcześniej przez to znikała z Tripowni.
  const url = new URL(`https://api.football-data.org/v4/competitions/${code}/matches`);
  url.searchParams.set("dateFrom", dateFrom);
  url.searchParams.set("dateTo", dateTo);

  try {
    const response = await fetch(url, {
      headers: { "X-Auth-Token": token },
      next: { revalidate: 21600 },
    });

    if (!response.ok) return [];
    const data = await response.json();
    return Array.isArray(data.matches)
      ? (data.matches as FootballDataMatch[]).filter(isUpcomingMatch)
      : [];
  } catch {
    return [];
  }
}

// Techniczny fallback. Live Football-Data ma zawsze pierwszeństwo dla każdej ligi osobno.
const seedMatches: FootballDataMatch[] = [
  // Inter 2026/27 — potwierdzony terminarz pierwszej drużyny (Serie A + Liga Mistrzów).
  { id: 200001, utcDate: "2026-09-05T16:00:00Z", status: "TIMED", venue: "San Siro", competition: { name: "Serie A", code: "SA" }, homeTeam: { name: "Inter Milan", crest:"https://crests.football-data.org/108.png" }, awayTeam: { name: "SSC Napoli", crest:"https://crests.football-data.org/113.png" } },
  { id: 200002, utcDate: "2026-09-08T19:00:00Z", status: "TIMED", venue: "Santiago Bernabéu", competition: { name: "UEFA Champions League", code: "CL" }, homeTeam: { name: "Real Madrid CF", crest:"https://crests.football-data.org/86.png" }, awayTeam: { name: "Inter Milan", crest:"https://crests.football-data.org/108.png" } },
  { id: 200003, utcDate: "2026-09-14T18:45:00Z", status: "TIMED", venue: "San Siro", competition: { name: "Serie A", code: "SA" }, homeTeam: { name: "Inter Milan", crest:"https://crests.football-data.org/108.png" }, awayTeam: { name: "Udinese Calcio", crest:"https://crests.football-data.org/115.png" } },
  { id: 200004, utcDate: "2026-09-19T16:00:00Z", status: "TIMED", venue: "Stadio Olimpico", competition: { name: "Serie A", code: "SA" }, homeTeam: { name: "AS Roma", crest:"https://crests.football-data.org/100.png" }, awayTeam: { name: "Inter Milan", crest:"https://crests.football-data.org/108.png" } },
  { id: 200005, utcDate: "2026-10-10T16:00:00Z", status: "TIMED", venue: "San Siro", competition: { name: "Serie A", code: "SA" }, homeTeam: { name: "Inter Milan", crest:"https://crests.football-data.org/108.png" }, awayTeam: { name: "Parma Calcio 1913" } },
  { id: 200006, utcDate: "2026-10-13T19:00:00Z", status: "TIMED", venue: "San Siro", competition: { name: "UEFA Champions League", code: "CL" }, homeTeam: { name: "Inter Milan", crest:"https://crests.football-data.org/108.png" }, awayTeam: { name: "Club Brugge KV" } },
  { id: 200007, utcDate: "2026-10-17T16:00:00Z", status: "TIMED", venue: "Stadio Renato Dall'Ara", competition: { name: "Serie A", code: "SA" }, homeTeam: { name: "Bologna FC 1909" }, awayTeam: { name: "Inter Milan", crest:"https://crests.football-data.org/108.png" } },
  { id: 200008, utcDate: "2026-10-21T19:00:00Z", status: "TIMED", venue: "San Siro", competition: { name: "UEFA Champions League", code: "CL" }, homeTeam: { name: "Inter Milan", crest:"https://crests.football-data.org/108.png" }, awayTeam: { name: "FC Shakhtar Donetsk" } },
  { id: 200009, utcDate: "2026-10-25T11:30:00Z", status: "TIMED", venue: "San Siro", competition: { name: "Serie A", code: "SA" }, homeTeam: { name: "Inter Milan", crest:"https://crests.football-data.org/108.png" }, awayTeam: { name: "ACF Fiorentina" } },
  { id: 200010, utcDate: "2026-10-28T17:30:00Z", status: "TIMED", venue: "Stadio Pier Luigi Penzo", competition: { name: "Serie A", code: "SA" }, homeTeam: { name: "Venezia FC" }, awayTeam: { name: "Inter Milan", crest:"https://crests.football-data.org/108.png" } },
  { id: 200011, utcDate: "2026-10-31T19:45:00Z", status: "TIMED", venue: "San Siro", competition: { name: "Serie A", code: "SA" }, homeTeam: { name: "AC Milan", crest:"https://crests.football-data.org/98.png" }, awayTeam: { name: "Inter Milan", crest:"https://crests.football-data.org/108.png" } },
  { id: 200012, utcDate: "2026-11-03T20:00:00Z", status: "TIMED", venue: "De Kuip", competition: { name: "UEFA Champions League", code: "CL" }, homeTeam: { name: "Feyenoord Rotterdam" }, awayTeam: { name: "Inter Milan", crest:"https://crests.football-data.org/108.png" } },
  { id: 200013, utcDate: "2026-11-08T17:00:00Z", status: "TIMED", venue: "San Siro", competition: { name: "Serie A", code: "SA" }, homeTeam: { name: "Inter Milan", crest:"https://crests.football-data.org/108.png" }, awayTeam: { name: "Como 1907" } },
  { id: 200014, utcDate: "2026-11-22T19:45:00Z", status: "TIMED", venue: "Gewiss Stadium", competition: { name: "Serie A", code: "SA" }, homeTeam: { name: "Atalanta BC" }, awayTeam: { name: "Inter Milan", crest:"https://crests.football-data.org/108.png" } },
  { id: 200015, utcDate: "2026-11-25T20:00:00Z", status: "TIMED", venue: "San Siro", competition: { name: "UEFA Champions League", code: "CL" }, homeTeam: { name: "Inter Milan", crest:"https://crests.football-data.org/108.png" }, awayTeam: { name: "VfB Stuttgart" } },
  { id: 200016, utcDate: "2026-11-29T14:00:00Z", status: "SCHEDULED", venue: "San Siro", competition: { name: "Serie A", code: "SA" }, homeTeam: { name: "Inter Milan", crest:"https://crests.football-data.org/108.png" }, awayTeam: { name: "Genoa CFC" } },
  { id: 200017, utcDate: "2026-12-06T14:00:00Z", status: "SCHEDULED", competition: { name: "Serie A", code: "SA" }, homeTeam: { name: "Frosinone Calcio" }, awayTeam: { name: "Inter Milan", crest:"https://crests.football-data.org/108.png" } },
  { id: 200018, utcDate: "2026-12-09T20:00:00Z", status: "TIMED", competition: { name: "UEFA Champions League", code: "CL" }, homeTeam: { name: "Borussia Dortmund", crest:"https://crests.football-data.org/4.png" }, awayTeam: { name: "Inter Milan", crest:"https://crests.football-data.org/108.png" } },
  { id: 200019, utcDate: "2026-12-13T14:00:00Z", status: "SCHEDULED", venue: "San Siro", competition: { name: "Serie A", code: "SA" }, homeTeam: { name: "Inter Milan", crest:"https://crests.football-data.org/108.png" }, awayTeam: { name: "Torino FC" } },
  { id: 200020, utcDate: "2026-12-20T14:00:00Z", status: "SCHEDULED", competition: { name: "Serie A", code: "SA" }, homeTeam: { name: "US Lecce" }, awayTeam: { name: "Inter Milan", crest:"https://crests.football-data.org/108.png" } },

  // Awaryjne wpisy dla pozostałych obserwowanych rozgrywek.
  { id: 101001, utcDate: "2026-09-06T15:30:00Z", status: "TIMED", venue: "Emirates Stadium", competition: { name: "Premier League", code: "PL" }, homeTeam: { name: "Arsenal FC", crest:"https://crests.football-data.org/57.png" }, awayTeam: { name: "Chelsea FC", crest:"https://crests.football-data.org/61.png" } },
  { id: 101003, utcDate: "2026-09-13T15:30:00Z", status: "TIMED", venue: "Old Trafford", competition: { name: "Premier League", code: "PL" }, homeTeam: { name: "Manchester United FC", crest:"https://crests.football-data.org/66.png" }, awayTeam: { name: "Manchester City FC", crest:"https://crests.football-data.org/65.png" } },
  { id: 101009, utcDate: "2026-10-11T15:30:00Z", status: "TIMED", venue: "Anfield", competition: { name: "Premier League", code: "PL" }, homeTeam: { name: "Liverpool FC", crest:"https://crests.football-data.org/64.png" }, awayTeam: { name: "Manchester City FC", crest:"https://crests.football-data.org/65.png" } },
];

export async function getSportsTrips(daysAhead = 365): Promise<SportsTrip[]> {
  const now = new Date();
  const dateFrom = isoDate(now);
  const dateTo = isoDate(addDays(now, daysAhead));

  const codes = [...new Set(sportsClubs.flatMap(club => club.competitionCodes))];
  const groups = await Promise.all(
    codes.map(async code => {
      const live = await fetchCompetitionMatches(code, dateFrom, dateTo);
      const seeded = seedMatches.filter(match => match.competition?.code === code && isUpcomingMatch(match));
      const merged = new Map<string, { match: FootballDataMatch; source: "football-data" | "seed" }>();
      const key = (match: FootballDataMatch) => `${match.competition?.code || ""}|${match.utcDate.slice(0,10)}|${normalize(match.homeTeam?.name || match.homeTeam?.shortName)}|${normalize(match.awayTeam?.name || match.awayTeam?.shortName)}`;
      seeded.forEach(match => merged.set(key(match), { match, source: "seed" }));
      live.forEach(match => merged.set(key(match), { match, source: "football-data" }));
      return [...merged.values()];
    })
  );

  const sourcedMatches = groups.flat();
  const trips = sportsClubs.flatMap(club =>
    sourcedMatches
      .map(({ match, source }) => makeTrip(club, match, source))
      .filter((trip): trip is SportsTrip => Boolean(trip))
  );

  const deduped = new Map<string, SportsTrip>();
  for (const trip of trips) {
    deduped.set(`${trip.clubSlug}|${trip.kickoff}|${normalize(trip.opponent)}`, trip);
  }

  return [...deduped.values()]
    .filter(trip => new Date(trip.kickoff).getTime() >= now.getTime())
    .sort((a, b) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime())
    .slice(0, 240);
}

export function formatKickoff(iso: string) {
  return new Intl.DateTimeFormat("pl-PL", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "Europe/Warsaw",
  }).format(new Date(iso));
}
