import { NextResponse } from "next/server";
import { getSportsTrips } from "@/lib/sportsEvents";

export const dynamic = "force-dynamic";

export async function GET() {
  const trips = await getSportsTrips();

  return NextResponse.json(
    {
      generatedAt: new Date().toISOString(),
      source: process.env.FOOTBALL_DATA_API_KEY ? "football-data.org" : "fallback",
      count: trips.length,
      trips,
    },
    { headers: { "Cache-Control": "s-maxage=21600, stale-while-revalidate=86400" } }
  );
}
