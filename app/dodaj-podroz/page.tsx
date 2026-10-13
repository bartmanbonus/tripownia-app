import type { Metadata } from "next";
import AddTripPage from "@/components/AddTripPage";

export const metadata: Metadata = {
  title: "Darmowy personalizowany plan podróży",
  description: "Podaj kierunek i termin. Tripownia za darmo utworzy personalizowany plan podróży z checklistą, dokumentami, pogodą, transportem, atrakcjami i przygotowaniem wyjazdu.",
  robots: { index: false, follow: false, nocache: true },
};

type QueryValue = string | string[] | undefined;

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, QueryValue>> }) {
  const query = await searchParams;
  const get = (key: string) => typeof query[key] === "string" ? query[key] as string : "";
  const initialSport = get("source") === "sport"
    ? {
        city: get("city"),
        country: get("country"),
        start: get("start"),
        end: get("end"),
        departure: get("departure"),
        match: get("match"),
        venue: get("venue"),
        ticket: get("ticket"),
        flightUrl: get("flightUrl"),
        hotelUrl: get("hotelUrl"),
        people: get("people"),
        nights: get("nights"),
        kickoff: get("kickoff"),
      }
    : undefined;

  return <AddTripPage initialSport={initialSport} />;
}
