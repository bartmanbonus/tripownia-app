"use client";

import Link from "next/link";
import { ArrowRight, BedDouble, Car, CheckCircle2, FileCheck2, MapPinned, NotebookPen, Plane, ShieldCheck, Sparkles, Ticket, WalletCards, Wifi } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export default function PlannerPublicPreview() {
  return (
    <main>
      <SiteHeader />
      <section className="shell my-trip-page">
        <div className="my-trip-hero">
          <div className="my-trip-icon"><MapPinned size={30}/></div>
          <div>
            <div className="kicker">ZOBACZ, CO POTRAFI TRIPOWNIA</div>
            <h1>Cała podróż w jednym prywatnym planie.</h1>
            <p>To tylko przykład działania planera — nie jest przypisany do żadnej osoby. Po zalogowaniu Twój prawdziwy plan, rezerwacje, checklista i notatki są zapisane na Twoim koncie.</p>
          </div>
        </div>

        <section className="trip-readiness">
          <div className="trip-readiness-main">
            <div className="trip-readiness-score"><strong>Demo</strong><span>przykład</span></div>
            <div className="trip-readiness-copy">
              <small>PRZYKŁADOWY WYJAZD</small>
              <h2>Rzym · 4 dni</h2>
              <p>Zobacz, jak Tripownia zbiera wszystko, czego potrzebujesz przed i podczas podróży.</p>
            </div>
          </div>
        </section>

        <section className="trip-essentials">
          <div className="trip-essentials-head">
            <div><small>JEDEN PLAN, NIE 10 ZAKŁADEK</small><h2>Możesz dodać rzeczy kupione gdziekolwiek indziej.</h2></div>
            <span>Plan zapisuje się na Twoim koncie</span>
          </div>
          <div className="trip-essentials-grid">
            <div><Plane size={20}/><span><strong>Lot</strong><small>numer rejsu i godzina</small></span></div>
            <div><BedDouble size={20}/><span><strong>Nocleg</strong><small>hotel, adres, rezerwacja</small></span></div>
            <div><FileCheck2 size={20}/><span><strong>Dokumenty</strong><small>wymagania i checklista</small></span></div>
            <div><Car size={20}/><span><strong>Transfer</strong><small>lotnisko → hotel</small></span></div>
            <div><Ticket size={20}/><span><strong>Atrakcje</strong><small>bilety i pomysły</small></span></div>
            <div><Wifi size={20}/><span><strong>Internet / eSIM</strong><small>przygotowanie na miejscu</small></span></div>
          </div>
        </section>

        <div className="my-trip-grid">
          <section className="my-trip-card">
            <div className="my-trip-card-head"><CheckCircle2 size={20}/><h2>Checklista przed wyjazdem</h2></div>
            <p>Dokumenty, odprawa, ubezpieczenie, bagaż, transfer, internet i najważniejsze rezerwacje — wszystko do odhaczenia.</p>
          </section>
          <section className="my-trip-card">
            <div className="my-trip-card-head"><MapPinned size={20}/><h2>Plan dnia</h2></div>
            <p>Zapisz restauracje, atrakcje i godziny. Plan masz pod ręką w telefonie podczas podróży.</p>
          </section>
          <section className="my-trip-card">
            <div className="my-trip-card-head"><WalletCards size={20}/><h2>Budżet i wydatki</h2></div>
            <p>Zbieraj koszty wyjazdu w jednym miejscu, również jeśli lot lub hotel były kupione poza Tripownią.</p>
          </section>
          <section className="my-trip-card">
            <div className="my-trip-card-head"><NotebookPen size={20}/><h2>Notatki i rezerwacje</h2></div>
            <p>Adresy, numery rezerwacji i rzeczy do zapamiętania pozostają w Twoim prywatnym planie.</p>
          </section>
        </div>

        <section className="guides-checklist">
          <div>
            <div className="kicker">TWOJA PODRÓŻ = TWOJE KONTO</div>
            <h2>Nie musisz kupować wyjazdu przez Tripownię.</h2>
            <p>Masz lot z linii lotniczej, hotel z innej strony albo gotową wycieczkę? Dodaj ją ręcznie. Tripownia ma być miejscem, w którym zbierasz całą podróż niezależnie od miejsca zakupu.</p>
          </div>
          <div className="guides-checklist-actions">
            <Link className="primary-cta" href="/konto">Zaloguj się i stwórz swój plan <ArrowRight size={17}/></Link>
            <Link href="/#wyszukiwarka">Najpierw znajdź wyjazd</Link>
          </div>
        </section>

        <div className="favorites-empty">
          <Sparkles size={28}/>
          <h2>Po zalogowaniu demo znika.</h2>
          <p>Zobaczysz wyłącznie własne podróże zapisane na Twoim koncie.</p>
          <Link className="primary-cta" href="/konto"><ShieldCheck size={17}/> Przejdź do konta</Link>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
