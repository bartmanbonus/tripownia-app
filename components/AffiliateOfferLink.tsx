"use client";

import { ArrowRight } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { saveAffiliateReturnContext } from "@/lib/affiliateReturn";

type Props = {
  href: string;
  partner: string;
  slug: string;
  destination: string;
  tripKind?: "flight" | "hotel" | "package";
  departure?: string;
  hotel?: string;
  board?: string;
  nights?: number;
};

export default function AffiliateOfferLink({ href, partner, slug, destination, tripKind = "package", departure, hotel, board, nights }: Props) {
  function rememberTripContext() {
    saveAffiliateReturnContext({
      slug,
      partner,
      destination,
      source: "social_offer",
      tripKind,
      departure,
      hotel,
      board,
      nights,
    });
    trackEvent("affiliate_click", { partner, offer_slug: slug, destination, source: "social_offer", trip_kind: tripKind });
  }

  return (
    <a
      className="primary-cta"
      href={href}
      rel="sponsored"
      onClick={rememberTripContext}
    >
      Sprawdź ofertę <ArrowRight size={18}/>
    </a>
  );
}
