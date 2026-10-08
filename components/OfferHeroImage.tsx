import TravelImage from "@/components/TravelImage";

export default function OfferHeroImage({ city, country, src }: { city: string; country: string; src?: string }) {
  return <div className="detail-image offer-hero-image">
    <TravelImage city={city} country={country} overrideSrc={src} alt={`${city}, ${country} — ilustracja oferty`} className="detail-photo-img" priority />
    <div className="offer-image-label"><strong>{city}</strong><span>{src ? "Zdjęcie oferty lub kierunku. Zdjęcia hotelu sprawdzisz u partnera." : "Zdjęcie kierunku — nie przedstawia konkretnego hotelu."}</span></div>
  </div>;
}
