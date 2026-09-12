import type { Metadata } from "next";
import DealsPage from "@/components/DealsPage";

export const metadata: Metadata = {
  title: "Dzisiejsze okazje podróżnicze | Tripownia.pl",
  description: "Do 20 różnych kierunków wybranych z aktualnych ofert. Jedna najtańsza poprawna propozycja na kierunek, bez ściany duplikatów.",
  alternates: { canonical: "/okazje" },
};

export default function DealsRoute(){
  return <DealsPage/>;
}
