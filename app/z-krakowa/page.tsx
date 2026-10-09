import DepartureDealsPage from "@/components/DepartureDealsPage";
import { departureHubMetadata } from "@/lib/departureHubMetadata";

export const metadata = departureHubMetadata({
  title: "Last Minute z Krakowa – wakacje, lot + hotel z KRK | Tripownia.pl",
  description: "Last Minute z Krakowa-Balic (KRK): porównaj wakacje, All Inclusive, lot + hotel i krótkie city breaki. Sprawdź bieżące terminy, kierunki i ceny.",
  path: "/z-krakowa",
});

export default function Page() {
  return <DepartureDealsPage
    city="Krakowa"
    heading="Last Minute z Krakowa – wakacje, lot + hotel i All Inclusive"
    airportCodes={["KRK"]}
    intro="Szukasz Last Minute z Krakowa? Porównaj najbliższe terminy z Balic (KRK), wakacje, pakiety lot + hotel i All Inclusive. Jeśli wolisz krótki wyjazd, sprawdź osobną sekcję city breaków na 2–5 dni."
    cityBreakHref="/podroze/city-break-z-krakowa"
    holidaysHref="/podroze/wakacje-z-krakowa"
    lastMinuteHref="/podroze/last-minute-z-krakowa"
    allInclusiveHref="/podroze/all-inclusive-z-krakowa"
  />;
}
