import DepartureDealsPage from "@/components/DepartureDealsPage";
import { departureHubMetadata } from "@/lib/departureHubMetadata";

export const metadata = departureHubMetadata({
  title: "Wyloty z Poznania (POZ) — loty i wyjazdy z Ławicy | Tripownia.pl",
  description: "Wyloty z Poznania-Ławicy (POZ): wybierz city break, wakacje, Last Minute lub All Inclusive. Porównaj kierunki i przejdź do konkretnej oferty.",
  path: "/z-poznania",
});

export default function Page() {
  return <DepartureDealsPage
    city="Poznania"
    airportCodes={["POZ"]}
    intro="Wyjazdy z Poznania bez przeglądania wielu serwisów. Porównaj wakacje, Last Minute, All Inclusive i lot + hotel z Ławicy, a krótkie city breaki otwórz w dedykowanej sekcji."
    cityBreakHref="/podroze/city-break-z-poznania"
    holidaysHref="/podroze/wakacje-z-poznania"
    lastMinuteHref="/podroze/last-minute-z-poznania"
    allInclusiveHref="/podroze/all-inclusive-z-poznania"
  />;
}
