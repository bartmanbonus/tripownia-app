import type { Metadata } from "next";
import DepartureDealsPage from "@/components/DepartureDealsPage";
export const metadata: Metadata = { title: "Wakacje i city break z Gdańska | Tripownia.pl", description: "Aktualne kierunki z Gdańska — krótkie wyjazdy i wakacyjne pakiety z konkretnymi cenami, terminami i linkami do partnerów.", alternates: { canonical: "/z-gdanska" } };
export default function Page(){return <DepartureDealsPage city="Gdańska" airportCodes={["GDN"]} intro="Aktualne kierunki z Gdańska — krótkie wyjazdy i wakacyjne pakiety z konkretnymi cenami, terminami i linkami do partnerów."/>}
