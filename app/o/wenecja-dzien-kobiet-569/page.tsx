import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Wenecja na Dzień Kobiet za 569 zł/os. | Tripownia",
  description: "Wenecja / Mestre 7–12 marca 2027: 5 nocy, wylot z Warszawy Chopina, Club Hotel 3★. Cena z przesłanej oferty: 569 zł/os.",
  alternates: { canonical: "/o/wenecja-dzien-kobiet-569" },
};

const partnerUrl = "https://www2.esky.pl/lot+hotel/portfolio/details/select-room?rooms%5B0%5D%5Badults%5D=2&datesTab=flexDates&departureDate=2027-02-01&returnDate=2027-04-30&stayLength=5:7&context=pl-packages&checkInDate=2027-03-07&checkOutDate=2027-03-12&departureCode=WAW&destinationDepartureDate=2027-03-07&metaCode=122723&returnArrivalDate=2027-03-12&sort%5BTotalPrice%5D=asc&partner_id=TRIPOWNIAPLPACKAGES&portfolioToken=d0815f8c-ebcc-4532-a5d7-6b5bc66fcf05&packageId=MjcwMzA3OjU6cGw6MTIyNzIz&flightOptionId=V0FXVkNFMjcwMzA3MjIzLjE3M3x8VzQxMzQ1OjA6MCxWQ0VXQVcyNzAzMTIyMjNJLjE3M3x8VzQxMzQ2OjA6MQ&arrivalCode=VCE&pricePresentation=perpax";

export default function VeniceWomenDayOfferPage() {
  const facts = [
    ["📅", "7–12 marca 2027", "5 nocy"],
    ["✈️", "Warszawa Chopina", "wylot WAW"],
    ["🏨", "Club Hotel 3★", "Mestre"],
    ["🍴", "Bez wyżywienia", "2 osoby · 1 pokój"],
  ];

  return (
    <main>
      <SiteHeader />
      <section style={{ maxWidth: 980, margin: "32px auto 64px", padding: "0 20px" }}>
        <div style={{ borderRadius: 28, overflow: "hidden", background: "#fffaf4", border: "1px solid #eee6dc", boxShadow: "0 20px 60px rgba(17,24,39,.08)" }}>
          <div style={{ padding: "32px 28px 28px" }}>
            <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: 2.2, color: "#ff6f1a" }}>
              CITY BREAK · DZIEŃ KOBIET
            </div>
            <h1 style={{ fontSize: "clamp(46px,9vw,82px)", lineHeight: .95, margin: "12px 0 14px", color: "#0d2747" }}>
              Wenecja
            </h1>
            <p style={{ fontSize: 20, color: "#485467", margin: "0 0 18px" }}>
              7–12 marca 2027 · 5 nocy · wylot z Warszawy
            </p>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "baseline", marginBottom: 8 }}>
              <strong style={{ fontSize: "clamp(46px,8vw,72px)", color: "#ff6f1a", lineHeight: 1 }}>
                569 zł
              </strong>
              <span style={{ fontSize: 22, fontWeight: 800, color: "#0d2747" }}>/ os.</span>
            </div>
            <p style={{ color: "#596579", marginTop: 0 }}>
              Niska zaliczka od <strong>114 zł/os.</strong> · cena z przesłanej oferty dla 2 dorosłych.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 12, margin: "26px 0" }}>
              {facts.map(([icon, title, sub]) => (
                <div key={title} style={{ background: "#fff", border: "1px solid #eee6dc", borderRadius: 18, padding: 16 }}>
                  <div style={{ fontSize: 24 }}>{icon}</div>
                  <strong style={{ display: "block", marginTop: 8, color: "#0d2747" }}>{title}</strong>
                  <span style={{ color: "#6b7280", fontSize: 14 }}>{sub}</span>
                </div>
              ))}
            </div>

            <div style={{ background: "#fff", borderRadius: 20, padding: "18px 18px 16px", marginBottom: 24, border: "1px solid #eee6dc" }}>
              <strong style={{ color: "#0d2747", fontSize: 18 }}>Pomysł na Dzień Kobiet</strong>
              <p style={{ color: "#596579", marginBottom: 0, lineHeight: 1.6 }}>
                Wylot 7 marca, więc 8 marca jesteś już pod Wenecją. To dobra baza na spacery po Wenecji,
                kawę nad kanałem, wieczorne cicchetti i kilka dni poza codziennością.
              </p>
            </div>

            <a
              href={partnerUrl}
              rel="sponsored nofollow"
              style={{ display: "inline-block", padding: "16px 26px", borderRadius: 999, background: "#ff6f1a", color: "#fff", fontWeight: 800, textDecoration: "none", fontSize: 18 }}
            >
              Sprawdź wycieczkę →
            </a>
            <p style={{ fontSize: 13, color: "#6b7280", marginTop: 14 }}>
              Cena i dostępność są dynamiczne. Rezerwacja i płatność odbywają się w serwisie rezerwacyjnym.
            </p>
          </div>
        </div>

        <div style={{ marginTop: 18 }}>
          <Link href="/">← Wróć do Tripowni</Link>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
