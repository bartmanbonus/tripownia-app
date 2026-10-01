import type { Metadata } from "next";
import DepartureDealsPage from "@/components/DepartureDealsPage";

export const metadata: Metadata = {
  title: { absolute: "Wakacje z Warszawy, City Break i Last Minute | Tripownia.pl" },
  description: "Wyjazdy z Warszawy: City Break, Last Minute, All Inclusive i wakacje z Lotniska Chopina oraz Modlina. Sprawdź aktualne oferty z WAW i WMI.",
  alternates: { canonical: "/z-warszawy" },
};

export default function Page() {
  return <DepartureDealsPage
    city="Warszawy"
    airportCodes={["WAW", "WMI"]}
    intro="Warszawa daje największy wybór kierunków w Tripowni. Porównaj City Break, Last Minute, All Inclusive i wakacje z Chopina oraz Modlina — bez przekopywania wielu osobnych wyszukiwarek."
    cityBreakHref="/podroze/city-break-z-warszawy"
    holidaysHref="/podroze/wakacje-z-warszawy"
    lastMinuteHref="/podroze/last-minute-z-warszawy"
    allInclusiveHref="/podroze/all-inclusive-z-warszawy"
  />;
}
