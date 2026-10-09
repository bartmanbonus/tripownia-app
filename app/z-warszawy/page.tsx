import DepartureDealsPage from "@/components/DepartureDealsPage";
import { departureHubMetadata } from "@/lib/departureHubMetadata";

export const metadata = departureHubMetadata({
  title: "City break z Warszawy – lot + hotel i wakacje | Tripownia.pl",
  description: "City break z Warszawy i Modlina (WAW, WMI) na 2–5 dni, wakacje i Last Minute. Porównaj pakiety lot + hotel, aktualne terminy i ceny z obu lotnisk.",
  path: "/z-warszawy",
});

export default function Page() {
  return <DepartureDealsPage
    city="Warszawy"
    heading="City break z Warszawy – lot + hotel, wakacje i Last Minute"
    airportCodes={["WAW", "WMI"]}
    intro="City break z Warszawy na 2–5 dni? Porównaj wyloty z Lotniska Chopina (WAW) i Modlina (WMI), a także dłuższe wakacje, Last Minute i All Inclusive. Wybierz termin i sprawdź pełny koszt przed rezerwacją."
    cityBreakHref="/podroze/city-break-z-warszawy"
    holidaysHref="/podroze/wakacje-z-warszawy"
    lastMinuteHref="/podroze/last-minute-z-warszawy"
    allInclusiveHref="/podroze/all-inclusive-z-warszawy"
  />;
}
