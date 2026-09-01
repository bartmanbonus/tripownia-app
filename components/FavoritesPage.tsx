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
    return () => window.removeEventListener("tripownia-favorites-updated", load);
  }, []);

  const favorites = useMemo(() => ids.map(id => offers.find(o => o.id === id)).filter(Boolean), [ids]);

  return <main>
    <SiteHeader />
    <section className="shell hub-page favorites-page">
      <div className="kicker">TWOJA LISTA</div>
      <h1>Ulubione</h1>
      <p className="hub-lead">Oferty zapisane na tym urządzeniu. Nie musisz zakładać konta ani się logować.</p>

      {favorites.length ? (
        <div className="cards-grid">{favorites.map(o => o ? <OfferCard key={o.id} offer={o}/> : null)}</div>
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
