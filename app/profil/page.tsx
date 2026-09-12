"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Plane, UserRound, WalletCards } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { DEFAULT_TRAVEL_PROFILE, readTravelProfile, saveTravelProfile, type TravelProfile } from "@/lib/travelProfile";

const styleOptions = [
  ["city", "City break"],
  ["plaza", "Plaża"],
  ["cieplo", "Ciepło"],
  ["tanio", "Najlepsza cena"],
  ["weekend", "Krótki wypad"],
  ["allinclusive", "All Inclusive"],
] as const;

export default function ProfilePage() {
  const [profile, setProfile] = useState<TravelProfile>(DEFAULT_TRAVEL_PROFILE);
  const [saved, setSaved] = useState(false);

  useEffect(() => setProfile(readTravelProfile()), []);

  function toggleStyle(style: string) {
    setProfile((current) => ({
      ...current,
      styles: current.styles.includes(style) ? current.styles.filter((item) => item !== style) : [...current.styles, style],
    }));
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    saveTravelProfile(profile);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2200);
  }

  return (
    <main>
      <SiteHeader />
      <section className="shell app-alerts-page">
        <div className="app-alerts-hero">
          <div className="app-alerts-icon"><UserRound size={28} /></div>
          <div>
            <div className="kicker">TWOJA TRIPOWNIA</div>
            <h1>Profil podróżnika</h1>
            <p>Ustaw raz, a Tripownia będzie lepiej wybierać oferty, alerty i inspiracje pod Ciebie.</p>
          </div>
        </div>

        <form className="app-alerts-card" onSubmit={submit}>
          <label>
            <span><Plane size={17} /> Najczęściej wylatuję z</span>
            <input value={profile.departure} onChange={(e) => setProfile({ ...profile, departure: e.target.value })} placeholder="np. Warszawa" />
          </label>

          <label>
            <span><WalletCards size={17} /> Typowy budżet za osobę</span>
            <div className="app-alerts-price-row">
              <input inputMode="numeric" value={String(profile.budget)} onChange={(e) => setProfile({ ...profile, budget: Number(e.target.value.replace(/\D/g, "") || 0) })} />
              <strong>zł</strong>
            </div>
          </label>

          <div className="profile-field">
            <strong>Co lubisz najbardziej?</strong>
            <div className="profile-chips">
              {styleOptions.map(([value, label]) => (
                <button key={value} type="button" className={profile.styles.includes(value) ? "profile-chip active" : "profile-chip"} onClick={() => toggleStyle(value)}>{label}</button>
              ))}
            </div>
          </div>

          <div className="profile-field">
            <strong>Z kim najczęściej podróżujesz?</strong>
            <select value={profile.companion} onChange={(e) => setProfile({ ...profile, companion: e.target.value as TravelProfile["companion"] })}>
              <option value="solo">Solo</option>
              <option value="couple">We dwoje</option>
              <option value="family">Z rodziną</option>
              <option value="friends">Ze znajomymi</option>
            </select>
          </div>

          <div className="profile-field">
            <strong>Standard</strong>
            <select value={profile.standard} onChange={(e) => setProfile({ ...profile, standard: e.target.value as TravelProfile["standard"] })}>
              <option value="budget">Budżetowo</option>
              <option value="comfort">Komfort</option>
              <option value="premium">Premium</option>
            </select>
          </div>

          <label className="profile-checkbox"><input type="checkbox" checked={profile.avoidTransfers} onChange={(e) => setProfile({ ...profile, avoidTransfers: e.target.checked })} /> Wolę podróże bez przesiadek</label>
          <label className="profile-checkbox"><input type="checkbox" checked={profile.warmOnly} onChange={(e) => setProfile({ ...profile, warmOnly: e.target.checked })} /> Najczęściej szukam ciepła</label>

          <button className="primary-cta app-alerts-save" type="submit">{saved ? <><CheckCircle2 size={18} /> Zapisano</> : "Zapisz mój profil"}</button>
          <small>Profil zapisujemy na tym urządzeniu. Możesz go zmienić w dowolnym momencie.</small>
        </form>

        <div className="app-alerts-footer-link"><Link href="/dla-ciebie">Pokaż oferty dla mnie →</Link></div>
      </section>
      <SiteFooter />
    </main>
  );
}
