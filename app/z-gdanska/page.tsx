import DepartureDealsPage from "@/components/DepartureDealsPage";
import { departureHubMetadata } from "@/lib/departureHubMetadata";

export const metadata = departureHubMetadata({
  title: "City break z Gdańska – lot + hotel i wakacje | Tripownia.pl",
  description: "City break z Gdańska (GDN) na 2–5 dni, wakacje i Last Minute. Porównaj terminy, lot + hotel i aktualne kierunki z Trójmiasta.",
  path: "/z-gdanska",
});

export default function Page() {
  return <DepartureDealsPage
    city="Gdańska"
    heading="City break z Gdańska – lot + hotel, wakacje i Last Minute"
    airportCodes={["GDN"]}
    intro="Szukasz city breaku z Gdańska na 2–5 dni? Porównaj lot + hotel z GDN, godziny lotów, aktualne kierunki i całkowity koszt. Sprawdź także wakacje, Last Minute i All Inclusive z Trójmiasta."
    cityBreakHref="/podroze/city-break-z-gdanska"
    holidaysHref="/podroze/wakacje-z-gdanska"
    lastMinuteHref="/podroze/last-minute-z-gdanska"
    allInclusiveHref="/podroze/all-inclusive-z-gdanska"
  />;
}
