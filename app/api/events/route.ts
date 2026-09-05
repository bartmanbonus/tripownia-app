import { NextResponse } from "next/server";

type Club = {
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

type Match = {
  id: number;
  utcDate: string;
  status: string;
  venue?: string | null;
  competition?: { name?: string; code?: string };
  homeTeam?: { name?: string; shortName?: string };
  awayTeam?: { name?: string; shortName?: string };
};

type Trip = {
  id: string;
  clubSlug: string;
  club: string;
  opponent: string;
  city: string;
  country: string;
  competition: string;
  kickoff: string;
  venue?: string | null;
  ticketUrl: string;
  flightUrl: string;
  hotelUrl: string;
  packageUrl: string;
};

const clubs: Club[] = [
  { slug:"fc-barcelona", names:["FC Barcelona","Barcelona"], displayName:"FC Barcelona", city:"Barcelona", country:"Hiszpania", airportCode:"BCN", competitionCodes:["PD","CL"], ticketUrl:"https://www.fcbarcelona.com/en/tickets/football", emoji:"🔵🔴" },
  { slug:"inter-mediolan", names:["FC Internazionale Milano","Inter Milan","Inter Milano","Internazionale"], displayName:"Inter Mediolan", city:"Mediolan", country:"Włochy", airportCode:"MIL", competitionCodes:["SA","CL"], ticketUrl:"https://www.inter.it/en/tickets", emoji:"⚫🔵" },
  { slug:"real-madryt", names:["Real Madrid CF","Real Madrid"], displayName:"Real Madryt", city:"Madryt", country:"Hiszpania", airportCode:"MAD", competitionCodes:["PD","CL"], ticketUrl:"https://www.realmadrid.com/en-US/tickets", emoji:"⚪" },
  { slug:"ac-milan", names:["AC Milan","Milan"], displayName:"AC Milan", city:"Mediolan", country:"Włochy", airportCode:"MIL", competitionCodes:["SA","CL"], ticketUrl:"https://www.acmilan.com/en/tickets", emoji:"🔴⚫" },
  { slug:"bayern-monachium", names:["FC Bayern München","Bayern Munich","Bayern München"], displayName:"Bayern Monachium", city:"Monachium", country:"Niemcy", airportCode:"MUC", competitionCodes:["BL1","CL"], ticketUrl:"https://fcbayern.com/en/tickets", emoji:"🔴⚪" },
  { slug:"arsenal", names:["Arsenal FC","Arsenal"], displayName:"Arsenal", city:"Londyn", country:"Wielka Brytania", airportCode:"LON", competitionCodes:["PL","CL"], ticketUrl:"https://www.arsenal.com/tickets", emoji:"🔴" },
  { slug:"liverpool", names:["Liverpool FC","Liverpool"], displayName:"Liverpool", city:"Liverpool", country:"Wielka Brytania", airportCode:"LPL", competitionCodes:["PL","CL"], ticketUrl:"https://www.liverpoolfc.com/tickets", emoji:"🔴" },
];

function normalize(value?: string | null) {
  return (value || "").trim().toLocaleLowerCase("pl");
}

function clubMatches(club: Club, team?: string | null) {
  const name = normalize(team);
  return club.names.some(alias => name === normalize(alias) || name.includes(normalize(alias)));
}

function ymd(date: Date) {
  return date.toISOString().slice(0, 10);
}

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

function kiwiFlights(city: string) {
  const url = new URL("https://www.kiwi.com/deep");
  url.searchParams.set("from", "WAW");
  url.searchParams.set("to", city);
  url.searchParams.set("currency", "PLN");
  return partners.kiwi.buildUrl(url.toString());
}


function booking(city: string) {
  const url = new URL("https://www.booking.com/searchresults.pl.html");
  url.searchParams.set("ss", city);
  url.searchParams.set("aid", "818288");
  return url.toString();
}

async function getTrips(): Promise<Trip[]> {
  const token = process.env.FOOTBALL_DATA_API_KEY;
  if (!token) return [];

  const now = new Date();
  const dateFrom = ymd(now);
  const dateTo = ymd(addDays(now, 120));
  const codes = [...new Set(clubs.flatMap(c => c.competitionCodes))];

  const groups = await Promise.all(codes.map(async code => {
    try {
      const url = new URL(`https://api.football-data.org/v4/competitions/${code}/matches`);
      url.searchParams.set("dateFrom", dateFrom);
      url.searchParams.set("dateTo", dateTo);
      url.searchParams.set("status", "SCHEDULED");

      const response = await fetch(url, {
        headers: { "X-Auth-Token": token },
        next: { revalidate: 21600 },
      });

      if (!response.ok) return [] as Match[];
      const data = await response.json();
      return Array.isArray(data.matches) ? data.matches as Match[] : [];
    } catch {
      return [] as Match[];
    }
  }));

  const matches = groups.flat();
  const trips: Trip[] = [];

  for (const club of clubs) {
    for (const match of matches) {
      const home = match.homeTeam?.name || match.homeTeam?.shortName || "";
      const away = match.awayTeam?.name || match.awayTeam?.shortName || "";
      if (!clubMatches(club, home)) continue;

      trips.push({
        id: String(match.id),
        clubSlug: club.slug,
        club: club.displayName,
        opponent: away,
        city: club.city,
        country: club.country,
        competition: match.competition?.name || match.competition?.code || "Mecz",
        kickoff: match.utcDate,
        venue: match.venue,
        ticketUrl: club.ticketUrl,
        flightUrl: kiwiFlights(club.airportCode),
        hotelUrl: booking(club.city),
        packageUrl: booking(club.city),
      });
    }
  }

  const unique = new Map<string, Trip>();
  for (const trip of trips) {
    unique.set(`${trip.clubSlug}|${trip.kickoff}|${normalize(trip.opponent)}`, trip);
  }

  return [...unique.values()]
    .sort((a,b) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime())
    .slice(0, 40);
}

function formatKickoff(iso: string) {
  return new Intl.DateTimeFormat("pl-PL", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "Europe/Warsaw",
  }).format(new Date(iso));
}


export const dynamic = "force-dynamic";

export async function GET() {
  const trips = await getTrips();
  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    configured: Boolean(process.env.FOOTBALL_DATA_API_KEY),
    count: trips.length,
    trips,
  }, {
    headers: { "Cache-Control": "s-maxage=21600, stale-while-revalidate=86400" },
  });
}
