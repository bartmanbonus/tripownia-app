import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import "./responsive-fixes.css";
import "./app-pwa.css";
import "./trip-mode.css";
import "./app-home.css";
import "./mobile-search-tabs-fix.css";
import "./trip-header.css";
import "./search-dream.css";
import "./premium-system.css";
import "./deals-premium.css";
import "./homepage-dream.css";
import "./offer-card-clean.css";
import "./homepage-polish.css";
import "./sitewide-polish.css";
import "./sitewide-deep-polish.css";
import "./search-ux-v2.css";
import "./search-v3.css";
import PWARegister from "@/components/PWARegister";
import LegacyHomeAnchorBridge from "@/components/LegacyHomeAnchorBridge";
import AnalyticsClient from "@/components/AnalyticsClient";
import AnalyticsConsentBanner from "@/components/AnalyticsConsent";
import AnalyticsInteractions from "@/components/AnalyticsInteractions";

const HOME_TITLE = "Tanie wakacje, city break i lot + hotel – okazje podróżnicze | Tripownia";
const HOME_DESCRIPTION = "Codziennie wybieramy dobre okazje na wakacje, city breaki i lot + hotel. Sprawdź cenę, termin, hotel i aktualne propozycje z polskich lotnisk.";

export const metadata: Metadata = {
  metadataBase: new URL("https://tripownia.pl"),
  title: { default: HOME_TITLE, template: "%s | Tripownia.pl" },
  description: HOME_DESCRIPTION,
  keywords: ["tanie wakacje", "city break", "wakacje", "last minute", "lot hotel", "tanie loty", "okazje podróżnicze", "Tripownia"],
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
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    url: "https://tripownia.pl/",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Tripownia.pl — My szukamy. Ty lecisz." }],
  },
  twitter: {
    card: "summary_large_image",
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    images: ["/opengraph-image"],
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
};

const websiteJsonLd = { "@context": "https://schema.org", "@type": "WebSite", name: "Tripownia", alternateName: "Tripownia.pl", url: "https://tripownia.pl", inLanguage: "pl-PL" };
const organizationJsonLd = { "@context": "https://schema.org", "@type": "Organization", name: "Tripownia", url: "https://tripownia.pl", logo: "https://tripownia.pl/tripownia-logo.webp", description: "Serwis z codziennie wybieranymi okazjami podróżniczymi, tanimi lotami, city breakami i wakacjami." };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pl">
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd).replace(/</g, "\\u003c") }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd).replace(/</g, "\\u003c") }} />
        <LegacyHomeAnchorBridge />
        {children}
        <Suspense fallback={null}><AnalyticsClient /></Suspense>
        <AnalyticsInteractions />
        <AnalyticsConsentBanner />
        <PWARegister />
      </body>
    </html>
  );
}
