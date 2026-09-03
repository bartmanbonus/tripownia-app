import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://tripownia.pl"),
  title: { default: "Tripownia — My szukamy. Ty lecisz.", template: "%s | Tripownia.pl" },
  description: "Codziennie wybieramy konkretne okazje, city breaki, wakacje i podróże po przeżyciach. Wyszukuj także pełną ofertę partnerów eSky i Wakacje.pl.",
  keywords: ["tanie loty", "city break", "wakacje", "last minute", "lot hotel", "okazje podróżnicze", "Tripownia"],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "pl_PL",
    siteName: "Tripownia",
    title: "Tripownia — My szukamy. Ty lecisz.",
    description: "Codziennie wybieramy konkretne okazje, city breaki, wakacje i podróże po przeżyciach. Wyszukuj także pełną ofertę partnerów eSky i Wakacje.pl.",
  keywords: ["tanie loty", "city break", "wakacje", "last minute", "lot hotel", "okazje podróżnicze", "Tripownia"],
    url: "/",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pl">
      <body>{children}</body>
    </html>
  );
}
