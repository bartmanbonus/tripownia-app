import DepartureDealsPage from "@/components/DepartureDealsPage";
import { departureHubMetadata } from "@/lib/departureHubMetadata";

export const metadata = departureHubMetadata({
  title: "City break z Poznania – lot + hotel i wakacje | Tripownia.pl",
  description: "City break z Poznania (POZ) na 2–5 dni, wakacje, Last Minute i All Inclusive z Ławicy. Porównaj terminy, pakiety lot + hotel i pełny koszt wyjazdu.",
  path: "/z-poznania",
});

export default function Page() {
  return <DepartureDealsPage
    city="Poznania"
    heading="City break z Poznania – lot + hotel, wakacje i Last Minute"
    airportCodes={["POZ"]}
    intro="Wylatujesz z Ławicy? Wybierz city break z Poznania na 2–5 dni albo dłuższe wakacje, Last Minute lub All Inclusive. Porównaj kierunki, terminy i pełny koszt, a następnie przejdź do konkretnej oferty."
    cityBreakHref="/podroze/city-break-z-poznania"
    holidaysHref="/podroze/wakacje-z-poznania"
    lastMinuteHref="/podroze/last-minute-z-poznania"
    allInclusiveHref="/podroze/all-inclusive-z-poznania"
  />;
}
