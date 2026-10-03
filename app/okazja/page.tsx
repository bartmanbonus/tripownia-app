import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, MapPin, Plane, Moon, Utensils, CalendarDays, BadgeCheck, PlusCircle } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import Image from "next/image";
import OfferAlternativeFinder from "@/components/OfferAlternativeFinder";
import OfferAlternativeJump from "@/components/OfferAlternativeJump";
import TrackedPartnerLink from "@/components/TrackedPartnerLink";

export const metadata: Metadata = {
  title: "Okazja podróżnicza",
  description: "Sprawdź szczegóły okazji znalezionej przez Tripownię i przejdź do rezerwacji u partnera.",
  robots: { index: false, follow: true },
};

type Search = Record<string, string | string[] | undefined>;

const PARTNERS = [
  { key: "esky", label: "eSky", hosts: ["www2.esky.pl", "www.esky.pl"] },
  { key: "exim", label: "EXIM Tours", hosts: ["exim.pl", "www.exim.pl", "reklamy.exim.pl"] },
  { key: "tui", label: "TUI", hosts: ["tui.pl", "www.tui.pl", "clk.tradedoubler.com"] },
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

const COUNTRY_IMAGE: Record<string, string> = {
  "Albania": "/images/destinations/riwiera-albanska.jpg",
  "Austria": "/images/destinations/wieden.jpg",
  "Chorwacja": "/images/destinations/split.jpg",
  "Cypr": "/images/destinations/pafos.jpg",
  "Czechy": "/images/destinations/praga.jpg",
  "Egipt": "/images/destinations/marsa-alam.jpg",
  "Francja": "/images/destinations/paryz.jpg",
  "Grecja": "/images/destinations/rodos.jpg",
  "Hiszpania": "/images/destinations/barcelona.jpg",
  "Holandia": "/images/destinations/amsterdam.jpg",
  "Irlandia": "/images/destinations/dublin.jpg",
  "Malta": "/images/destinations/valletta.jpg",
  "Maroko": "/images/destinations/marrakesz.jpg",
  "Portugalia": "/images/destinations/lizbona.jpg",
  "Tunezja": "/images/destinations/djerba.jpg",
  "Turcja": "/images/destinations/stambul.jpg",
  "Węgry": "/images/destinations/budapeszt.jpg",
  "Wielka Brytania": "/images/destinations/londyn.jpg",
  "Włochy": "/images/destinations/rzym.jpg",
};

function countryImage(country: string) {
  return COUNTRY_IMAGE[country] || null;
}

export default async function SocialOfferLanding({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const query = await searchParams;
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
  const note = one(query.note, "Tripownia znalazła tę ofertę u sprawdzonego partnera. Cena i dostępność mogą się zmienić.");
  if (!target) return notFound();

  const imageSrc = countryImage(country);
  const tripKind = target.partner.key === "kiwi" ? "flight" : target.partner.key === "booking" ? "hotel" : "package";
  const outboundParams = new URLSearchParams({
    partner: target.partner.key,
    target: target.url,
    source: "live_offer_detail",
    destination: [city, country].filter(Boolean).join(", "),
    ...(offerId ? { offer: offerId } : {}),
    ...(price ? { price: String(price) } : {}),
  });
  const outboundHref = `/go/live?${outboundParams.toString()}`;
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

  return (
    <main>
      <SiteHeader />
      <div className="shell">
        <div className="offer-detail-top">
          <Link href="/okazje"><ArrowLeft size={17}/> Zobacz wszystkie okazje</Link>
        </div>

        <section className="detail-hero">
          <div className="detail-image">
            {imageSrc ? (
              <Image
                src={imageSrc}
                alt={`${city}, ${country}`}
                className="detail-photo-img"
                width={1600}
                height={1000}
                sizes="(max-width: 760px) 100vw, 50vw"
                priority
              />
            ) : (
              <div className="tripownia-image-empty detail-photo-img" role="img" aria-label={`${city}, ${country}`}>
                <div className="tripownia-image-empty-inner">
                  <span className="tripownia-image-mark">✈</span>
                  <strong>{city}</strong>
                  <small>{country || "Tripownia.pl"}</small>
                </div>
              </div>
            )}
            <span className="badge hot">OKAZJA TRIPOWNI</span>
          </div>

          <div className="detail-copy">
            {country && <div className="eyebrow">{country}</div>}
            <h1>{city}</h1>

            <div className="detail-topline">
              <div className="detail-score">
                <BadgeCheck size={18}/>
                <span>Oferta znaleziona przez Tripownię</span>
              </div>
            </div>

            <div className="detail-price-card">
              {price ? (
                <div className="detail-price">
                  <small>znaleźliśmy od</small> <strong>{price.toLocaleString("pl-PL")} zł</strong> / os.
                </div>
              ) : (
                <div className="detail-price"><strong>Sprawdź aktualną cenę</strong></div>
              )}
              <div className="price-status detail-price-status">
                Finalną cenę i dostępność potwierdzisz przy rezerwacji.
              </div>
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

            <div className="detail-source">
              Najpierw oglądasz szczegóły w Tripowni. Rezerwacja i płatność odbywają się bezpośrednio u partnera.
            </div>

            <div className="detail-action-box">
              <TrackedPartnerLink
                className="primary-cta"
                href={outboundHref}
                partner={target.partner.key}
                offerId={Number(offerId) || 0}
                destination={[city, country].filter(Boolean).join(", ")}
                price={price || 0}
                placement={source.includes("search") ? "search_live_offer_detail" : "live_offer_detail_primary"}
                returnContext={{
                  departure,
                  hotel,
                  board,
                  nights,
                  start,
                  end,
                }}
              >
                Sprawdź aktualną cenę <ExternalLink size={18}/>
              </TrackedPartnerLink>
              <Link className="btn secondary" href={plannerHref}>
                <PlusCircle size={17}/> Dodaj do planera
              </Link>
              <OfferAlternativeJump />
              <small className="affiliate-note">
                Rezerwacja i płatność są u partnera. Link partnerski — możemy otrzymać prowizję bez dodatkowego kosztu dla Ciebie.
              </small>
            </div>
          </div>
        </section>

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
