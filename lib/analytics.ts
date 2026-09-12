export const GA_MEASUREMENT_ID = "G-GHST5CY5LL";
export const ANALYTICS_CONSENT_KEY = "tripownia-consent-v1";
export const ANALYTICS_CONSENT_EVENT = "tripownia-consent-updated";

export type AnalyticsConsent = "analytics" | "necessary" | null;
export type AnalyticsParams = Record<string, string | number | boolean | undefined | null>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function getAnalyticsConsent(): AnalyticsConsent {
  if (typeof window === "undefined") return null;
  const value = window.localStorage.getItem(ANALYTICS_CONSENT_KEY);
  return value === "analytics" || value === "necessary" ? value : null;
}

export function setAnalyticsConsent(consent: Exclude<AnalyticsConsent, null>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ANALYTICS_CONSENT_KEY, consent);
  window.dispatchEvent(new CustomEvent(ANALYTICS_CONSENT_EVENT, { detail: consent }));
}

function ensureGtag() {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  if (!window.gtag) {
    window.gtag = (...args: unknown[]) => {
      window.dataLayer?.push(args);
    };
  }
}

export function bootstrapAnalytics() {
  if (typeof window === "undefined" || getAnalyticsConsent() !== "analytics") return false;

  ensureGtag();
  const scriptId = "tripownia-ga4";
  if (!document.getElementById(scriptId)) {
    const script = document.createElement("script");
    script.id = scriptId;
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);
  }

  if (!document.documentElement.dataset.tripowniaGaConfigured) {
    window.gtag?.("js", new Date());
    window.gtag?.("config", GA_MEASUREMENT_ID, {
      send_page_view: false,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
    });
    document.documentElement.dataset.tripowniaGaConfigured = "1";
  }

  return true;
}

export function trackEvent(name: string, params: AnalyticsParams = {}) {
  if (!bootstrapAnalytics()) return;
  const cleaned = Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null)
  );
  window.gtag?.("event", name, cleaned);
}

export function trackPageView(path: string) {
  if (!bootstrapAnalytics()) return;
  window.gtag?.("event", "page_view", {
    page_path: path,
    page_location: window.location.href,
    page_title: document.title,
  });
}
