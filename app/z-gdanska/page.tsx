import DepartureDealsPage from "@/components/DepartureDealsPage";
import { departureHubMetadata } from "@/lib/departureHubMetadata";

export const metadata = departureHubMetadata({
  title: "Wakacje z Gdańska — Last Minute, All Inclusive i lot + hotel | Tripownia.pl",
  description: "Wakacje i wyjazdy z Gdańska (GDN): Last Minute, All Inclusive i lot + hotel. Porównaj aktualne kierunki, ceny i terminy z Trójmiasta.",
  path: "/z-gdanska",
});

export default function Page() {
  return <DepartureDealsPage
    city="Gdańska"
    airportCodes={["GDN"]}
    intro="Wyjazdy z Gdańska w jednej puli: wakacje, Last Minute, All Inclusive i lot + hotel z GDN. Krótkie city breaki mają osobną stronę z kierunkami na 2–5 dni."
    cityBreakHref="/podroze/city-break-z-gdanska"
    holidaysHref="/podroze/wakacje-z-gdanska"
    lastMinuteHref="/podroze/last-minute-z-gdanska"
    allInclusiveHref="/podroze/all-inclusive-z-gdanska"
  />;
}
