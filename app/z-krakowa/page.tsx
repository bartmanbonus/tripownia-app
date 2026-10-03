import DepartureDealsPage from "@/components/DepartureDealsPage";
import { departureHubMetadata } from "@/lib/departureHubMetadata";

export const metadata = departureHubMetadata({
  title: "Wakacje z Krakowa — Last Minute, All Inclusive i lot + hotel | Tripownia.pl",
  description: "Wakacje i wyjazdy z Krakowa-Balic (KRK): Last Minute, All Inclusive i lot + hotel. Porównaj aktualne kierunki, ceny i terminy z Balic.",
  path: "/z-krakowa",
});

export default function Page() {
  return <DepartureDealsPage
    city="Krakowa"
    airportCodes={["KRK"]}
    intro="Wyjazdy z Krakowa-Balic w jednej ścieżce: wakacje, Last Minute, All Inclusive i lot + hotel. Krótkie city breaki są oddzielone, żeby łatwiej porównać wyjazdy na 2–5 dni."
    cityBreakHref="/podroze/city-break-z-krakowa"
    holidaysHref="/podroze/wakacje-z-krakowa"
    lastMinuteHref="/podroze/last-minute-z-krakowa"
    allInclusiveHref="/podroze/all-inclusive-z-krakowa"
  />;
}
