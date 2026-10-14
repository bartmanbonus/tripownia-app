"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { ANALYTICS_CONSENT_EVENT, ATTRIBUTION_KEY, bootstrapAnalytics, trackEvent, trackPageView } from "@/lib/analytics";
import { AFFILIATE_ATTRIBUTION_COOKIE, AFFILIATE_ATTRIBUTION_MAX_AGE_MS, parseAffiliateVisitAttribution } from "@/lib/attributionCookie";

type ReferralAttribution = {
  source: string;
  medium: string;
  campaign: string;
  content: string;
  landing: string;
  capturedAt: string;
};

function hasManualAttribution(searchParams: URLSearchParams) {
  return Boolean(
    searchParams.get("utm_source")
    || searchParams.get("utm_medium")
    || searchParams.get("utm_campaign")
  );
}

function persistAttributionCookie(value: ReferralAttribution) {
  // Consent is checked by trackCurrentVisit, which is the only caller.
  const parsed = parseAffiliateVisitAttribution(JSON.stringify(value));
  if (!parsed) return;
  const encoded = encodeURIComponent(JSON.stringify(parsed));
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${AFFILIATE_ATTRIBUTION_COOKIE}=${encoded}; Path=/; SameSite=Lax; Max-Age=${AFFILIATE_ATTRIBUTION_MAX_AGE_MS / 1000}${secure}`;
}

function persistAttribution(value: ReferralAttribution) {
  try {
    sessionStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(value));
    persistAttributionCookie(value);
    return true;
  } catch {
    return false;
  }
}

function hasStoredAttribution() {
  try {
    const raw = sessionStorage.getItem(ATTRIBUTION_KEY);
    const parsed = parseAffiliateVisitAttribution(raw);
    if (!parsed) return false;
    // Also cover visitors with an older sessionStorage entry from before this release.
    persistAttributionCookie({ ...parsed, campaign: "", content: "" });
    return true;
  } catch {
    return false;
  }
}

function trackReferral(searchParams: URLSearchParams) {
  const source = (searchParams.get("utm_source") || "").toLowerCase();
  const medium = (searchParams.get("utm_medium") || "").toLowerCase();
  const campaign = searchParams.get("utm_campaign") || "";
  const content = searchParams.get("utm_content") || "";
  if (!source && !medium && !campaign) return false;

  persistAttribution({
    source,
    medium,
    campaign,
    content,
    landing: window.location.pathname,
    capturedAt: new Date().toISOString(),
  });

  trackEvent("campaign_referral", {
    source,
    medium,
    campaign,
    content,
  });

  if (["facebook", "instagram", "fb", "ig", "meta", "tiktok"].includes(source) || medium.includes("social")) {
    trackEvent("social_referral", { source, medium, campaign, content });
  }
  return true;
}

function externalReferrerAttribution(): ReferralAttribution | null {
  if (!document.referrer) return null;

  try {
    const referrer = new URL(document.referrer);
    const host = referrer.hostname.toLowerCase();
    const ownHost = window.location.hostname.toLowerCase();
    if (!host || host === ownHost || host.endsWith(`.${ownHost}`)) return null;

    const isGoogle = host === "google.com"
      || host.endsWith(".google.com")
      || /^google\.[a-z.]+$/.test(host)
      || /^www\.google\.[a-z.]+$/.test(host);
    const isFacebook = host === "facebook.com"
      || host.endsWith(".facebook.com")
      || host === "fb.com"
      || host.endsWith(".fb.com");
    const isInstagram = host === "instagram.com" || host.endsWith(".instagram.com");
    const isTikTok = host === "tiktok.com" || host.endsWith(".tiktok.com");

    const source = isGoogle
      ? "google"
      : isFacebook
        ? "facebook"
        : isInstagram
          ? "instagram"
          : isTikTok
            ? "tiktok"
            : host;
    const medium = isGoogle
      ? "organic"
      : isFacebook || isInstagram || isTikTok
        ? "organic_social"
        : "referral";

    return {
      source,
      medium,
      campaign: "",
      content: "",
      landing: window.location.pathname,
      capturedAt: new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

function rememberInitialExternalReferrer(searchParams: URLSearchParams) {
  // Attribution storage stays inside the existing analytics-consent flow:
  // this function is called only after bootstrapAnalytics() succeeds.
  if (hasManualAttribution(searchParams) || hasStoredAttribution()) return;

  const attribution = externalReferrerAttribution();
  if (!attribution || !persistAttribution(attribution)) return;

  trackEvent("organic_referral", {
    source: attribution.source,
    medium: attribution.medium,
    landing: attribution.landing,
  });

  if (attribution.medium === "organic_social") {
    trackEvent("social_referral", {
      source: attribution.source,
      medium: attribution.medium,
      landing: attribution.landing,
    });
  }
}

function trackCurrentVisit(path: string, searchParams: URLSearchParams) {
  trackPageView(path);
  const hasUtm = trackReferral(searchParams);
  if (!hasUtm) rememberInitialExternalReferrer(searchParams);
}

export default function AnalyticsClient() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.toString();

  useEffect(() => {
    const path = `${pathname}${query ? `?${query}` : ""}`;
    if (bootstrapAnalytics()) {
      trackCurrentVisit(path, new URLSearchParams(query));
    }
  }, [pathname, query]);

  useEffect(() => {
    const handleConsent = () => {
      if (bootstrapAnalytics()) {
        const path = `${window.location.pathname}${window.location.search}`;
        trackCurrentVisit(path, new URLSearchParams(window.location.search));
      }
    };
    window.addEventListener(ANALYTICS_CONSENT_EVENT, handleConsent as EventListener);
    return () => window.removeEventListener(ANALYTICS_CONSENT_EVENT, handleConsent as EventListener);
  }, []);

  return null;
}
