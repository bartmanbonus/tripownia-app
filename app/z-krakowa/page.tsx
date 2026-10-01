import type { Metadata } from "next";
import DepartureDealsPage from "@/components/DepartureDealsPage";

export const metadata: Metadata = {
  title: { absolute: "Wakacje z Krakowa, City Break i Last Minute | Tripownia.pl" },
  description: "Wyjazdy z Krakowa-Balic: City Break, Last Minute, All Inclusive i wakacje z KRK. Sprawdź aktualne oferty i porównaj różne kierunki.",
  alternates: { canonical: "/z-krakowa" },
};

export default function Page() {
  return <DepartureDealsPage
    city="Krakowa"
    airportCodes={["KRK"]}
    intro="Kraków ma duży potencjał na krótkie wyjazdy i wakacyjne pakiety. Zebraliśmy w jednym miejscu City Break, Last Minute, All Inclusive i wakacje z Balic, żeby szybciej przejść od pomysłu do konkretnej oferty."
    cityBreakHref="/podroze/city-break-z-krakowa"
    holidaysHref="/podroze/wakacje-z-krakowa"
    lastMinuteHref="/podroze/last-minute-z-krakowa"
    allInclusiveHref="/podroze/all-inclusive-z-krakowa"
  />;
}
