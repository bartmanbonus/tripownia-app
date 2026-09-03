import { partners } from "@/lib/partners";

export type SportsDeparture = {
  code: string;
  label: string;
  flightPath: string;
  packageValue: string;
};

export type SportsClub = {
  slug: string;
  names: string[];
  displayName: string;
  city: string;
  country: string;
  airportCode: string;
  flightAirportLabel: string;
  flightDestinationPath: string;
  packageArrivalCode: string;
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
  ticketUrl: string;
  flightUrl: string;
  hotelUrl: string;
  packageUrl: string;
};

export const sportsCompetitions = [
  { code: "PL", name: "Premier League" },
  { code: "PD", name: "La Liga" },
  { code: "SA", name: "Serie A" },
  { code: "BL1", name: "Bundesliga" },
  { code: "CL", name: "Liga Mistrzów" },
] as const;

export const sportsDepartures: SportsDeparture[] = [
  { code: "WAWA", label: "Warszawa — Chopin + Modlin", flightPath: "mp/WAWA", packageValue: "ap-WAW,ap-WMI" },
  { code: "KRK", label: "Kraków", flightPath: "ap/KRK", packageValue: "ap-KRK" },
  { code: "GDN", label: "Gdańsk", flightPath: "ap/GDN", packageValue: "ap-GDN" },
  { code: "KTW", label: "Katowice", flightPath: "ap/KTW", packageValue: "ap-KTW" },
  { code: "WRO", label: "Wrocław", flightPath: "ap/WRO", packageValue: "ap-WRO" },
  { code: "POZ", label: "Poznań", flightPath: "ap/POZ", packageValue: "ap-POZ" },
  { code: "RZE", label: "Rzeszów", flightPath: "ap/RZE", packageValue: "ap-RZE" },
  { code: "LUZ", label: "Lublin", flightPath: "ap/LUZ", packageValue: "ap-LUZ" },
  { code: "SZZ", label: "Szczecin", flightPath: "ap/SZZ", packageValue: "ap-SZZ" },
];

