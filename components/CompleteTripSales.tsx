"use client";

import { BedDouble, Car, MapPinned, Smartphone, TicketCheck } from "lucide-react";
import { partners } from "@/lib/partners";
import { trackEvent } from "@/lib/analytics";

export default function CompleteTripSales({ city, country, source }: { city: string; country: string; source: string }) {
  const bookingUrl = partners.booking.buildUrl(`https://www.booking.com/searchresults.pl.html?ss=${encodeURIComponent(city + ", " + country)}`);
  const attractionsUrl = partners.getyourguide.buildUrl(`https://www.getyourguide.pl/s/?q=${encodeURIComponent(city)}`);
  const transferUrl = partners.kiwitaxi.buildUrl();
  const esimUrl = partners.fonia.buildUrl();
  const carUrl = partners.rentacar.buildUrl();

  const items = [
    { key: "hotel", icon: BedDouble, label: "Nocleg", text: `Hotele w: ${city}`, href: bookingUrl },
    { key: "attractions", icon: TicketCheck, label: "Atrakcje", text: `Bilety i wycieczki: ${city}`, href: attractionsUrl },
    { key: "transfer", icon: MapPinned, label: "Transfer", text: "Dojazd z lotniska do hotelu", href: transferUrl },
    { key: "esim", icon: Smartphone, label: "eSIM", text: "Internet na wyjazd", href: esimUrl },
    { key: "car", icon: Car, label: "Auto", text: "Wynajem auta na miejscu", href: carUrl },
  ];

  return (
    <section className="shell seo-partners-section" aria-label="Dokończ podróż">
      <div className="section-heading">
        <div>
          <div className="kicker">DOKOŃCZ PODRÓŻ</div>
          <h2>Masz wyjazd? Dobierz resztę w jednym miejscu</h2>
          <p>Nie musisz zaczynać kolejnego wyszukiwania od zera. Poniżej masz dodatki pasujące do kierunku.</p>
        </div>
      </div>
      <div className="big-partner-grid">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <a
              key={item.key}
              href={item.href}
              rel="sponsored"
              onClick={() => trackEvent("trip_addon_click", {
                addon: item.key,
                destination: city,
                country,
                source,
              })}
            >
              <Icon size={22}/>
              <strong>{item.label}</strong>
              <small>{item.text}</small>
              <b>Sprawdź →</b>
            </a>
          );
        })}
      </div>
    </section>
  );
}
