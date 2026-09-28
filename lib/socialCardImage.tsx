import React from "react";
import type { SocialOffer } from "@/lib/socialOffers";

export type SocialCardFormat = "feed" | "story" | "tiktok";
type VisualType = "city" | "holiday" | "exotic";

const SAL_IMAGE = "https://r.cdn.redgalaxy.com/scale/o2/TUI/hotels/SID10006/S26/35351876.jpg?dstw=1200&dsth=644.0795159896282&srcw=1157&srch=621&srcx=1%2F2&srcy=1%2F2&srcmode=3&type=1&quality=80";

function visualType(slug: string): VisualType {
  if (slug === "marrakesz" || slug === "gambia-bamboo-2421" || slug === "kenia-voyager-4419") return "exotic";
  if (slug === "cypr" || slug === "porto-trindade-1209" || slug === "madera-garajau-1599") return "city";
  if (
    slug === "rodos-stamos-2116" ||
    slug === "teneryfa-alua-2841" ||
    slug === "sal-riu-funana-3927" ||
    slug === "marsa-utopia-1970" ||
    slug === "kreta-heronissos-1599" ||
    slug === "teneryfa-suneo-2689"
  ) return "holiday";
  return "city";
}

function category(type: VisualType) {
  if (type === "holiday") return "WAKACJE | ALL INCLUSIVE";
  if (type === "exotic") return "EGZOTYKA";
  return "CITY BREAK";
}

function colors(type: VisualType) {
  if (type === "holiday") return { bg: "#0d57b8", fg: "#ffffff", price: "#f58a35", cta: "#ff8734" };
  if (type === "exotic") return { bg: "#0e4a46", fg: "#ffffff", price: "#ffffff", cta: "#2c7a56" };
  return { bg: "#f4f0e5", fg: "#123254", price: "#f36f2b", cta: "#f47c35" };
}

function displayDestination(offer: SocialOffer) {
  if (offer.slug === "cypr") return "CYPR";
  if (offer.slug === "sal-riu-funana-3927") return "SAL";
  return offer.city.toLocaleUpperCase("pl");
}

function imageUrl(offer: SocialOffer, origin: string) {
  if (offer.slug === "sal-riu-funana-3927") return SAL_IMAGE;
  if (!offer.imageSrc) return origin + "/tripownia-logo.webp";
  return offer.imageSrc.startsWith("http") ? offer.imageSrc : origin + offer.imageSrc;
}

function dateShort(offer: SocialOffer) {
  const exact: Record<string, string> = {
    "26 października – 2 listopada 2026": "26.10–02.11 2026",
    "21–29 października 2026": "21–29.10 2026",
    "25–29 października 2026": "25–29.10 2026",
    "15–19 listopada 2026": "15–19.11 2026",
    "15–18 listopada 2026": "15–18.11 2026",
    "19–26 listopada 2026": "19–26.11 2026",
    "10–17 grudnia 2026": "10–17.12 2026",
    "14–21 grudnia 2026": "14–21.12 2026",
    "17–24 grudnia 2026": "17–24.12 2026",
    "4–12 grudnia 2026": "04–12.12 2026",
    "1–9 grudnia 2026": "01–09.12 2026",
  };
  return exact[offer.dates] || offer.dates;
}

const wrap: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  position: "relative",
  overflow: "hidden",
  fontFamily: "Arial, sans-serif",
};

function Wordmark({ fg }: { fg: string }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", fontSize: 23, fontWeight: 800, letterSpacing: "-0.4px", color: fg }}>
      <span>TRIPOWNIA</span><span style={{ color: "#f28a31" }}>.PL</span>
    </div>
  );
}

