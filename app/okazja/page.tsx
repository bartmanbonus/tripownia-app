import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, MapPin, Plane, Moon, Utensils, CalendarDays, BadgeCheck, PlusCircle, Bell } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import OfferHeroImage from "@/components/OfferHeroImage";
import OfferJourney from "@/components/OfferJourney";
import { formatPriceCheckedAt } from "@/lib/offerRuntime";
import OfferAlternativeFinder from "@/components/OfferAlternativeFinder";
import OfferAlternativeJump from "@/components/OfferAlternativeJump";
import TrackedPartnerLink from "@/components/TrackedPartnerLink";
import { partnerFromUrl } from "@/lib/affiliateJourney";
import { affiliateLinkContext, openAffiliateLink, sealAffiliateLink } from "@/lib/affiliateLinkToken";

export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "Okazja podróżnicza",
  description: "Sprawdź szczegóły okazji znalezionej przez Tripownię i zarezerwuj wyjazd.",
  robots: { index: false, follow: true },
};

type Search = Record<string, string | string[] | undefined>;

const PARTNERS = [
  { key: "esky", label: "eSky", hosts: ["www2.esky.pl", "www.esky.pl"] },
  { key: "exim", label: "EXIM Tours", hosts: ["exim.pl", "www.exim.pl", "reklamy.exim.pl"] },
  { key: "tui", label: "TUI", hosts: ["tui.pl", "www.tui.pl", "clk.tradedoubler.com", "pdt.tradedoubler.com"] },
  { key: "wakacje", label: "Wakacje.pl", hosts: ["wakacje.pl", "www.wakacje.pl"] },
  { key: "fly", label: "Fly.pl", hosts: ["fly.pl", "www.fly.pl"] },
  { key: "kiwi", label: "Kiwi.com", hosts: ["kiwi.com", "www.kiwi.com", "kiwi.tpk.lv", "c111.travelpayouts.com"] },
  { key: "booking", label: "Booking.com", hosts: ["booking.com", "www.booking.com"] },
  { key: "getyourguide", label: "GetYourGuide", hosts: ["getyourguide.pl", "www.getyourguide.pl", "getyourguide.com", "www.getyourguide.com", "clk.tradedoubler.com"] },
  { key: "seeplaces", label: "SeePlaces", hosts: ["seeplaces.com", "www.seeplaces.com", "ad.seeplaces.com"] },
  { key: "holidaypark", label: "Holiday Park", hosts: ["holidaypark.pl", "www.holidaypark.pl", "visit.holidaypark.pl"] },
  { key: "fonia", label: "Fonia", hosts: ["fonia.app", "www.fonia.app", "clk.tradedoubler.com"] },
  { key: "parklot", label: "Parklot", hosts: ["parklot.pl", "www.parklot.pl"] },
] as const;

function one(value: string | string[] | undefined, fallback = "") {
  const raw = Array.isArray(value) ? value[0] : value;
  return (raw || fallback).trim().slice(0, 220);
}

function safeTarget(value: string) {
  if (!value || value.length > 8192) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return null;
    const partner = PARTNERS.find((item) => item.hosts.includes(url.hostname.toLowerCase() as never));
    return partner ? { url: url.toString(), partner } : null;
  } catch {
    return null;
  }
}

function safePrice(value: string) {
  const parsed = Number(value.replace(/[^0-9]/g, ""));
  return Number.isFinite(parsed) && parsed > 0 && parsed < 100000 ? parsed : null;
}

