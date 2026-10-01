import type { Metadata } from "next";
import DepartureDealsPage from "@/components/DepartureDealsPage";

export const metadata: Metadata = {
  title: "Wakacje z Warszawy, City Break i Last Minute",
  description: "Wyjazdy z Warszawy: City Break, Last Minute, All Inclusive i wakacje z Lotniska Chopina oraz Modlina. Sprawdź aktualne oferty z WAW i WMI.",
  alternates: { canonical: "/z-warszawy" },
  openGraph: {
    type: "website",
    locale: "pl_PL",
    siteName: "Tripownia",
    title: "Wakacje z Warszawy, City Break i Last Minute | Tripownia.pl",
    description: "Wyjazdy z Warszawy: City Break, Last Minute, All Inclusive i wakacje z Lotniska Chopina oraz Modlina. Sprawdź aktualne oferty z WAW i WMI.",
    url: "/z-warszawy",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Wakacje z Warszawy, City Break i Last Minute | Tripownia.pl",
    description: "Wyjazdy z Warszawy: City Break, Last Minute, All Inclusive i wakacje z Lotniska Chopina oraz Modlina. Sprawdź aktualne oferty z WAW i WMI.",
    images: ["/opengraph-image"],
  },
};

export default function Page() {
  return <DepartureDealsPage
    city="Warszawy"
    airportCodes={["WAW", "WMI"]}
    intro="Warszawa daje największy wybór kierunków w Tripowni. Porównaj City Break, Last Minute, All Inclusive i wakacje z Chopina oraz Modlina — bez przekopywania wielu osobnych wyszukiwarek."
    cityBreakHref="/podroze/city-break-z-warszawy"
    holidaysHref="/podroze/wakacje-z-warszawy"
    lastMinuteHref="/podroze/last-minute-z-warszawy"
    allInclusiveHref="/podroze/all-inclusive-z-warszawy"
  />;
}
