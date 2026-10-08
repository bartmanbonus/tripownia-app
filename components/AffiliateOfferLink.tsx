"use client";

import { ArrowRight } from "lucide-react";
import { saveAffiliateReturnContext } from "@/lib/affiliateReturn";

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

export default function AffiliateOfferLink({ href, partner, partnerLabel, slug, price, destination, tripKind = "package", departure, hotel, board, nights, start, end }: Props) {
  function rememberTripContext() {
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
      Sprawdź aktualną cenę{partnerLabel ? ` w ${partnerLabel}` : " u partnera"} <ArrowRight size={18}/>
    </a>
  );
}
