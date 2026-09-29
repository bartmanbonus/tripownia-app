import type { Metadata } from "next";
import DepartureDealsPage from "@/components/DepartureDealsPage";
export const metadata: Metadata = { title: "Wakacje i city break z Poznania | Tripownia.pl", description: "Szukaj wyjazdów z Poznania bez przeglądania wielu serwisów. Tripownia zbiera aktualne kierunki i prowadzi dalej do sprawdzonych partnerów.", alternates: { canonical: "/z-poznania" } };
export default function Page(){return <DepartureDealsPage city="Poznania" airportCodes={["POZ"]} intro="Szukaj wyjazdów z Poznania bez przeglądania wielu serwisów. Tripownia zbiera aktualne kierunki i prowadzi dalej do sprawdzonych partnerów."/>}
