"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";
import { trackMetaCustomEvent } from "@/lib/metaPixel";
import { saveAffiliateReturnContext } from "@/lib/affiliateReturn";

import { partnerFromUrl } from "@/lib/affiliateJourney";
import { usePathname } from "next/navigation";

function sourceFor(anchor: HTMLAnchorElement) {
  const explicitSource = anchor.dataset.affiliateSource
    || anchor.closest<HTMLElement>("[data-affiliate-source]")?.dataset.affiliateSource
    || "";
  if (explicitSource) return explicitSource;

  const offerCard = anchor.closest<HTMLElement>(".offer-card");
  const offerSurface = offerCard?.dataset.offerSurface || "";
  if (anchor.classList.contains("card-cta")) return offerSurface ? `offer_card:${offerSurface}` : "offer_card";
  if (anchor.classList.contains("hero-radar-offer")) return "radar";
  if (anchor.closest(".surprise-result")) return "surprise";
  if (anchor.closest(".trip-header")) return "header";
  if (anchor.closest(".trip-attractions")) return "my_trip_attraction";
  if (anchor.closest(".trip-search-actions")) return "partner_search_results";
  if (anchor.closest(".trip-partner-mini")) return "partner_search_browse";
  if (anchor.closest(".trip-search-extras")) return "search_extras";
  if (anchor.closest(".trip-plan-option")) return "planner_partner";
  if (anchor.closest(".search-v3-empty-actions")) return "search_fallback";
  if (anchor.closest(".favorites-page")) return "favorites";
  if (anchor.closest(".compare-page")) return "compare";
  if (anchor.closest(".seo-travel-landing-v3")) return "seo_landing";
  if (anchor.closest(".social-offer-page")) return "social_offer_addon";
  if (offerCard) return offerSurface ? `offer_image:${offerSurface}` : "offer_image";
  if (anchor.closest(".experience-expanded-page")) return "experience_search";
  return "site_outbound";
}

function cardContext(anchor: HTMLAnchorElement) {
  const card = anchor.closest<HTMLElement>(".offer-card");
  if (!card) return { destination: "", offer: "", price: "" };

  const city = card.querySelector<HTMLElement>("h3")?.textContent?.trim() || "";
  const country = card.querySelector<HTMLElement>(".eyebrow")?.textContent?.replace(/^[^\p{L}\p{N}]+/u, "").trim() || "";
  const offer = card.dataset.offerId || "";
  const price = card.dataset.offerPrice || "";
  return {
    destination: [city, country].filter(Boolean).join(", "),
    offer,
    price,
  };
}

function destinationFor(anchor: HTMLAnchorElement) {
  const card = cardContext(anchor);
  if (card.destination) return card.destination;

  const surprise = anchor.closest<HTMLElement>(".surprise-result");
  const surpriseDestination = surprise?.querySelector<HTMLElement>("strong")?.textContent?.trim() || "";
  if (surpriseDestination) return surpriseDestination;

  const search = anchor.closest<HTMLElement>(".trip-search-engine");
  if (search) {
    const submittedDestination = search.querySelector<HTMLElement>(".trip-search-results strong")?.textContent?.trim() || "";
    if (submittedDestination && submittedDestination !== "Dowolny kierunek") return submittedDestination;
    const typedDestination = search.querySelector<HTMLInputElement>(".trip-destination input")?.value?.trim() || "";
    if (typedDestination) return typedDestination;
  }

  const searchV3 = anchor.closest<HTMLElement>(".search-v3");
  if (searchV3) {
    const summary = searchV3.querySelector<HTMLElement>(".search-v3-active-summary strong")?.textContent?.trim() || "";
    if (summary && summary !== "Gdziekolwiek") return summary;
    const selected = searchV3.querySelector<HTMLElement>(".search-v3-selected button")?.textContent?.trim().replace("×", "").trim() || "";
    if (selected && selected !== "Gdziekolwiek") return selected;
    const typed = searchV3.querySelector<HTMLInputElement>("#tripownia-destination")?.value?.trim() || "";
    if (typed) return typed;
  }
  const preset = new URLSearchParams(window.location.search).get("destination") || "";
  if (preset && preset !== "Gdziekolwiek") return preset.split("|")[0].slice(0, 160);
  return "";
}

