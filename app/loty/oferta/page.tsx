import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, CalendarDays, ExternalLink, Plane, Route } from "lucide-react";
import OfferHeroImage from "@/components/OfferHeroImage";
import OfferJourney from "@/components/OfferJourney";
import TrackedPartnerLink from "@/components/TrackedPartnerLink";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Szczegóły lotu | Tripownia",
  description: "Sprawdź trasę, termin i cenę lotu przed przejściem do rezerwacji.",
  robots: { index: false, follow: false },
};

type Search = Record<string, string | string[] | undefined>;

function one(value: string | string[] | undefined, fallback = "") {
  return Array.isArray(value) ? value[0] || fallback : value || fallback;
}

function safeIata(value: string) {
  const normalized = value.toUpperCase().replace(/[^A-Z]/g, "");
  return /^[A-Z]{3}$/.test(normalized) ? normalized : "";
}

function safeDate(value: string) {
  return /^20\d{2}-\d{2}-\d{2}$/.test(value) ? value : "";
}

function safePrice(value: string) {
  const price = Number(value);
  return Number.isFinite(price) && price > 0 ? Math.round(price) : 0;
}

function aviasalesUrl(origin: string, destination: string, depart: string, returnDate: string) {
  const ddmm = (value: string) => {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    return match ? match[3] + match[2] : "";
  };
  const outbound = ddmm(depart);
  const inbound = ddmm(returnDate);
  const path = origin && destination && outbound && inbound
    ? `${origin}${outbound}${destination}${inbound}1`
    : "";
  const url = new URL(path ? `https://www.aviasales.com/search/${path}` : "https://www.aviasales.com/");
  url.searchParams.set("marker", "695999.TRIPOWNIAPL");
  url.searchParams.set("shmarker", "695999.TRIPOWNIAPL");
  return url.toString();
}

export default async function FlightOfferPage({ searchParams }: { searchParams: Promise<Search> }) {
  const params = await searchParams;
  const origin = safeIata(one(params.origin));
  const destination = safeIata(one(params.destination));
  const depart = safeDate(one(params.depart));
  const returnDate = safeDate(one(params.return));
  const name = one(params.name, destination || "Kierunek");
  const country = one(params.country);
  const price = safePrice(one(params.price));
  const changes = Math.max(0, Math.min(9, Number(one(params.changes, "0")) || 0));

  const valid = Boolean(origin && destination && depart && returnDate);
  const partnerUrl = valid ? aviasalesUrl(origin, destination, depart, returnDate) : "";

  const backParams = new URLSearchParams();
  if (origin) backParams.set("origin", origin);
  if (name) backParams.set("destination", name);
  if (depart) backParams.set("outbound", depart);
  if (returnDate) backParams.set("inbound", returnDate);

  return (
    <main className="offer-journey-page">
      <SiteHeader />
      <div className="shell">
        <section className="detail-shell" style={{maxWidth: 900, margin: "36px auto 56px"}}>
          <Link href={`/loty?${backParams.toString()}`} className="btn secondary">
            <ArrowLeft size={17}/> Wróć do wyników
          </Link>

          <OfferJourney offerId={`${origin}-${destination}-${depart}-${returnDate}`} destination={name} partner="aviasales" price={price} source="flight_search" />
          {valid && <div style={{ marginTop: 20 }}><OfferHeroImage city={name} country={country} /></div>}
          <div className="detail-card" style={{marginTop: 18}}>
            <div className="kicker">KONKRETNY LOT</div>
            <h1 style={{marginTop: 8}}>
              {origin || "—"} → {destination || "—"}{name && name !== destination ? ` · ${name}` : ""}
            </h1>
            {country && <p>{country}</p>}

            {valid ? (
              <>
                <div className="detail-meta" style={{marginTop: 22}}>
                  <span><Plane size={18}/> <b>{origin}</b> → <b>{destination}</b></span>
                  <span><CalendarDays size={18}/> <b>{depart}</b> → <b>{returnDate}</b></span>
                  <span><Route size={18}/> <b>{changes === 0 ? "bez przesiadek" : `${changes} ${changes === 1 ? "przesiadka" : "przesiadki"}`}</b></span>
                </div>

                <div className="detail-price" style={{marginTop: 24}}>
                  <small>CENA ZNALEZIONA W WYSZUKIWARCE</small>
                  <strong>{price ? `od ${price.toLocaleString("pl-PL")} zł` : "Sprawdź aktualną cenę"}</strong>
                  <span>Cena może zmienić się do momentu rezerwacji.</span>
                </div>

                <div className="detail-action-box" style={{marginTop: 24}}>
                  <TrackedPartnerLink className="primary-cta" href={`/go/live?${new URLSearchParams({ target: partnerUrl, partner: "aviasales", source: "flight_detail", offer: `${origin}-${destination}-${depart}-${returnDate}`, destination: name, price: String(price), page: "/loty/oferta" }).toString()}`} partner="aviasales" offerId={`${origin}-${destination}-${depart}-${returnDate}`} destination={name} price={price} placement="flight_detail" returnContext={{ departure: origin, start: depart, end: returnDate }}>
                    Sprawdź tę trasę w Aviasales <ExternalLink size={18}/>
                  </TrackedPartnerLink>
                  <Link className="btn secondary" href={`/loty?${backParams.toString()}`}>
                    Zmień termin lub trasę
                  </Link>
                  <small className="affiliate-note">
                    Najpierw pokazujemy Ci konkretną trasę i termin w Tripowni. Rezerwacja odbywa się u partnera.
                  </small>
                </div>
              </>
            ) : (
              <div className="flight-deals-empty" style={{marginTop: 22}}>
                <strong>Nie udało się odtworzyć konkretnego lotu.</strong>
                <span>Wróć do wyszukiwarki i wybierz wynik ponownie.</span>
                <div style={{marginTop: 10}}>
                  <Link href="/loty">Wróć do wyszukiwarki lotów →</Link>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
      <SiteFooter />
    </main>
  );
}
