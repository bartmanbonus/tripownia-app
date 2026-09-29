import type { Metadata } from "next";
import DepartureDealsPage from "@/components/DepartureDealsPage";
export const metadata: Metadata = { title: "Wakacje i city break z Krakowa | Tripownia.pl", description: "Aktualne wyjazdy z Krakowa: od krótkich city breaków po wakacyjne pakiety. Jedna lista, różne kierunki i ceny prowadzące do partnerów Tripowni.", alternates: { canonical: "/z-krakowa" } };
export default function Page(){return <DepartureDealsPage city="Krakowa" airportCodes={["KRK"]} intro="Aktualne wyjazdy z Krakowa: od krótkich city breaków po wakacyjne pakiety. Jedna lista, różne kierunki i ceny prowadzące do partnerów Tripowni."/>}
