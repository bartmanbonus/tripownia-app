import type { Metadata } from "next";
import DepartureDealsPage from "@/components/DepartureDealsPage";
export const metadata: Metadata = { title: { absolute: "Wakacje i city break z Warszawy | Tripownia.pl" }, description: "Chopin i Modlin w jednej puli. Tripownia pokazuje różne kierunki, żeby szybciej znaleźć wyjazd zamiast przekopywać dziesiątki podobnych ofert.", alternates: { canonical: "/z-warszawy" } };
export default function Page(){return <DepartureDealsPage city="Warszawy" airportCodes={["WAW","WMI"]} intro="Chopin i Modlin w jednej puli. Tripownia pokazuje różne kierunki, żeby szybciej znaleźć wyjazd zamiast przekopywać dziesiątki podobnych ofert."/>}
