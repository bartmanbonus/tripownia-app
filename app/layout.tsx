import type { Metadata } from "next";
import "./globals.css";
import "./responsive-fixes.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://tripownia.pl"),
  title: { default: "Tripownia — My szukamy. Ty lecisz.", template: "%s | Tripownia.pl" },
  description: "Codziennie wybieramy konkretne okazje, city breaki, wakacje i podróże po przeżyciach. Dodatkowo możesz samodzielnie przeszukać więcej ofert.",
  keywords: ["tanie loty", "city break", "wakacje", "last minute", "lot hotel", "okazje podróżnicze", "Tripownia"],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "pl_PL",
    siteName: "Tripownia",
    title: "Tripownia — My szukamy. Ty lecisz.",
    description: "Codziennie wybieramy konkretne okazje, city breaki, wakacje i podróże po przeżyciach. Dodatkowo możesz samodzielnie przeszukać więcej ofert.",
    url: "/",
  },
  robots: { index: true, follow: true },
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Tripownia",
  alternateName: "Tripownia.pl",
  url: "https://tripownia.pl",
  inLanguage: "pl-PL",
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Tripownia",
  url: "https://tripownia.pl",
  logo: "https://tripownia.pl/icon.png",
  description: "Serwis z codziennie wybieranymi okazjami podróżniczymi, tanimi lotami, city breakami i wakacjami.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pl">
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd).replace(/</g, "\\u003c") }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd).replace(/</g, "\\u003c") }} />
        {children}
      </body>
    </html>
  );
}