function currentOfferReturnDetails() {
  const params = new URLSearchParams(window.location.search);
  const path = window.location.pathname;
  const slug = path.startsWith("/o/") ? decodeURIComponent(path.slice(3).split("/")[0] || "") : (params.get("slug") || "");

  if (path !== "/okazja" && !path.startsWith("/o/")) {
    return { slug };
  }

  return {
    slug,
    start: params.get("start") || "",
    end: params.get("end") || "",
    departure: params.get("departure") || "",
    hotel: params.get("hotel") || "",
    board: params.get("board") || "",
    nights: params.get("nights") || "",
  };
}

function createClickId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID().slice(0, 18);
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function visitAttribution() {
  const current = new URLSearchParams(window.location.search);
  const fromUrl = {
    source: (current.get("utm_source") || "").toLowerCase(),
    medium: (current.get("utm_medium") || "").toLowerCase(),
    campaign: current.get("utm_campaign") || "",
    content: current.get("utm_content") || "",
    landing: window.location.pathname,
  };
  if (fromUrl.source || fromUrl.medium || fromUrl.campaign) return fromUrl;

  try {
    const raw = sessionStorage.getItem("tripownia-attribution-v1");
    const value = raw ? JSON.parse(raw) as Record<string, unknown> : null;
    if (value) {
      const stored = {
        source: typeof value.source === "string" ? value.source : "",
        medium: typeof value.medium === "string" ? value.medium : "",
        campaign: typeof value.campaign === "string" ? value.campaign : "",
        content: typeof value.content === "string" ? value.content : "",
        landing: typeof value.landing === "string" ? value.landing : window.location.pathname,
      };
      if (stored.source || stored.medium || stored.campaign) return stored;
    }
  } catch {}

  try {
    const referrer = document.referrer ? new URL(document.referrer) : null;
    const host = referrer?.hostname.toLowerCase() || "";
    if (/facebook\.com$|\.facebook\.com$|fb\.com$|\.fb\.com$|l\.facebook\.com$/.test(host)) {
      return { source: "facebook", medium: "organic_social", campaign: "", content: "", landing: window.location.pathname };
    }
    if (/instagram\.com$|\.instagram\.com$/.test(host)) {
      return { source: "instagram", medium: "organic_social", campaign: "", content: "", landing: window.location.pathname };
    }
    if (/tiktok\.com$|\.tiktok\.com$/.test(host)) {
      return { source: "tiktok", medium: "organic_social", campaign: "", content: "", landing: window.location.pathname };
    }
    if (/google\./.test(host)) {
      return { source: "google", medium: "organic", campaign: "", content: "", landing: window.location.pathname };
    }
    if (host && host !== window.location.hostname.toLowerCase()) {
      return { source: host, medium: "referral", campaign: "", content: "", landing: window.location.pathname };
    }
  } catch {}

  return { source: "direct", medium: "(none)", campaign: "", content: "", landing: window.location.pathname };
}

type ProtectedLink = {
  target: string;
  partner: string;
  mode: "review" | "exit" | "offer";
  context: Record<string, string>;
  href?: string;
  pending?: Promise<string | null>;
};

const protectedLinks = new WeakMap<HTMLAnchorElement, ProtectedLink>();
const PENDING_HREF = "/sprawdz-oferte";

