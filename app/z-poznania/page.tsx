import DepartureDealsPage from "@/components/DepartureDealsPage";
import { departureHubMetadata } from "@/lib/departureHubMetadata";

export const metadata = departureHubMetadata({
  title: "Wakacje z Poznania — Last Minute, All Inclusive i lot + hotel | Tripownia.pl",
  description: "Wakacje i wyjazdy z Poznania-Ławicy (POZ): Last Minute, All Inclusive i lot + hotel. Porównaj aktualne kierunki, ceny i terminy z lokalnym wylotem.",
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
