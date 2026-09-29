import type { Metadata } from "next";
import DepartureDealsPage from "@/components/DepartureDealsPage";
export const metadata: Metadata = { title: { absolute: "Wakacje i city break z Wrocławia | Tripownia.pl" }, description: "Aktualne okazje z Wrocławia: city break, wakacje i krótkie wyjazdy. Jedna uporządkowana pula zamiast powtarzających się ofert.", alternates: { canonical: "/z-wroclawia" } };
export default function Page(){return <DepartureDealsPage city="Wrocławia" airportCodes={["WRO"]} intro="Aktualne okazje z Wrocławia: city break, wakacje i krótkie wyjazdy. Jedna uporządkowana pula zamiast powtarzających się ofert." cityBreakHref="/podroze/city-break-z-wroclawia"/>}
