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
    });
    trackEvent("outbound_partner_click", params);
    trackMetaCustomEvent("PartnerOutboundClick", params);
  }

  return (
    <a
      className={className}
      href={href}
      target="_blank"
      rel="sponsored noopener noreferrer"
      onClick={handleClick}
    >
      {children}
    </a>
  );
}
