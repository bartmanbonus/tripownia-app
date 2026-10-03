import DepartureDealsPage from "@/components/DepartureDealsPage";
import { departureHubMetadata } from "@/lib/departureHubMetadata";

export const metadata = departureHubMetadata({
  title: "Wakacje z Warszawy — Last Minute, All Inclusive i lot + hotel | Tripownia.pl",
  description: "Wakacje i wyjazdy z Warszawy: Last Minute, All Inclusive i lot + hotel z Lotniska Chopina oraz Modlina. Porównaj aktualne kierunki z WAW i WMI.",
  path: "/z-warszawy",
});

export default function Page() {
  return <DepartureDealsPage
    city="Warszawy"
    airportCodes={["WAW", "WMI"]}
    intro="Warszawa daje największy wybór kierunków w Tripowni. Porównaj wakacje, Last Minute, All Inclusive i lot + hotel z Chopina oraz Modlina; city breaki mają własną, krótszą ścieżkę."
    cityBreakHref="/podroze/city-break-z-warszawy"
    holidaysHref="/podroze/wakacje-z-warszawy"
    lastMinuteHref="/podroze/last-minute-z-warszawy"
    allInclusiveHref="/podroze/all-inclusive-z-warszawy"
  />;
}
