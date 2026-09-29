import type { Metadata } from "next";
import DepartureDealsPage from "@/components/DepartureDealsPage";
export const metadata: Metadata = { title: { absolute: "Wakacje i city break z Katowic | Tripownia.pl" }, description: "Szukaj aktualnych pakietów i krótkich wyjazdów z Katowic. Tripownia zbiera różne kierunki w jednej, łatwej do przejrzenia puli.", alternates: { canonical: "/z-katowic" } };
export default function Page(){return <DepartureDealsPage city="Katowic" airportCodes={["KTW"]} intro="Szukaj aktualnych pakietów i krótkich wyjazdów z Katowic. Tripownia zbiera różne kierunki w jednej, łatwej do przejrzenia puli."/>}
