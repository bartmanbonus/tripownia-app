"use client";

import { ArrowRight } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

type Props = {
  href: string;
  partner: string;
  slug: string;
  destination: string;
  tripKind?: "flight" | "hotel" | "package";
};

export default function AffiliateOfferLink({ href, partner, slug, destination, tripKind = "package" }: Props) {
  function rememberTripContext() {
    try {
      const [city = "", country = ""] = destination.split(",").map((part) => part.trim());
      localStorage.setItem("tripownia-affiliate-return-v1", JSON.stringify({
        savedAt: new Date().toISOString(),
        slug,
        partner,
        destination,
        city,
        country,
        tripKind,
      }));
    } catch {
      // Brak localStorage nie może blokować przejścia do partnera.
    }
    trackEvent("affiliate_click", { partner, offer_slug: slug, destination, source: "social_offer", trip_kind: tripKind });
  }

  return (
    <a
      className="primary-cta"
      href={href}
      rel="sponsored"
      onClick={rememberTripContext}
    >
      Sprawdź ofertę w {partner} <ArrowRight size={18}/>
    </a>
  );
}
