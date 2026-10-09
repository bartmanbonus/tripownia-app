import { redirect } from "next/navigation";

/**
 * Short Tripownia entry point for the exact eSky flight + hotel proposal.
 * Social -> Tripownia /okazja -> tracked /go/live -> eSky.
 * Do not invent or freeze a price, hotel or board option from URL parameters.
 */
export default function ItalyBergamoOffer() {
  const partner = new URL("https://www2.esky.pl/lot+hotel/portfolio/details/select-room");
  const offerParams: Record<string, string> = {
    "rooms[0][adults]": "2",
    datesTab: "flexDates",
    departureDate: "2026-11-10",
    returnDate: "2026-11-15",
    stayLength: "5:5",
    arrivalPlaces: "co-AM,co-HR,co-CY,co-ES,co-MT,co-RO,co-CH,co-IT",
    context: "pl-packages",
    checkInDate: "2026-11-10",
    checkOutDate: "2026-11-15",
    departureCode: "KRK",
    destinationDepartureDate: "2026-11-10",
    metaCode: "182820",
    returnArrivalDate: "2026-11-15",
    "sort[TotalPrice]": "asc",
    partner_id: "TRIPOWNIAPLPACKAGES",
    portfolioToken: "05ebbcc8-ad3e-4d9b-89bb-9e6b6d57b26e",
    packageId: "MjYxMTEwOjU6cGw6MTgyODIw",
    flightOptionId: "S1JLQkdZMjYxMTEwNzh8fEZSMzUwNTowOjAsQkdZS1JLMjYxMTE1NzhJfHxGUjM1MDQ6MDox",
    arrivalCode: "BGY",
    pricePresentation: "perpax",
  };
  Object.entries(offerParams).forEach(([key, value]) => partner.searchParams.set(key, value));

  const landing = new URLSearchParams({
    offer: "182820",
    city: "Bergamo / Mediolan",
    country: "Włochy",
    departure: "Kraków",
    nights: "5",
    dates: "10–15 listopada 2026",
    board: "Do potwierdzenia w ofercie",
    target: partner.toString(),
    note: "Pakiet lot + hotel. Sprawdź aktualną cenę, wybrany hotel, wyżywienie i dostępność przed rezerwacją.",
    source: "social_esky",
    airport: "KRK",
    start: "2026-11-10",
    end: "2026-11-15",
  });
  redirect(`/okazja?${landing.toString()}`);
}
