"use client";

import type { ReactNode } from "react";
import { trackEvent } from "@/lib/analytics";
import { trackMetaCustomEvent } from "@/lib/metaPixel";
import { saveAffiliateReturnContext } from "@/lib/affiliateReturn";

type Props = {
  href: string;
  partner: string;
  offerId: number;
  destination: string;
  price: number;
  placement: string;
  className?: string;
  returnContext?: {
    departure?: string;
    hotel?: string;
    board?: string;
    nights?: number | string;
    start?: string;
    end?: string;
  };
  children: ReactNode;
};

export default function TrackedPartnerLink({
  href,
  partner,
  offerId,
  destination,
  price,
  placement,
  className,
  returnContext,
  children,
}: Props) {
  function handleClick() {
    const params = {
      partner,
      offer_id: offerId,
      destination,
      price,
      placement,
    };
    saveAffiliateReturnContext({
      partner,
      destination,
      source: placement,
      offerId,
      price,
      departure: returnContext?.departure,
      hotel: returnContext?.hotel,
      board: returnContext?.board,
      nights: returnContext?.nights,
      start: returnContext?.start,
      end: returnContext?.end,
    });
    trackEvent("outbound_partner_click", params);
    trackMetaCustomEvent("PartnerOutboundClick", params);
  }

  return (
    <a
      className={className}
      href={href}
      rel="sponsored"
      data-affiliate-source={placement}
      onClick={handleClick}
    >
      {children}
    </a>
  );
}
