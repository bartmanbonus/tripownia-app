"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { trackEvent } from "@/lib/analytics";

type Props = {
  href: string;
  action: "dates" | "airport" | "offers" | "weekend" | "alert";
  detail?: string;
  className?: string;
  children: ReactNode;
};

export default function TrackedCampaignLink({ href, action, detail, className, children }: Props) {
  return (
    <Link
      href={href}
      className={className}
      data-campaign-action={action}
      onClick={() => trackEvent("campaign_action", {
        campaign: "long_weekend_november_2026",
        action,
        detail: detail || "",
        placement: "november_campaign_landing",
      })}
    >
      {children}
    </Link>
  );
}
