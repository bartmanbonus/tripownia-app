import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import "./responsive-fixes.css";
import "./app-pwa.css";
import "./trip-mode.css";
import "./trip-toolkit.css";
import "./app-home.css";
import "./mobile-search-tabs-fix.css";
import "./trip-header.css";
import "./search-dream.css";
import "./premium-system.css";
import "./deals-premium.css";
import "./homepage-dream.css";
import "./offer-card-clean.css";
import "./homepage-polish.css";
import "./dream-home.css";
import "./sitewide-polish.css";
import "./sitewide-deep-polish.css";
import "./search-ux-v2.css";
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
import "./contrast-guard.css";
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
import PurchaseGuidePortal from "@/components/PurchaseGuidePortal";
import AccountCloudSync from "@/components/AccountCloudSync";

const HOME_TITLE = "Tripownia – darmowy personalizowany planer podróży";
const HOME_DESCRIPTION = "Darmowy personalizowany planer podróży: dokumenty, pogoda, transport, atrakcje, jedzenie, checklista i plan dnia. Znajdź wyjazd lub dodaj ten, który już masz.";
const FAVICON_URL = "/tripownia-app-icon-v2.png";

export const metadata: Metadata = {
  metadataBase: new URL("https://tripownia.pl"),
  title: { default: HOME_TITLE, template: "%s | Tripownia.pl" },
  description: HOME_DESCRIPTION,
  keywords: ["planer podróży", "plan podróży", "darmowy planer podróży", "checklista podróżna", "wakacje", "loty", "hotele", "atrakcje", "Tripownia"],
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
const organizationJsonLd = { "@context": "https://schema.org", "@type": "Organization", name: "Tripownia", url: "https://tripownia.pl", logo: "https://tripownia.pl/tripownia-logo.webp", description: "Darmowy personalizowany planer podróży i platforma do znalezienia oraz zorganizowania całego wyjazdu — od dokumentów i pogody po transport, atrakcje i rezerwacje." };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pl">
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd).replace(/</g, "\\u003c") }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd).replace(/</g, "\\u003c") }} />
        <LegacyHomeAnchorBridge />
        {children}
        <PurchaseGuidePortal />
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

