"use client";

import Link from "next/link";
import { Bell, Clock3, Flame, ArrowRight, Zap } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { Offer } from "@/lib/offers";
import { liveOfferLandingHref } from "@/lib/liveOfferLanding";
import { liveDealKind, liveNightsLabel, livePriceAge, selectLiveDeals } from "@/lib/liveDealSelection";

type ApiResponse = { ok?: boolean; offers?: Offer[]; sourceType?: string; fallback?: boolean; partial?: boolean };
const KIND_LABELS = { city: "City break", allinclusive: "All Inclusive", exotic: "Daleka podr\u00f3\u017c", holiday: "Wypoczynek" };

export default function TripowniaLive() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [now, setNow] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [sourceProblem, setSourceProblem] = useState(false);

  useEffect(() => {
    let active = true;
    let inFlight = false;
    let controller: AbortController | null = null;
    const tick = () => setNow(Date.now());
    tick();

    const load = async () => {
      if (inFlight) return;
      inFlight = true;
      const request = new AbortController();
      controller = request;
      const timeout = window.setTimeout(() => request.abort(), 65_000);
      try {
        const response = await fetch("/api/today-offers?mode=search&broad=1", { cache: "no-store", signal: request.signal });
        if (!response.ok) throw new Error("live_request_failed");
        const data = await response.json() as ApiResponse;
        if (!active) return;
        if (!data || data.ok === false || !Array.isArray(data.offers)
          || data.fallback === true || data.sourceType !== "live") throw new Error("live_source_unavailable");
        // Keep the complete pool: limiting it here let cheap Malta variants occupy every card.
        setOffers(data.offers);
        setSourceProblem(data.partial === true);
      } catch {
        // Previously received rows can survive a transient error ONLY while their
        // own prices remain eligible. The minute clock expires them independently.
        if (active) setSourceProblem(true);
      } finally {
        window.clearTimeout(timeout);
        inFlight = false;
        if (controller === request) controller = null;
        if (active) { setLoaded(true); tick(); }
      }
    };

    const resume = () => { if (document.visibilityState === "visible") tick(); };
    void load();
    const refreshTimer = window.setInterval(() => { if (document.visibilityState === "visible") void load(); }, 5 * 60 * 1000);
    const clockTimer = window.setInterval(tick, 60_000);
    document.addEventListener("visibilitychange", resume);
    return () => {
      active = false;
      controller?.abort();
      window.clearInterval(refreshTimer);
      window.clearInterval(clockTimer);
      document.removeEventListener("visibilitychange", resume);
    };
  }, []);

  const rows = useMemo(() => selectLiveDeals(offers, 6, now), [offers, now]);

  return (
    <section className="section shell tripownia-live" aria-labelledby="tripownia-live-title" aria-busy={!loaded}>
      <div className="tripownia-live-head">
        <div>
          <div className="kicker"><Flame size={14}/> TRIPOWNIA LIVE</div>
          <h2 id="tripownia-live-title">Wybrane okazje na wyjazd.</h2>
          <p>{"Konkretne terminy, ceny i hotele. Bez powtarzania tego samego kierunku."}</p>
        </div>
        <Link href="/okazje">Wszystkie okazje <ArrowRight size={16}/></Link>
      </div>

      {!loaded && <p role="status">{"Wyszukujemy aktualne propozycje w r\u00f3\u017cnych kierunkach\u2026"}</p>}
      {loaded && !rows.length && (
        <div className="tripownia-live-empty" role="status">
          <p>{sourceProblem
            ? "Nie uda\u0142o si\u0119 teraz pobra\u0107 aktualnych cen. Nie zast\u0119pujemy ich niepotwierdzonymi okazjami."
            : "Nie mamy teraz ofert spe\u0142niaj\u0105cych kryteria tej sekcji. Sprawd\u017a pozosta\u0142e propozycje lub ustaw alert na sw\u00f3j kierunek."}</p>
          <Link href="/alerty">{"Ustaw alert na wyjazd"} <ArrowRight size={16}/></Link>
        </div>
      )}
      {rows.length > 0 && sourceProblem && <p role="status">{"Cz\u0119\u015b\u0107 cen nie zosta\u0142a od\u015bwie\u017cona. Pokazujemy tylko oferty z aktualizacj\u0105 ceny nie starsz\u0105 ni\u017c 6 godzin."}</p>}

      <div className="tripownia-live-list">
        {rows.map((offer) => {
          const href = liveOfferLandingHref(offer, { source: "tripownia_live" });
          return (
            <article className="tripownia-live-row" key={offer.id} data-destination={offer.city} data-trip-kind={liveDealKind(offer)}>
              <div className="tripownia-live-time">
                <Clock3 size={15}/>
                <span title={offer.priceCheckedAt}>{"Cena ze \u017ar\u00f3d\u0142a: "}{livePriceAge(offer.priceCheckedAt, now)}</span>
              </div>
              <Link className="tripownia-live-main" href={href}>
                <strong>{offer.city} {"\u00b7"} {liveNightsLabel(offer.nights)}</strong>
                <span>{KIND_LABELS[liveDealKind(offer)]} {"\u00b7"} {offer.hotel}</span>
                <span>{offer.departure} {"\u00b7"} {offer.dates} {"\u00b7"} {offer.board}</span>
              </Link>
              <div className="tripownia-live-price">
                <small>od</small><strong>{Number(offer.price).toLocaleString("pl-PL")} {"z\u0142"}</strong><span>/ os.</span>
              </div>
              <div className="tripownia-live-actions">
                <Link className="tripownia-live-book" href={href}
                  aria-label={`Zobacz ofert\u0119: ${offer.city}, ${offer.departure}, ${offer.dates}`}
                ><Zap size={14}/> {"Zobacz ofert\u0119"}</Link>
                <Link className="tripownia-live-alert"
                  href={`/alerty?destination=${encodeURIComponent(offer.city)}&departure=${encodeURIComponent(offer.departure)}`}
                  aria-label={`Ustaw alert na wyjazd do ${offer.city}`}
                ><Bell size={15}/> Alert</Link>
              </div>
            </article>
          );
        })}
      </div>
      {rows.length > 0 && <p className="muted">{"Cena za osob\u0119 z ostatniej aktualizacji. Ostateczn\u0105 cen\u0119 i dost\u0119pno\u015b\u0107 potwierdzisz przed rezerwacj\u0105."}</p>}
    </section>
  );
}