export default async function SocialOfferLanding({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const received = await searchParams;
  const legacyTarget = Array.isArray(received.target) ? received.target[0] : received.target || "";
  if (legacyTarget) {
    const partner = partnerFromUrl(legacyTarget);
    if (!partner) redirect("/okazje");
    const rawContext: Record<string, string> = {};
    for (const [name, value] of Object.entries(received)) {
      if (name === "target" || name === "partner" || name === "ref") continue;
      if (typeof value === "string") rawContext[name] = value;
    }
    const ref = sealAffiliateLink({ mode: "offer", partner, target: legacyTarget, context: affiliateLinkContext(rawContext) });
    redirect(`/okazja?ref=${ref}`);
  }
  const payload = openAffiliateLink(one(received.ref, ""));
  if (!payload || payload.mode !== "offer") redirect("/okazje");
  const query: Search = { ...payload.context, target: payload.target };
  const city = one(query.city, "Wybrany kierunek");
  const country = one(query.country);
  const departure = one(query.departure, "Polska");
  const dates = one(query.dates, "Sprawdź dostępne terminy");
  const board = one(query.board, "wg oferty");
  const hotel = one(query.hotel);
  const airport = one(query.airport);
  const start = one(query.start);
  const end = one(query.end);
  const offerId = one(query.offer);
  const source = one(query.source, "live_offer");
  const nights = Math.max(1, Math.min(30, Number(one(query.nights, "7")) || 7));
  const price = safePrice(one(query.price));
  // Affiliate booking URLs can be much longer than labels/copy. Do not truncate them.
  const rawTarget = Array.isArray(query.target) ? query.target[0] : query.target || "";
  const target = safeTarget(rawTarget.trim());
  const note = one(query.note, "Tripownia znalazła tę ofertę. Cena i dostępność mogą się zmienić.");
  if (!target) redirect(city && city !== "Wybrany kierunek" ? `/okazje?destination=${encodeURIComponent(city)}` : "/okazje");

  const checkedAt = formatPriceCheckedAt(one(query.checkedAt));
  const tripKind = target.partner.key === "kiwi" ? "flight" : target.partner.key === "booking" ? "hotel" : "package";
  const outboundSource = source.startsWith("seo_")
    ? `seo_detail:${source}`
    : source.includes("search")
      ? "search_live_offer_detail"
      : source.includes("social")
        ? "social_offer_detail"
        : "live_offer_detail";

  const outboundRef = sealAffiliateLink({
    mode: "exit",
    partner: target.partner.key,
    target: target.url,
    context: {
      source: outboundSource,
      destination: [city, country].filter(Boolean).join(", "),
      ...(offerId ? { offer: offerId } : {}),
      ...(price ? { price: String(price) } : {}),
      page: "/okazja",
    },
  });
  const outboundHref = `/go/${outboundRef}`;
  const plannerParams = new URLSearchParams({
    mode: "known",
    source: "offer",
    city,
    country,
    kind: tripKind,
    ...(start ? { start } : {}),
    ...(end ? { end } : {}),
    ...(airport ? { departure: airport } : {}),
  });
  const plannerHref = `/dodaj-podroz?${plannerParams.toString()}`;
  const alertParams = new URLSearchParams({ destination: city, departure });
  if (price) alertParams.set("maxPrice", String(Math.ceil(price * 1.08)));
  const alertHref = `/alerty?${alertParams.toString()}`;
  const airportChoices = [
    { code: "WAWA", label: "Warszawa", activeCodes: ["WAW","WMI","WAWA"] },
    { code: "KRK", label: "Kraków", activeCodes: ["KRK"] },
    { code: "KTW", label: "Katowice", activeCodes: ["KTW"] },
    { code: "WRO", label: "Wrocław", activeCodes: ["WRO"] },
    { code: "GDN", label: "Gdańsk", activeCodes: ["GDN"] },
    { code: "POZ", label: "Poznań", activeCodes: ["POZ"] },
  ];

  return (
    <main className="offer-journey-page">
      <SiteHeader />
      <div className="shell">
        <div className="offer-detail-top">
          <Link href="/okazje"><ArrowLeft size={17}/> Zobacz wszystkie okazje</Link>
        </div>

        <OfferJourney offerId={offerId} destination={city} partner={target.partner.key} price={price || undefined} source={source} />
        <section className="detail-hero">
          <OfferHeroImage city={city} country={country} />

          <div className="detail-copy">
            {country && <div className="eyebrow">{country}</div>}
            <h1>{city}</h1>

            <div className="detail-topline">
              <div className="detail-score">
                <BadgeCheck size={18}/>
                <span>Oferta wybrana przez Tripownię</span>
              </div>
            </div>

            <div className="detail-price-card">
              {price ? (
                <>
                  <div className="detail-price">
                    <small>znaleźliśmy od</small> <strong>{price.toLocaleString("pl-PL")} zł</strong> / os.
                  </div>
                  <div className="price-status detail-price-status">
                    {checkedAt ? `Cena zapisana ${checkedAt}. ` : "Cena z wybranej propozycji. "}Aktualną cenę i dostępność potwierdzisz u partnera.
                  </div>
                </>
              ) : (
                <>
                  <div className="detail-price"><strong>Sprawdź aktualną cenę</strong></div>
                  <div className="price-status detail-price-status">
                    {checkedAt ? `Cena zapisana ${checkedAt}. ` : "Cena z wybranej propozycji. "}Aktualną cenę i dostępność potwierdzisz u partnera.
                  </div>
                </>
              )}
            </div>

            <div className="tripownia-purchase-actions tripownia-purchase-actions-priority">
              <TrackedPartnerLink
                className="primary-cta tripownia-buy-cta"
                href={outboundHref}
                partner={target.partner.key}
                offerId={Number(offerId) || 0}
                destination={[city, country].filter(Boolean).join(", ")}
                price={price || 0}
                placement={outboundSource}
                returnContext={{
                  departure,
                  hotel,
                  board,
                  nights,
                  start,
                  end,
                }}
              >
                Sprawdź aktualną cenę w {target.partner.label}
              </TrackedPartnerLink>
              <small className="tripownia-buy-trust">Finalną cenę i dostępność potwierdzisz u partnera przed płatnością.</small>
              <div className="tripownia-purchase-secondary">
                <Link className="btn secondary" href={plannerHref}>
                  <PlusCircle size={17}/> Dodaj do mojego planu
                </Link>
                <OfferAlternativeJump />
              </div>
              <small className="affiliate-note tripownia-disclosure">
                Link reklamowy · Cena dla Ciebie się nie zmienia.
              </small>
            </div>

            <p className="detail-lead">{note}</p>
            {hotel && <p className="offer-hotel-name"><strong>{hotel}</strong></p>}

            <div className="detail-meta">
              <span><Plane/> <b>{departure}</b></span>
              <span><Moon/> <b>{nights} nocy</b></span>
              <span><CalendarDays/> <b>{dates}</b></span>
              <span><Utensils/> <b>{board}</b></span>
              <span><MapPin/> <b>{[city, country].filter(Boolean).join(", ")}</b></span>
            </div>

            <div className="offer-detail-alert">
              <div><strong>Ta cena Cię interesuje?</strong><span>Ustaw alert dla {city}. Jeśli pojawi się podobna opcja, łatwo wrócisz do porównania.</span></div>
              <Link href={alertHref}><Bell size={15}/> Ustaw alert</Link>
            </div>

            <div className="offer-airport-choices">
              <small>SPRAWDŹ TEN KIERUNEK Z INNEGO LOTNISKA</small>
              <div className="offer-airport-choice-grid">
                {airportChoices.map(item => (
                  <Link
                    className={item.activeCodes.includes(airport) ? "active" : ""}
                    href={`/szukaj?${new URLSearchParams({ destination: city, airport: item.code, duration: `${Math.max(2,nights-1)}-${Math.min(14,nights+1)}`, tab: "Lot + hotel" }).toString()}`}
                    key={item.code}
                  ><Plane size={13}/>{item.label}</Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="live-mobile-booking-bar">
          <div>
            <small>{price ? "Znaleźliśmy od" : "Aktualna oferta"}</small>
            <strong>{price ? `${price.toLocaleString("pl-PL")} zł / os.` : "Sprawdź cenę"}</strong>
          </div>
          <TrackedPartnerLink
            href={outboundHref}
            partner={target.partner.key}
            offerId={Number(offerId) || 0}
            destination={[city, country].filter(Boolean).join(", ")}
            price={price || 0}
            placement={`${outboundSource}:mobile_bar`}
            returnContext={{ departure, hotel, board, nights, start, end }}
          >
            Sprawdź cenę
          </TrackedPartnerLink>
        </div>

        <OfferAlternativeFinder
          city={city}
          country={country}
          nights={nights}
          board={board}
          departure={departure}
          airportCode={airport}
          dates={dates}
          startDateISO={start}
          hotel={hotel}
          currentOfferId={Number(offerId) || 0}
        />

        <section className="deals-end-cta" style={{ marginBottom: 36 }}>
          <div>
            <strong>Nie ta oferta?</strong>
            <span>Zobacz inne aktualne okazje i znajdź wyjazd po swojemu.</span>
          </div>
          <Link href="/okazje">Zobacz więcej okazji →</Link>
        </section>
      </div>
      <SiteFooter />
    </main>
  );
}
