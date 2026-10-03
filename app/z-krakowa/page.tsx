import type { Metadata } from "next";
import DepartureDealsPage from "@/components/DepartureDealsPage";

export const metadata: Metadata = {
  title: "City Break z Krakowa, Last Minute i wakacje z KRK",
  description: "City Break z Krakowa-Balic, Last Minute, All Inclusive i wakacje z KRK. Porównaj aktualne kierunki, ceny i lot + hotel z Balic.",
  alternates: { canonical: "/z-krakowa" },
  openGraph: {
    type: "website",
    locale: "pl_PL",
    siteName: "Tripownia",
    title: "City Break z Krakowa, Last Minute i wakacje z KRK | Tripownia.pl",
    description: "Wyjazdy z Krakowa-Balic: City Break, Last Minute, All Inclusive i wakacje z KRK. Sprawdź aktualne oferty i porównaj różne kierunki.",
    url: "/z-krakowa",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Wakacje z Krakowa, City Break i Last Minute | Tripownia.pl",
    description: "Wyjazdy z Krakowa-Balic: City Break, Last Minute, All Inclusive i wakacje z KRK. Sprawdź aktualne oferty i porównaj różne kierunki.",
    images: ["/opengraph-image"],
  },
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
