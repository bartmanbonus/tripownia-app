"use client";

import { ArrowRight } from "lucide-react";
import { saveAffiliateReturnContext } from "@/lib/affiliateReturn";
import { trackEvent } from "@/lib/analytics";

type Props = {
  href: string;
  partner: string;
  partnerLabel?: string;
  slug: string;
  price?: number;
  destination: string;
  tripKind?: "flight" | "hotel" | "package";
  departure?: string;
  hotel?: string;
  board?: string;
  nights?: number;
  start?: string;
  end?: string;
};

export default function AffiliateOfferLink({ href, partner, slug, price, destination, tripKind = "package", departure, hotel, board, nights, start, end }: Props) {
  function rememberTripContext() {
    trackEvent("outbound_partner_click", {
      partner,
      offer_id: slug,
      destination,
      price,
      source: "social_offer",
      placement: "social_offer",
    });
    saveAffiliateReturnContext({
      slug,
      partner,
      destination,
      source: "social_offer",
      price,
      tripKind,
      departure,
      hotel,
      board,
      nights,
      start,
      end,
    });
  }

  return (
    <a
      className="primary-cta"
      href={href}
      rel="sponsored"
      data-partner-exit="1"
      data-affiliate-source="social_offer"
      data-sales-partner={partner}
      data-sales-offer-id={slug}
      data-sales-price={price}
      data-sales-destination={destination}
      onClick={rememberTripContext}
    >
      Sprawdź aktualną cenę <ArrowRight size={18}/>
    </a>
  );
}
