"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Heart, ArrowLeft } from "lucide-react";
import OfferCard from "@/components/OfferCard";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { offers } from "@/lib/offers";

export default function FavoritesPage() {
  const [ids, setIds] = useState<number[]>([]);

  useEffect(() => {
    const load = () => {
      try {
        setIds(JSON.parse(localStorage.getItem("tripownia-favorites") || "[]") as number[]);
      } catch {
        setIds([]);
      }
    };
    load();
    window.addEventListener("tripownia-favorites-updated", load);
    window.addEventListener("storage", load);
    return () => {
      window.removeEventListener("tripownia-favorites-updated", load);
      window.removeEventListener("storage", load);
    };
  }, []);

  const favorites = useMemo(() => ids.map(id => offers.find(o => o.id === id)).filter(Boolean), [ids]);
  const activeFavorites = favorites.filter(o => o?.availabilityStatus !== "expired");
  const expiredFavorites = favorites.filter(o => o?.availabilityStatus === "expired");
  const favoriteIds = new Set(favorites.map(o => o?.id).filter(Boolean));
  const alternatives = offers
    .filter(o => o.availabilityStatus !== "expired" && !favoriteIds.has(o.id))
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);

  return <main>
    <SiteHeader />
    <section className="shell hub-page favorites-page">
      <div className="kicker">TWOJA LISTA</div>
      <h1>Ulubione</h1>
      <p className="hub-lead">Oferty zapisane na tym urządzeniu. Nie musisz zakładać konta ani się logować.</p>

      {favorites.length ? (
        <>
          {activeFavorites.length > 0 && <>
            <div className="section-heading"><div><div className="kicker">AKTUALNE</div><h2>Zapisane oferty</h2></div></div>
            <div className="cards-grid">{activeFavorites.map(o => o ? <OfferCard key={o.id} offer={o}/> : null)}</div>
          </>}
          {expiredFavorites.length > 0 && <>
            <div className="section-heading favorites-expired-heading"><div><div className="kicker">WYGASŁE</div><h2>Zapisane wcześniej</h2><p>Nie usuwamy ich automatycznie — możesz wrócić do oferty i zobaczyć podobne aktualne propozycje.</p></div></div>
            <div className="cards-grid">{expiredFavorites.map(o => o ? <OfferCard key={o.id} offer={o}/> : null)}</div>
          </>}
          {expiredFavorites.length > 0 && alternatives.length > 0 && <>
            <div className="section-heading favorites-alternatives"><div><div className="kicker">ZAMIAST WYGASŁYCH</div><h2>Aktualne propozycje</h2></div></div>
            <div className="cards-grid">{alternatives.map(o => <OfferCard key={o.id} offer={o}/>)}</div>
          </>}
        </>
      ) : (
        <div className="favorites-empty">
          <Heart size={34}/>
          <h2>Nie masz jeszcze zapisanych ofert</h2>
          <p>Kliknij serduszko przy interesującej propozycji, a znajdziesz ją tutaj przy kolejnej wizycie na tym urządzeniu.</p>
          <Link className="primary-cta" href="/okazje"><ArrowLeft size={17}/> Zobacz aktualne okazje</Link>
        </div>
      )}
    </section>
    <SiteFooter />
  </main>;
}
