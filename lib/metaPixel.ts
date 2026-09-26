"use client";

export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || "1814788099972866";

declare global {
  interface Window {
    fbq?: ((...args: unknown[]) => void) & { callMethod?: (...args: unknown[]) => void; queue?: unknown[]; loaded?: boolean; version?: string };
    _fbq?: Window["fbq"];
  }
}

function canUseMeta() {
  if (typeof window === "undefined" || !META_PIXEL_ID) return false;
  return window.localStorage.getItem("tripownia-consent-v1") === "marketing";
}

export function bootstrapMetaPixel() {
  if (!canUseMeta()) return false;

  if (!window.fbq) {
    const fbq = function (...args: unknown[]) {
      const current = window.fbq;
      if (current?.callMethod) current.callMethod(...args);
      else if (current) (current.queue ||= []).push(args);
    } as NonNullable<Window["fbq"]>;
    fbq.queue = [];
    fbq.loaded = true;
    fbq.version = "2.0";
    window.fbq = fbq;
    window._fbq = fbq;

    const script = document.createElement("script");
    script.async = true;
    script.src = "https://connect.facebook.net/en_US/fbevents.js";
    script.id = "tripownia-meta-pixel";
    document.head.appendChild(script);
  }

  if (!document.documentElement.dataset.tripowniaMetaConfigured) {
    window.fbq?.("init", META_PIXEL_ID);
    document.documentElement.dataset.tripowniaMetaConfigured = "1";
  }

  return true;
}

export function trackMetaPageView() {
  if (!bootstrapMetaPixel()) return;
  window.fbq?.("track", "PageView");
}

export function trackMetaCustomEvent(name: string, params: Record<string, unknown> = {}) {
  if (!bootstrapMetaPixel()) return;
  window.fbq?.("trackCustom", name, params);
}
