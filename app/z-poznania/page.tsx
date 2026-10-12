import DepartureDealsPage from "@/components/DepartureDealsPage";
import { departureHubMetadata } from "@/lib/departureHubMetadata";

export const metadata = departureHubMetadata({
  title: "Wyloty z Poznania — city break, wakacje i Last Minute | Tripownia.pl",
  description: "City break z Poznania na 2–5 dni, wakacje i Last Minute z lotniska POZ. Porównaj lot + hotel, All Inclusive, terminy oraz pełny koszt wyjazdu.",
  path: "/z-poznania",
});

export default function Page() {
  return <DepartureDealsPage
    city="Poznania"
    airportCodes={["POZ"]}
    intro="Szukasz city breaku z Poznania na weekend? Porównaj lot + hotel na 2–5 dni z Ławicy (POZ). Planujesz dłuższy urlop? Sprawdź osobno wakacje, Last Minute i All Inclusive z Poznania."
    cityBreakHref="/podroze/city-break-z-poznania"
    holidaysHref="/podroze/wakacje-z-poznania"
    lastMinuteHref="/podroze/last-minute-z-poznania"
    allInclusiveHref="/podroze/all-inclusive-z-poznania"
  />;
}
