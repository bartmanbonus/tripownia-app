"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Clock3, Plane, UserRound, WalletCards } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import PrivacyDataControls from "@/components/PrivacyDataControls";
import CountryChecklist from "@/components/CountryChecklist";
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
            <p>Nie chodzi tylko o to, co lubisz. Tripownia może uwzględniać też pracę, urlop, budżet, długość wyjazdu i kraje, które już masz za sobą.</p>
          </div>
        </div>

        <form className="app-alerts-card" onSubmit={submit}>
          <label>
            <span><UserRound size={17} /> Jak mamy się do Ciebie zwracać?</span>
            <input value={profile.displayName} onChange={(e) => setProfile({ ...profile, displayName: e.target.value.slice(0, 60) })} placeholder="np. Gosia" autoComplete="given-name" />
          </label>

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
            <strong><Clock3 size={16}/> Jak najczęściej możesz wyjechać?</strong>
            <select value={profile.scheduleMode} onChange={(e) => setProfile({ ...profile, scheduleMode: e.target.value as TravelProfile["scheduleMode"] })}>
              <option value="any">Dowolnie</option>
              <option value="weekend">Głównie weekend</option>
              <option value="short_leave">Weekend + 1–2 dni urlopu</option>
              <option value="leave">Mam urlop i mogę lecieć dłużej</option>
            </select>
          </div>

          {profile.scheduleMode !== "any" && profile.scheduleMode !== "weekend" && (
            <div className="profile-field">
              <strong>Maksymalnie dni roboczych poza pracą</strong>
              <select value={profile.maxLeaveDays} onChange={(e) => setProfile({ ...profile, maxLeaveDays: Number(e.target.value) })}>
                {[1,2,3,4,5,7,10,14].map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </div>
          )}

          <div className="profile-field">
            <strong>Po co najczęściej szukasz wyjazdu?</strong>
            <select value={profile.tripIntent} onChange={(e) => setProfile({ ...profile, tripIntent: e.target.value as TravelProfile["tripIntent"] })}>
              <option value="any">Różnie / zaskocz mnie</option>
              <option value="quick">Krótki wypad, byle gdzie polecieć</option>
              <option value="rest">Dłuższy odpoczynek</option>
              <option value="capitals">Odwiedzanie stolic</option>
              <option value="new_country">Zaliczanie nowych krajów</option>
              <option value="far">Dalsze i mniej oczywiste kierunki</option>
            </select>
          </div>

          <div className="profile-field">
            <strong>Preferowana długość</strong>
            <select value={profile.durationPreference} onChange={(e) => setProfile({ ...profile, durationPreference: e.target.value as TravelProfile["durationPreference"] })}>
              <option value="any">Bez znaczenia</option>
              <option value="short">2–4 noce</option>
              <option value="week">5–8 nocy</option>
              <option value="long">9+ nocy</option>
            </select>
          </div>

          <div className="profile-field">
            <strong>Co jest ważniejsze przy kompromisie?</strong>
            <select value={profile.valuePriority} onChange={(e) => setProfile({ ...profile, valuePriority: e.target.value as TravelProfile["valuePriority"] })}>
              <option value="price">Najniższa cena</option>
              <option value="balance">Balans ceny i wygody</option>
              <option value="time">Wolę dopłacić i oszczędzić czas</option>
            </select>
          </div>

          <div className="profile-field">
            <strong>Co lubisz najbardziej?</strong>
            <div className="profile-chips">
              {styleOptions.map(([value, label]) => (
                <button key={value} type="button" className={profile.styles.includes(value) ? "profile-chip active" : "profile-chip"} onClick={() => toggleStyle(value)}>{label}</button>
              ))}
            </div>
          </div>

          <CountryChecklist
            visited={profile.visitedCountries}
            excluded={profile.excludedVisitedCountries}
            onChange={({ visited, excluded }) => setProfile((current) => ({
              ...current,
              visitedCountries: visited,
              excludedVisitedCountries: excluded,
            }))}
          />

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
          <small>Bez logowania profil zostaje na tym urządzeniu. Po zalogowaniu synchronizujemy go z Twoim kontem, żeby wracał na webie i w aplikacji.</small>
        </form>

        <PrivacyDataControls />

        <div className="app-alerts-footer-link"><Link href="/dla-ciebie">Pokaż oferty dla mnie →</Link> · <Link href="/polityka-prywatnosci">Prywatność i RODO</Link></div>
      </section>
      <SiteFooter />
    </main>
  );
}