function Meta({ offer, fg, compact = false }: { offer: SocialOffer; fg: string; compact?: boolean }) {
  const fs = compact ? 22 : 25;
  const gap = compact ? 22 : 28;
  return (
    <div style={{ display: "flex", width: "100%", justifyContent: "space-between", alignItems: "center", color: fg, fontSize: fs, gap }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span>▦</span><b>{dateShort(offer)}</b></div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span>☾</span><b>{offer.nights} {offer.nights === 1 ? "noc" : "nocy"}</b></div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span>✈</span><b>Wylot<br />z {offer.departure.replace("m.in. ", "")}</b></div>
    </div>
  );
}

function CoreCard({ offer, origin, width, height }: { offer: SocialOffer; origin: string; width: number; height: number }) {
  const type = visualType(offer.slug);
  const c = colors(type);
  const destination = displayDestination(offer);
  const titleSize = destination.length > 10 ? 87 : destination.length > 7 ? 100 : 116;
  const priceText = offer.price.toLocaleString("pl-PL").replace(/\u00A0/g, " ");
  return (
    <div style={{ ...wrap, width, height, background: c.bg, color: c.fg, padding: "56px 70px 0" }}>
      <Wordmark fg={c.fg} />
      <div style={{ display: "flex", marginTop: 35, fontSize: 25, letterSpacing: 10, fontWeight: 500, borderBottom: `2px solid ${c.fg}`, paddingBottom: 14, width: "74%" }}>
        {category(type)}
      </div>
      <div style={{ display: "flex", fontFamily: "Georgia, serif", fontWeight: 800, fontSize: titleSize, lineHeight: 0.94, marginTop: 24, letterSpacing: -4 }}>
        {destination}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", marginTop: 4, color: c.price }}>
        <div style={{ fontFamily: "Georgia, serif", fontWeight: 800, fontSize: 103, lineHeight: 1 }}>{priceText}</div>
        <div style={{ color: c.fg, fontSize: 28, fontWeight: 700, marginLeft: 14 }}>zł/os.</div>
      </div>
      <div style={{ display: "flex", marginTop: 22 }}>
        <Meta offer={offer} fg={c.fg} compact />
      </div>
      <div style={{ display: "flex", position: "absolute", left: 0, right: 0, bottom: 0, height: 555 }}>
        <img src={imageUrl(offer, origin)} width="1080" height="555" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ display: "flex", position: "absolute", bottom: 34, left: "50%", transform: "translateX(-50%)", background: c.cta, color: "#fff", borderRadius: 30, padding: "17px 38px", fontSize: 26, fontWeight: 700, whiteSpace: "nowrap" }}>
          Sprawdź ofertę →
        </div>
      </div>
    </div>
  );
}

function Story({ offer, origin }: { offer: SocialOffer; origin: string }) {
  const src = imageUrl(offer, origin);
  return (
    <div style={{ ...wrap, width: 1080, height: 1920, background: "#15202a", alignItems: "center", justifyContent: "center" }}>
      <img src={src} width="1080" height="1920" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: "blur(18px)", opacity: 0.62, transform: "scale(1.08)" }} />
      <div style={{ display: "flex", position: "absolute", inset: 0, background: "rgba(0,0,0,.22)" }} />
      <div style={{ display: "flex", width: 720, height: 900, borderRadius: 26, overflow: "hidden", boxShadow: "0 24px 55px rgba(0,0,0,.36)" }}>
        <CoreCard offer={offer} origin={origin} width={720} height={900} />
      </div>
    </div>
  );
}

function TikTokFull({ offer, origin }: { offer: SocialOffer; origin: string }) {
  const type = visualType(offer.slug);
  const c = colors(type);
  const destination = displayDestination(offer);
  const priceText = offer.price.toLocaleString("pl-PL").replace(/\u00A0/g, " ");
  return (
    <div style={{ ...wrap, width: 1080, height: 1920, background: c.bg, color: c.fg, padding: "75px 72px 0" }}>
      <Wordmark fg={c.fg} />
      <div style={{ display: "flex", marginTop: 40, fontSize: 28, letterSpacing: 10, borderBottom: `2px solid ${c.fg}`, paddingBottom: 16, width: "78%" }}>{category(type)}</div>
      <div style={{ display: "flex", fontFamily: "Georgia, serif", fontWeight: 800, fontSize: destination.length > 9 ? 105 : 132, lineHeight: .95, marginTop: 28 }}>{destination}</div>
      <div style={{ display: "flex", alignItems: "baseline", color: c.price, marginTop: 8 }}>
        <div style={{ fontFamily: "Georgia, serif", fontSize: 112, fontWeight: 800 }}>{priceText}</div>
        <div style={{ color: c.fg, fontSize: 30, fontWeight: 700, marginLeft: 15 }}>zł/os.</div>
      </div>
      <div style={{ display: "flex", marginTop: 22 }}><Meta offer={offer} fg={c.fg} /></div>
      <div style={{ display: "flex", position: "absolute", left: 72, right: 72, top: 790, height: 850, borderRadius: 30, overflow: "hidden" }}>
        <img src={imageUrl(offer, origin)} width="936" height="850" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
      <div style={{ display: "flex", position: "absolute", bottom: 95, left: 180, right: 180, justifyContent: "center", background: c.cta, color: "#fff", borderRadius: 44, padding: "24px 40px", fontSize: 33, fontWeight: 700 }}>
        Sprawdź ofertę →
      </div>
    </div>
  );
}

function TikTok({ offer, origin }: { offer: SocialOffer; origin: string }) {
  return (
    <div style={{ ...wrap, width: 608, height: 1080, overflow: "hidden" }}>
      <div style={{ display: "flex", width: 1080, height: 1920, transform: "scale(0.562963)", transformOrigin: "top left" }}>
        <TikTokFull offer={offer} origin={origin} />
      </div>
    </div>
  );
}

export function SocialCardImage({ offer, origin, format }: { offer: SocialOffer; origin: string; format: SocialCardFormat }) {
  if (format === "story") return <Story offer={offer} origin={origin} />;
  if (format === "tiktok") return <TikTok offer={offer} origin={origin} />;
  return <CoreCard offer={offer} origin={origin} width={1080} height={1350} />;
}
