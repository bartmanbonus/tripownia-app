import DepartureDealsPage from "@/components/DepartureDealsPage";
import { departureHubMetadata } from "@/lib/departureHubMetadata";

export const metadata = departureHubMetadata({
  title: "Gdzie polecieć z Katowic? Wakacje, Last Minute i All Inclusive | Tripownia.pl",
  description: "Gdzie polecieć z Katowic-Pyrzowic? Porównaj wakacje, Last Minute, All Inclusive i lot + hotel z KTW oraz aktualne kierunki z lokalnego lotniska.",
  path: "/z-katowic",
});

export default function Page() {
  return <DepartureDealsPage
    city="Katowic"
    airportCodes={["KTW"]}
    intro="Zastanawiasz się, gdzie polecieć z Katowic? Porównaj wakacje, Last Minute, All Inclusive i lot + hotel z Pyrzowic. Krótkie city breaki mają osobną stronę."
    cityBreakHref="/podroze/city-break-z-katowic"
    holidaysHref="/podroze/wakacje-z-katowic"
    lastMinuteHref="/podroze/last-minute-z-katowic"
    allInclusiveHref="/podroze/all-inclusive-z-katowic"
  />;
}