function readPartnerLink(anchor: HTMLAnchorElement): ProtectedLink | null {
  const rawHref = anchor.getAttribute("href") || "";
  const old = protectedLinks.get(anchor);
  if (old && (rawHref === PENDING_HREF || rawHref === old.href)) return old;

  let url: URL;
  try { url = new URL(rawHref, window.location.origin); } catch { return null; }

  let target = "";
  const inherited: Record<string, string> = {};
  if (url.origin === window.location.origin) {
    if (url.pathname === "/go/live" || url.pathname === "/sprawdz-oferte" || url.pathname === "/okazja") {
      target = url.searchParams.get("target") || "";
      url.searchParams.forEach((value, name) => { if (name !== "target" && name !== "partner") inherited[name] = value; });
    } else if (/^\/out\/[^/]+\/?$/.test(url.pathname)) {
      target = url.searchParams.get("url") || "";
      url.searchParams.forEach((value, name) => { if (name !== "url") inherited[name] = value; });
    } else {
      return null;
    }
  } else {
    target = url.toString();
  }

  const partner = partnerFromUrl(target);
  if (!partner) return null;
  const card = cardContext(anchor);

  // A Tripownia offer detail remains internal; a partner-bound CTA should
  // resolve straight to the protected /przejdz endpoint, not show an
  // additional confirmation page before the actual booking.
  const mode: ProtectedLink["mode"] = url.pathname === "/okazja" ? "offer" : "exit";
  const attribution = visitAttribution();
  const context: Record<string, string> = {
    ...inherited,
    source: inherited.source || sourceFor(anchor),
    page: window.location.pathname,
    clickId: inherited.clickId || createClickId(),
    return: `${window.location.pathname}${window.location.search}`,
    destination: inherited.destination || anchor.dataset.salesDestination || destinationFor(anchor),
    offer: inherited.offer || anchor.dataset.salesOfferId || card.offer,
    price: inherited.price || anchor.dataset.salesPrice || card.price,
    utmSource: inherited.utmSource || attribution.source,
    utmMedium: inherited.utmMedium || attribution.medium,
    utmCampaign: inherited.utmCampaign || attribution.campaign,
    utmContent: inherited.utmContent || attribution.content,
    landing: inherited.landing || attribution.landing,
  };
  return { target, partner, mode, context };
}

function protectAnchor(anchor: HTMLAnchorElement): ProtectedLink | null {
  const data = readPartnerLink(anchor);
  if (!data) return null;
  if (protectedLinks.get(anchor) !== data) protectedLinks.set(anchor, data);
  if (!data.href && anchor.getAttribute("href") !== PENDING_HREF) {
    anchor.setAttribute("href", PENDING_HREF);
  }
  anchor.removeAttribute("target");
  anchor.setAttribute("rel", "sponsored");
  return data;
}

function validOpaqueHref(href: unknown, mode: ProtectedLink["mode"]): href is string {
  if (typeof href !== "string" || href.length > 12000) return false;
  return mode === "exit"
    ? /^\/przejdz\/[A-Za-z0-9_-]{40,12000}$/.test(href)
    : mode === "offer" ? /^\/okazja\?ref=[A-Za-z0-9_-]{40,12000}$/.test(href)
    : /^\/sprawdz-oferte\?ref=[A-Za-z0-9_-]{40,12000}$/.test(href);
}

function resolveProtectedLink(anchor: HTMLAnchorElement, data: ProtectedLink) {
  if (data.href) return Promise.resolve(data.href);
  if (data.pending) return data.pending;
  data.pending = fetch("/api/affiliate-link", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ target: data.target, partner: data.partner, mode: data.mode, context: data.context }),
    cache: "no-store",
  }).then(async response => {
    const value = response.ok ? await response.json() : null;
    const href = value?.href;
    if (!validOpaqueHref(href, data.mode)) return null;
    data.href = href;
    // If React replaced this anchor, never update it with an obsolete offer.
    if (protectedLinks.get(anchor) === data) anchor.setAttribute("href", href);
    return href;
  }).catch(() => null).finally(() => { data.pending = undefined; });
  return data.pending;
}

