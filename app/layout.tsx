import type { Metadata } from "next";
import "./globals.css";
import "./responsive-fixes.css";
import "./app-pwa.css";
import "./trip-mode.css";
import "./app-home.css";
import "./mobile-search-tabs-fix.css";
import "./trip-header.css";
import "./search-dream.css";
import PWARegister from "@/components/PWARegister";

export const metadata: Metadata = {
  metadataBase: new URL("https://tripownia.pl"),
  title: { default: "Tripownia — My szukamy. Ty lecisz.", template: "%s | Tripownia.pl" },
  description: "Codziennie wybieramy konkretne okazje, city breaki, wakacje i podróże po przeżyciach. Dodatkowo możesz samodzielnie przeszukać więcej ofert.",
  keywords: ["tanie loty", "city break", "wakacje", "last minute", "lot hotel", "okazje podróżnicze", "Tripownia"],
  manifest: "/manifest.webmanifest",
  applicationName: "Tripownia",
  icons: {
    icon: [{ url: "/tripownia-app-icon-v2.png", type: "image/png", sizes: "256x256" }],
    shortcut: ["/tripownia-app-icon-v2.png"],
    apple: [{ url: "/tripownia-app-icon-v2.png", type: "image/png", sizes: "256x256" }],
  },
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Tripownia" },
  openGraph: {
    type: "website",
    locale: "pl_PL",
    siteName: "Tripownia",
    title: "Tripownia — My szukamy. Ty lecisz.",
    description: "Codziennie wybieramy konkretne okazje, city breaki, wakacje i podróże po przeżyciach. Dodatkowo możesz samodzielnie przeszukać więcej ofert.",
  },
  robots: { index: true, follow: true },
};

const websiteJsonLd = { "@context": "https://schema.org", "@type": "WebSite", name: "Tripownia", alternateName: "Tripownia.pl", url: "https://tripownia.pl", inLanguage: "pl-PL" };
const organizationJsonLd = { "@context": "https://schema.org", "@type": "Organization", name: "Tripownia", url: "https://tripownia.pl", logo: "https://tripownia.pl/tripownia-logo.webp", description: "Serwis z codziennie wybieranymi okazjami podróżniczymi, tanimi lotami, city breakami i wakacjami." };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pl">
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd).replace(/</g, "\\u003c") }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd).replace(/</g, "\\u003c") }} />
        {children}
        <PWARegister />
      </body>
    </html>
  );
}
