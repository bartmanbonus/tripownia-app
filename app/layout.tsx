import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import "./responsive-fixes.css";
import "./app-pwa.css";
import "./trip-mode.css";
import "./trip-toolkit.css";
import "./app-home.css";
import "./trip-header.css";
import "./premium-system.css";
import "./deals-premium.css";
import "./homepage-dream.css";
import "./offer-card-clean.css";
import "./homepage-polish.css";
import "./dream-home.css";
import "./sitewide-polish.css";
import "./sitewide-deep-polish.css";
import "./search-v3.css";
import "./search-v3-focus.css";
import "./footer-v2.css";
import "./article-depth.css";
import "./mobile-native-polish.css";
import "./score-section-fix.css";
import "./privacy-controls.css";
import "./my-trips.css";
import "./trip-organizer.css";
import "./travel-guides.css";
import "./home-trip-hub.css";
import "./purchase-guide.css";
import "./for-you-guided.css";
import "./country-checklist.css";
import "./account.css";
import "./planner-builder.css";
import "./contrast-guard.css";
import "./homepage-focus.css";
import "./ux-audit.css";
import PWARegister from "@/components/PWARegister";
import LegacyHomeAnchorBridge from "@/components/LegacyHomeAnchorBridge";
import OfferRailDeduper from "@/components/OfferRailDeduper";
import AffiliateClickBridge from "@/components/AffiliateClickBridge";
import AnalyticsClient from "@/components/AnalyticsClient";
import AnalyticsConsentBanner from "@/components/AnalyticsConsent";
import AnalyticsInteractions from "@/components/AnalyticsInteractions";
import MobileAppControls from "@/components/MobileAppControls";
import TripArchiveSync from "@/components/TripArchiveSync";
import OrganizerQuickLink from "@/components/OrganizerQuickLink";
import HomeTripHubPortal from "@/components/HomeTripHubPortal";
import AccountCloudSync from "@/components/AccountCloudSync";

const HOME_TITLE = "Tanie wakacje, city break i planer podróży | Tripownia.pl";
const HOME_DESCRIPTION = "Znajdź tanie wakacje, city break, lot + hotel i aktualne okazje z polskich lotnisk. Potem zaplanuj wyjazd za darmo: lot, nocleg, atrakcje i checklistę.";
const FAVICON_URL = "/tripownia-app-icon-v2.png";

export const metadata: Metadata = {
  metadataBase: new URL("https://tripownia.pl"),
  title: { default: HOME_TITLE, template: "%s | Tripownia.pl" },
  description: HOME_DESCRIPTION,
  keywords: ["tanie wakacje", "city break", "last minute", "tanie loty", "lot + hotel", "planer podróży", "darmowy planer podróży", "checklista podróżna", "atrakcje", "Tripownia"],
  manifest: "/manifest.webmanifest",
  applicationName: "Tripownia",
  icons: {
    icon: [{ url: FAVICON_URL, type: "image/png", sizes: "256x256" }],
    shortcut: [FAVICON_URL],
    apple: [{ url: FAVICON_URL, type: "image/png", sizes: "256x256" }],
  },
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Tripownia" },
  openGraph: {
    type: "website",
    locale: "pl_PL",
    siteName: "Tripownia",
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
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
const organizationJsonLd = { "@context": "https://schema.org", "@type": "Organization", "@id": "https://tripownia.pl/#organization", name: "Tripownia", alternateName: "Tripownia.pl", url: "https://tripownia.pl", logo: "https://tripownia.pl/tripownia-logo.webp", email: "kontakt@tripownia.pl", description: "Polski serwis podróżniczy do wyszukiwania wyjazdów, porównywania opcji i darmowego planowania całej podróży.", publishingPrinciples: "https://tripownia.pl/standardy-redakcyjne", sameAs: ["https://www.facebook.com/987707741084438"] };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pl">
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd).replace(/</g, "\\u003c") }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd).replace(/</g, "\\u003c") }} />
        <LegacyHomeAnchorBridge />
        {children}
        <HomeTripHubPortal />
        <OfferRailDeduper />
        <AffiliateClickBridge />
        <TripArchiveSync />
        <AccountCloudSync />
        <OrganizerQuickLink />
        <MobileAppControls />
        <Suspense fallback={null}><AnalyticsClient /></Suspense>
        <AnalyticsInteractions />
        <AnalyticsConsentBanner />
        <PWARegister />
      </body>
    </html>
  );
}