function wrapInitialPartnerLinks() {
  document.querySelectorAll<HTMLAnchorElement>(
    'a[href^="http://"], a[href^="https://"], a[href^="/go/live?"], a[href^="/sprawdz-oferte?"], a[href^="/okazja?"], a[href^="/out/"]'
  ).forEach(protectAnchor);
}

function interactiveAnchor(event: Event) {
  const target = event.target;
  return target instanceof Element ? target.closest<HTMLAnchorElement>("a[href]") : null;
}

function captureOutboundContext(anchor: HTMLAnchorElement, data: ProtectedLink) {
  const clickId = data.context.clickId || "";
  if (clickId && anchor.dataset.tripowniaOutboundContextSaved === clickId) return;
  const { partner, target, context } = data;
  const outboundHost = (() => { try { return new URL(target).hostname; } catch { return ""; } })();
  const destination = context.destination || destinationFor(anchor);
  saveAffiliateReturnContext({
    partner,
    destination,
    source: context.source || sourceFor(anchor),
    offerId: context.offer,
    price: context.price,
    ...currentOfferReturnDetails(),
  });
  trackEvent("affiliate_click", {
    partner,
    source: context.source,
    destination,
    page: window.location.pathname,
    outbound_host: outboundHost,
    offer_id: context.offer || undefined,
    price: context.price && Number.isFinite(Number(context.price)) ? Number(context.price) : undefined,
    currency: "PLN",
  });
  trackMetaCustomEvent("AffiliateClick", {
    partner, source: context.source, destination, page: window.location.pathname, outbound_host: outboundHost,
  });
  if (clickId) anchor.dataset.tripowniaOutboundContextSaved = clickId;
}

export default function AffiliateClickBridge() {
  const pathname = usePathname();
  useEffect(() => {
    wrapInitialPartnerLinks();

    const handleInteraction = (event: Event) => {
      const anchor = interactiveAnchor(event);
      if (!anchor) return;
      const data = protectAnchor(anchor);
      if (!data) return;

      if (event.type === "click" || event.type === "auxclick") {
        if (data.mode === "exit") captureOutboundContext(anchor, data);
        if (!data.href) {
          event.preventDefault();
          void resolveProtectedLink(anchor, data).then((href) => {
            if (href && protectedLinks.get(anchor) === data) window.location.assign(href);
            else if (!href) window.alert("Nie udało się przygotować linku. Spróbuj ponownie.");
          });
        }
      } else {
        // Prepare an opaque href on hover, focus or touch before navigation.
        void resolveProtectedLink(anchor, data);
      }
    };

    const observer = new MutationObserver((mutations) => {
      for (const change of mutations) {
        if (change.type === "attributes") {
          if (change.target instanceof HTMLAnchorElement) protectAnchor(change.target);
          continue;
        }
        for (const added of change.addedNodes) {
          if (added instanceof HTMLAnchorElement) protectAnchor(added);
          if (added instanceof Element) {
            added.querySelectorAll<HTMLAnchorElement>("a[href]").forEach(protectAnchor);
          }
        }
      }
    });
    observer.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ["href"] });

    document.addEventListener("pointerover", handleInteraction, true);
    document.addEventListener("pointerdown", handleInteraction, true);
    document.addEventListener("click", handleInteraction, true);
    document.addEventListener("auxclick", handleInteraction, true);
    document.addEventListener("focusin", handleInteraction, true);
    document.addEventListener("contextmenu", handleInteraction, true);

    return () => {
      observer.disconnect();
      document.removeEventListener("pointerover", handleInteraction, true);
      document.removeEventListener("pointerdown", handleInteraction, true);
      document.removeEventListener("click", handleInteraction, true);
      document.removeEventListener("auxclick", handleInteraction, true);
      document.removeEventListener("focusin", handleInteraction, true);
      document.removeEventListener("contextmenu", handleInteraction, true);
    };
  }, [pathname]);

  return null;
}
