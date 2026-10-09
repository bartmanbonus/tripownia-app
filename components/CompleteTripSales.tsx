"use client";

import { BedDouble, Car, MapPinned, Smartphone, TicketCheck } from "lucide-react";
import { partners } from "@/lib/partners";
import TripPiecePartnerLink from "@/components/TripPiecePartnerLink";
import { trackEvent } from "@/lib/analytics";

export default function CompleteTripSales({ city, country, source }: { city: string; country: string; source: string }) {
  const destination = [city, country].filter(Boolean).join(", ");
  const items = [
    { key: "hotel", partner: "booking", icon: BedDouble, label: "Nocleg", text: "Hotele w: " + city, url: partners.booking.buildUrl("https://www.booking.com/searchresults.pl.html?ss=" + encodeURIComponent(destination)) },
    { key: "attractions", partner: "getyourguide", icon: TicketCheck, label: "Atrakcje", text: "Bilety i wycieczki: " + city, url: partners.getyourguide.buildUrl("https://www.getyourguide.pl/s/?q=" + encodeURIComponent(city)) },
    { key: "transfer", partner: "kiwitaxi", icon: MapPinned, label: "Transfer", text: "Dojazd z lotniska do hotelu", url: partners.kiwitaxi.buildUrl() },
    { key: "esim", partner: "fonia", icon: Smartphone, label: "eSIM", text: "Internet na wyjazd", url: partners.fonia.buildUrl() },
    { key: "car", partner: "rentacar", icon: Car, label: "Auto", text: "Wynajem auta na miejscu", url: partners.rentacar.buildUrl() },
  ] as const;

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
          const linkSource = source + "_addon_" + item.key;
          const href = "/out/" + item.partner + "?" + new URLSearchParams({
            url: item.url, source: linkSource, destination,
          }).toString();
          return (
            <TripPiecePartnerLink
              key={item.key}
              href={href}
              piece={item.key}
              partner={item.partner}
              destination={destination}
              label={item.label}
              source={linkSource}
              tripKind={item.key === "hotel" ? "hotel" : "package"}
              onSelect={() => trackEvent("trip_addon_click", {
                addon: item.key, destination: city, country, source,
              })}
            >
              <Icon size={22}/>
              <strong>{item.label}</strong>
              <small>{item.text}</small>
              <b>Sprawdź →</b>
            </TripPiecePartnerLink>
          );
        })}
      </div>
    </section>
  );
}
