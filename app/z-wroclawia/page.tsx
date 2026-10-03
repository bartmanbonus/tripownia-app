import DepartureDealsPage from "@/components/DepartureDealsPage";
import { departureHubMetadata } from "@/lib/departureHubMetadata";

export const metadata = departureHubMetadata({
  title: "Wakacje z Wrocławia — Last Minute, All Inclusive i lot + hotel | Tripownia.pl",
  description: "Wakacje i wyjazdy z Wrocławia (WRO): Last Minute, All Inclusive i lot + hotel. Porównaj aktualne kierunki, ceny i terminy z lokalnego lotniska.",
  path: "/z-wroclawia",
});

export default function Page() {
  return <DepartureDealsPage
    city="Wrocławia"
    airportCodes={["WRO"]}
    intro="Wyjazdy z Wrocławia: wakacje, Last Minute, All Inclusive i lot + hotel z WRO. Dla krótkich wyjazdów przejdź do osobnego landingu city break."
    cityBreakHref="/podroze/city-break-z-wroclawia"
    holidaysHref="/podroze/wakacje-z-wroclawia"
    lastMinuteHref="/podroze/last-minute-z-wroclawia"
    allInclusiveHref="/podroze/all-inclusive-z-wroclawia"
  />;
}
