import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, MapPin, Plane, Moon, Utensils, CalendarDays, BadgeCheck } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import TravelImage from "@/components/TravelImage";

export const metadata: Metadata = {
  title: "Okazja podróżnicza | Tripownia.pl",
  description: "Sprawdź szczegóły okazji znalezionej przez Tripownię i przejdź do rezerwacji u partnera.",
  robots: { index: false, follow: true },
};

type Search = Record<string, string | string[] | undefined>;

const PARTNERS = [
  { key: "exim", label: "EXIM Tours", hosts: ["exim.pl", "www.exim.pl", "reklamy.exim.pl"] },
  { key: "tui", label: "TUI", hosts: ["tui.pl", "www.tui.pl", "clk.tradedoubler.com"] },
  { key: "wakacje", label: "Wakacje.pl", hosts: ["wakacje.pl", "www.wakacje.pl"] },
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
  const query = await searchParams;
  const city = one(query.city, "Wybrany kierunek");
  const country = one(query.country);
  const departure = one(query.departure, "Polska");
  const dates = one(query.dates, "Sprawdź dostępne terminy");
  const board = one(query.board, "wg oferty");
  const nights = Math.max(1, Math.min(30, Number(one(query.nights, "7")) || 7));
  const price = safePrice(one(query.price));
  const target = safeTarget(one(query.target));
  const note = one(query.note, "Tripownia znalazła tę ofertę u sprawdzonego partnera. Cena i dostępność mogą się zmienić.");
  if (!target) return notFound();

  const partnerLabel = target.partner.label;

  return (
    <main>
      <SiteHeader />
      <div className="shell">
        <div className="offer-detail-top">
          <Link href="/okazje"><ArrowLeft size={17}/> Zobacz wszystkie okazje</Link>
        </div>

        <section className="detail-hero">
          <div className="detail-image">
            <TravelImage
              city={city}
              country={country}
              alt={[city, country].filter(Boolean).join(", ")}
              className="detail-photo-img"
            />
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
                Finalną cenę i dostępność potwierdza {partnerLabel}.
              </div>
            </div>

            <p className="detail-lead">{note}</p>

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
              <a className="primary-cta" href={target.url} target="_blank" rel="sponsored noopener noreferrer">
                Sprawdź ofertę w {partnerLabel} <ExternalLink size={18}/>
              </a>
              <small className="affiliate-note">
                Link partnerski. Możemy otrzymać prowizję bez dodatkowego kosztu dla Ciebie.
              </small>
            </div>
          </div>
        </section>

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
