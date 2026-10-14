import type { SocialOffer } from "@/lib/socialOffers";
import { openAffiliateLink } from "@/lib/affiliateLinkToken";
import { getDestinationImageRule } from "@/lib/destinationImages";

const IMAGE_HOSTS = new Set([
  "r.cdn.redgalaxy.com",
  "img.exim.pl",
  "i.wakacje.pl",
  "images.unsplash.com",
  "hotelsapi.esky.com",
  "img.esky.pl",
  "static.esky.pl",
]);

function validImage(raw: string, city: string, country: string): string | undefined {
  const local = getDestinationImageRule(city, country).localPath;
  if (local && /^\/images\/[A-Za-z0-9/_-]+\.(?:jpg|jpeg|png|webp)$/.test(local)) {
    return local;
  }
  if (/^\/images\/[A-Za-z0-9/_-]+\.(?:jpg|jpeg|png|webp)$/.test(raw)) {
    return raw;
  }
  try {
    const url = new URL(raw);
    if (url.protocol === "https:" && IMAGE_HOSTS.has(url.hostname.toLowerCase()) && !url.username && !url.password) {
      return url.toString();
    }
  } catch {
    // No confirmed destination or provider image: display the neutral branded background.
  }
  return undefined;
}

function safePrice(raw: string, checkedAt: string, start: string): number {
  const price = Number(raw);
  const checked = new Date(checkedAt).getTime();
  if (!Number.isFinite(price) || price <= 0 || price >= 100000) return 0;
  // Social platforms cache their cards. Do not advertise a price that was not
  // checked recently or whose departure date is already in the past.
  if (!Number.isFinite(checked) || checked > Date.now() + 300000 || Date.now() - checked > 6 * 60 * 60 * 1000) {
    return 0;
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(start) && start < new Date().toISOString().slice(0, 10)) {
    return 0;
  }
  return Math.round(price);
}

export type LiveSharePreview = {
  offer: SocialOffer;
  title: string;
  description: string;
};

/** Decode the same signed Tripownia offer reference used by /okazja. */
export function liveOfferSharePreview(ref: string): LiveSharePreview | null {
  const payload = openAffiliateLink(ref);
  if (!payload || payload.mode !== "offer") return null;

  const ctx = payload.context;
  const city = (ctx.city || ctx.destination || "").trim().slice(0, 75);
  if (!city || city === "Wybrany kierunek") return null;

  const country = (ctx.country || "").trim().slice(0, 75);
  const departure = (ctx.departure || "Polska").trim().slice(0, 75);
  const dates = (ctx.dates || "Sprawdź dostępne terminy").trim().slice(0, 100);
  const hotel = (ctx.hotel || "Lot i pobyt — szczegóły oferty").trim().slice(0, 100);
  const board = (ctx.board || "wg oferty").trim().slice(0, 55);
  const nights = Math.max(1, Math.min(30, Number(ctx.nights) || 7));
  const price = safePrice(ctx.price || "", ctx.checkedAt || "", ctx.start || "");
  const imageSrc = validImage(ctx.image || "", city, country);
  const title = price
    ? city + " od " + price.toLocaleString("pl-PL") + " zł/os. — sprawdź ofertę | Tripownia.pl"
    : city + " — sprawdź aktualną ofertę | Tripownia.pl";
  const description = [hotel, dates, nights + " " + (nights === 1 ? "noc" : nights >= 2 && nights <= 4 ? "noce" : "nocy"), "wylot: " + departure, board]
    .filter(Boolean).join(" · ") + ". Cena i dostępność do potwierdzenia przed rezerwacją.";

  return {
    title,
    description,
    offer: {
      slug: "live-" + city.toLocaleLowerCase("pl").replace(/[^a-z0-9ąćęłńóśźż]+/gi, "-"),
      city,
      country,
      price,
      departure,
      dates,
      nights,
      board,
      hotel,
      partner: "other",
      partnerLabel: "Sprawdź ofertę",
      affiliateUrl: "",
      imageSrc,
      imageCountry: imageSrc ? country : undefined,
      checkedAt: ctx.checkedAt || "",
      status: "active",
    },
  };
}