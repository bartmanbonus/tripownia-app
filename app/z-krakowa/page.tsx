import type { Metadata } from "next";
import DepartureDealsPage from "@/components/DepartureDealsPage";
export const metadata: Metadata = { title: { absolute: "Wyjazdy z Krakowa — wakacje i loty z KRK | Tripownia.pl" }, description: "Wyjazdy z Krakowa-Balic: aktualne wakacje, loty i oferty z KRK. Wybierz typ podróży albo przejdź do dedykowanej strony city break.", alternates: { canonical: "/z-krakowa" } };
export default function Page(){return <DepartureDealsPage city="Krakowa" airportCodes={["KRK"]} intro="Aktualne wyjazdy z Krakowa: od krótkich city breaków po wakacyjne pakiety. Jedna lista, różne kierunki i ceny prowadzące do partnerów Tripowni." cityBreakHref="/podroze/city-break-z-krakowa"/>}