export const sportsClubs: SportsClub[] = [
  {
    slug: "fc-barcelona",
    names: ["FC Barcelona", "Barcelona"],
    displayName: "FC Barcelona",
    city: "Barcelona",
    country: "Hiszpania",
    airportCode: "BCN",
    flightAirportLabel: "Barcelona (BCN)",
    flightDestinationPath: "ap/BCN",
    packageArrivalCode: "ci-BCN",
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
    airportCode: "MIL",
    flightAirportLabel: "Mediolan — wszystkie lotniska (MIL)",
    flightDestinationPath: "ci/MIL",
    packageArrivalCode: "ci-MIL",
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
    flightAirportLabel: "Madryt (MAD)",
    flightDestinationPath: "ap/MAD",
    packageArrivalCode: "ci-MAD",
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
    flightAirportLabel: "Mediolan — wszystkie lotniska (MIL)",
    flightDestinationPath: "ci/MIL",
    packageArrivalCode: "ci-MIL",
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
    flightAirportLabel: "Monachium (MUC)",
    flightDestinationPath: "ap/MUC",
    packageArrivalCode: "ci-MUC",
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
    flightAirportLabel: "Londyn — wszystkie lotniska (LON)",
    flightDestinationPath: "ci/LON",
    packageArrivalCode: "ci-LON",
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
    airportCode: "LON",
    flightAirportLabel: "Londyn — wszystkie lotniska (LON)",
    flightDestinationPath: "ci/LON",
    packageArrivalCode: "ci-LON",
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
    airportCode: "LON",
    flightAirportLabel: "Londyn — wszystkie lotniska (LON)",
    flightDestinationPath: "ci/LON",
    packageArrivalCode: "ci-LON",
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
    airportCode: "MAN",
    flightAirportLabel: "Manchester (MAN)",
    flightDestinationPath: "ap/MAN",
    packageArrivalCode: "ci-MAN",
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
    airportCode: "MAN",
    flightAirportLabel: "Manchester (MAN)",
    flightDestinationPath: "ap/MAN",
    packageArrivalCode: "ci-MAN",
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
    airportCode: "LPL",
    flightAirportLabel: "Liverpool (LPL)",
    flightDestinationPath: "ap/LPL",
    packageArrivalCode: "ci-LPL",
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
  const club = sportsClubs.find(item => item.slug === trip.clubSlug);
  const departure = sportsDepartures.find(item => item.code === departureCode) || sportsDepartures[0];
  const window = getSportsTravelWindow(trip.kickoff, nights);
  const safePassengers = [1, 2, 3, 4].includes(passengers) ? passengers : 2;

  if (!club) {
    return {
      ...window,
      departureLabel: departure.label,
      arrivalLabel: trip.city,
      flightUrl: "#",
      secondaryFlightUrl: "#",
      hotelUrl: "#",
      packageUrl: "#",
      carUrl: "https://getrentacar.tpk.lv/buzTQvPf",
      taxiUrl: "https://kiwitaxi.tpk.lv/UuvtPHby",
      transferUrl: "https://gettransfer.tpk.lv/SqNqK9Q7",
      ticketUrl: trip.ticketUrl,
    };
  }

  // Sam lot: Kiwi jest głównym źródłem. Budujemy zwykły URL wyszukiwarki Kiwi,
  // a dopiero potem owijamy go linkiem afiliacyjnym Travelpayouts.
  // Kierunek przekazujemy jako MIASTO (np. Londyn/Mediolan), nie pojedyncze lotnisko,
  // żeby Kiwi mogło znaleźć najtańsze połączenia ze wszystkich lotnisk w aglomeracji.
  const departureCityByCode: Record<string, string> = {
    WAWA: "Warszawa",
    KRK: "Kraków",
    GDN: "Gdańsk",
    KTW: "Katowice",
    WRO: "Wrocław",
    POZ: "Poznań",
    RZE: "Rzeszów",
    LUZ: "Lublin",
    SZZ: "Szczecin",
  };
  const kiwiSearch = new URL("https://www.kiwi.com/pl/");
  kiwiSearch.searchParams.set("origin", departureCityByCode[departure.code] || departure.label);
  kiwiSearch.searchParams.set("destination", club.city);
  kiwiSearch.searchParams.set("outboundDate", window.departureDate);
  kiwiSearch.searchParams.set("inboundDate", window.returnDate);
  kiwiSearch.searchParams.set("adults", String(safePassengers));
  kiwiSearch.searchParams.set("currency", "PLN");
  const kiwiFlightUrl = partners.kiwi.buildUrl(kiwiSearch.toString());

  // eSky zostaje jako drugie źródło samych lotów.
  const eskyFlightUrl = new URL(`https://www2.esky.pl/flights/search/${departure.flightPath}/${club.flightDestinationPath}`);
  eskyFlightUrl.searchParams.set("departureDate", window.departureDate);
  eskyFlightUrl.searchParams.set("returnDate", window.returnDate);
  eskyFlightUrl.searchParams.set("pa", String(safePassengers));
  eskyFlightUrl.searchParams.set("py", "0");
  eskyFlightUrl.searchParams.set("pc", "0");
  eskyFlightUrl.searchParams.set("pi", "0");
  eskyFlightUrl.searchParams.set("sc", "economy");
  eskyFlightUrl.searchParams.set("partner_id", "TRIPOWNIAPL");
  eskyFlightUrl.searchParams.set("flexDatesOffset", "0");

  const hotelUrl = new URL("https://www.booking.com/searchresults.pl.html");
  hotelUrl.searchParams.set("ss", club.city);
  hotelUrl.searchParams.set("checkin", window.checkin);
  hotelUrl.searchParams.set("checkout", window.checkout);
  hotelUrl.searchParams.set("group_adults", String(safePassengers));
  hotelUrl.searchParams.set("no_rooms", "1");
  hotelUrl.searchParams.set("group_children", "0");
  hotelUrl.searchParams.set("aid", "818288");

  const packageUrl = new URL("https://www2.esky.pl/lot+hotel/portfolio");
  packageUrl.searchParams.set("rooms[0][adults]", String(safePassengers));
  packageUrl.searchParams.set("datesTab", "flexDates");
  packageUrl.searchParams.set("departureDate", window.departureDate);
  packageUrl.searchParams.set("returnDate", window.returnDate);
  packageUrl.searchParams.set("stayLength", `${window.nights}:${window.nights}`);
  packageUrl.searchParams.set("departurePlaces", departure.packageValue);
  packageUrl.searchParams.set("arrivalPlaces", club.packageArrivalCode);
  packageUrl.searchParams.set("context", "pl-packages");
  packageUrl.searchParams.set("eventSourceComponent", "plp-qsf");
  packageUrl.searchParams.set("sort[TotalPrice]", "asc");
  packageUrl.searchParams.set("partner_id", "TRIPOWNIAPLPACKAGES");

  return {
    ...window,
    departureLabel: departure.label,
    arrivalLabel: club.flightAirportLabel,
    flightUrl: kiwiFlightUrl,
    secondaryFlightUrl: eskyFlightUrl.toString(),
    hotelUrl: hotelUrl.toString(),
    packageUrl: packageUrl.toString(),
    carUrl: "https://getrentacar.tpk.lv/buzTQvPf",
    taxiUrl: "https://kiwitaxi.tpk.lv/UuvtPHby",
    transferUrl: "https://gettransfer.tpk.lv/SqNqK9Q7",
    ticketUrl: trip.ticketUrl,
  };
}

function makeTrip(club: SportsClub, match: FootballDataMatch, source: SportsTrip["source"]): SportsTrip | null {
  const home = match.homeTeam?.name || match.homeTeam?.shortName || "";
  const away = match.awayTeam?.name || match.awayTeam?.shortName || "";
  if (!clubMatchesTeam(club, home)) return null;

  const baseTrip = {
    id: String(match.id),
    clubSlug: club.slug,
    club: club.displayName,
    opponent: away,
    city: club.city,
    country: club.country,
    competition: match.competition?.name || match.competition?.code || "Mecz",
    competitionCode: match.competition?.code || "",
    kickoff: match.utcDate,
    venue: match.venue,
    source,
    ticketUrl: club.ticketUrl,
  };

  const links = buildSportsTripLinks(baseTrip, "WAWA", 3, 2);

  return {
    ...baseTrip,
    flightUrl: links.flightUrl,
    hotelUrl: links.hotelUrl,
    packageUrl: links.packageUrl,
  };
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
  { id: 100001, utcDate: "2026-09-09T16:45:00Z", status: "SCHEDULED", venue: "Spotify Camp Nou", competition: { name: "UEFA Champions League", code: "CL" }, homeTeam: { name: "FC Barcelona" }, awayTeam: { name: "Feyenoord Rotterdam" } },
  { id: 100002, utcDate: "2026-09-16T19:30:00Z", status: "SCHEDULED", venue: "Spotify Camp Nou", competition: { name: "La Liga", code: "PD" }, homeTeam: { name: "FC Barcelona" }, awayTeam: { name: "Racing Santander" } },
  { id: 100003, utcDate: "2026-10-25T20:00:00Z", status: "SCHEDULED", venue: "Spotify Camp Nou", competition: { name: "La Liga", code: "PD" }, homeTeam: { name: "FC Barcelona" }, awayTeam: { name: "Real Madrid" } },
  { id: 100004, utcDate: "2026-09-05T16:00:00Z", status: "SCHEDULED", venue: "San Siro", competition: { name: "Serie A", code: "SA" }, homeTeam: { name: "Inter Milan" }, awayTeam: { name: "SSC Napoli" } },
  { id: 100005, utcDate: "2026-10-10T13:00:00Z", status: "SCHEDULED", venue: "San Siro", competition: { name: "Serie A", code: "SA" }, homeTeam: { name: "Inter Milan" }, awayTeam: { name: "Parma Calcio" } },
  { id: 100006, utcDate: "2026-10-13T19:00:00Z", status: "SCHEDULED", venue: "San Siro", competition: { name: "UEFA Champions League", code: "CL" }, homeTeam: { name: "Inter Milan" }, awayTeam: { name: "Club Brugge" } },

  // Premier League 2026/27 — fallback wyłącznie na wypadek chwilowego braku odpowiedzi API.
  { id: 101001, utcDate: "2026-09-06T15:30:00Z", status: "TIMED", venue: "Emirates Stadium", competition: { name: "Premier League", code: "PL" }, homeTeam: { name: "Arsenal FC" }, awayTeam: { name: "Chelsea FC" } },
  { id: 101002, utcDate: "2026-09-12T14:00:00Z", status: "TIMED", venue: "Anfield", competition: { name: "Premier League", code: "PL" }, homeTeam: { name: "Liverpool FC" }, awayTeam: { name: "Fulham FC" } },
  { id: 101003, utcDate: "2026-09-13T15:30:00Z", status: "TIMED", venue: "Old Trafford", competition: { name: "Premier League", code: "PL" }, homeTeam: { name: "Manchester United FC" }, awayTeam: { name: "Manchester City FC" } },
  { id: 101004, utcDate: "2026-09-19T11:30:00Z", status: "TIMED", venue: "Tottenham Hotspur Stadium", competition: { name: "Premier League", code: "PL" }, homeTeam: { name: "Tottenham Hotspur FC" }, awayTeam: { name: "Aston Villa FC" } },
  { id: 101005, utcDate: "2026-09-20T13:00:00Z", status: "TIMED", venue: "Etihad Stadium", competition: { name: "Premier League", code: "PL" }, homeTeam: { name: "Manchester City FC" }, awayTeam: { name: "Sunderland AFC" } },
  { id: 101006, utcDate: "2026-10-10T11:30:00Z", status: "TIMED", venue: "Emirates Stadium", competition: { name: "Premier League", code: "PL" }, homeTeam: { name: "Arsenal FC" }, awayTeam: { name: "Leeds United FC" } },
  { id: 101007, utcDate: "2026-10-10T14:00:00Z", status: "TIMED", venue: "Stamford Bridge", competition: { name: "Premier League", code: "PL" }, homeTeam: { name: "Chelsea FC" }, awayTeam: { name: "AFC Bournemouth" } },
  { id: 101008, utcDate: "2026-10-10T16:30:00Z", status: "TIMED", venue: "Old Trafford", competition: { name: "Premier League", code: "PL" }, homeTeam: { name: "Manchester United FC" }, awayTeam: { name: "Tottenham Hotspur FC" } },
  { id: 101009, utcDate: "2026-10-11T15:30:00Z", status: "TIMED", venue: "Anfield", competition: { name: "Premier League", code: "PL" }, homeTeam: { name: "Liverpool FC" }, awayTeam: { name: "Manchester City FC" } },
];

export async function getSportsTrips(daysAhead = 120): Promise<SportsTrip[]> {
  const now = new Date();
  const dateFrom = isoDate(now);
  const dateTo = isoDate(addDays(now, daysAhead));

  const codes = [...new Set(sportsClubs.flatMap(club => club.competitionCodes))];
  const groups = await Promise.all(
    codes.map(async code => {
      const live = await fetchCompetitionMatches(code, dateFrom, dateTo);
      if (live.length) return live.map(match => ({ match, source: "football-data" as const }));

      return seedMatches
        .filter(match => match.competition?.code === code && isUpcomingMatch(match))
        .map(match => ({ match, source: "seed" as const }));
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
    .slice(0, 80);
}

export function formatKickoff(iso: string) {
  return new Intl.DateTimeFormat("pl-PL", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "Europe/Warsaw",
  }).format(new Date(iso));
}
