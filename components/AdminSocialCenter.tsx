"use client";

import { useMemo, useState } from "react";
import { Check, Copy, ExternalLink, Facebook, Link2, Sparkles } from "lucide-react";
import { offers } from "@/lib/offers";

type Tone = "short" | "sales" | "daily";

const tones: { id: Tone; label: string }[] = [
  { id: "short", label: "Krótki" },
  { id: "sales", label: "Sprzedażowy" },
  { id: "daily", label: "Okazja dnia" },
];

function slugify(value: string) {
  return value
    .toLocaleLowerCase("pl")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function AdminSocialCenter() {
  const activeOffers = useMemo(
    () => offers.filter((offer) => offer.availabilityStatus !== "expired"),
    []
  );
  const [id, setId] = useState(activeOffers[0]?.id ?? 1);
  const [tone, setTone] = useState<Tone>("sales");
  const [copied, setCopied] = useState<"text" | "link" | null>(null);

  const offer = useMemo(
    () => activeOffers.find((item) => item.id === id) ?? activeOffers[0],
    [activeOffers, id]
  );

  if (!offer) return null;

  const url = `https://tripownia.pl/oferta/${offer.id}`;
  const hashtag = slugify(offer.city);

  const texts: Record<Tone, string> = {
    short: `${offer.flag} ${offer.city} od ${offer.price} zł/os. ✈️\n${offer.nights} nocy · wylot: ${offer.departure}\n\nSprawdź szczegóły i aktualną cenę: ${url}\n\n#tripownia #podroze #${hashtag}`,
    sales: `${offer.flag} ${offer.city} — ta oferta naprawdę zwraca uwagę 👀\n\n✈️ Wylot: ${offer.departure}\n🏨 ${offer.nights} nocy · ${offer.hotel}\n🍽️ ${offer.board}\n💰 ostatnio od ${offer.price} zł/os.\n\n${offer.reason}\n\n👉 Zobacz szczegóły i sprawdź aktualną cenę: ${url}\n\n#tripownia #okazjepodroznicze #wakacje #${hashtag}`,
    daily: `🔥 OKAZJA DNIA: ${offer.city} ${offer.flag}\n\nOd ${offer.price} zł/os. za ${offer.nights} nocy z wylotem z ${offer.departure}.\n\n${offer.reason}\n\nJeśli ten kierunek jest na Twojej liście — warto sprawdzić teraz 👇\n${url}\n\n#tripownia #okazjadnia #podroze #${hashtag}`,
  };

  const text = texts[tone];
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;

  async function copy(value: string, type: "text" | "link") {
    await navigator.clipboard.writeText(value);
    setCopied(type);
    window.setTimeout(() => setCopied(null), 1500);
  }

  return (
    <div className="social-center">
      <div className="social-center-toolbar">
        <label>
          <span>Oferta do pokazania</span>
          <select value={id} onChange={(event) => setId(Number(event.target.value))}>
            {activeOffers.map((item) => (
              <option key={item.id} value={item.id}>
                {item.flag} {item.city} · {item.price} zł · {item.departure}
              </option>
            ))}
          </select>
        </label>
        <div className="social-tone-picker">
          <span>Styl posta</span>
          <div>
            {tones.map((item) => (
              <button
                type="button"
                key={item.id}
                className={tone === item.id ? "active" : ""}
                onClick={() => setTone(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="social-center-grid">
        <section className="social-preview-card">
          <div className="social-preview-head">
            <div className="social-preview-logo">T</div>
            <div>
              <strong>Tripownia.pl</strong>
              <span>Post na Facebooka · podgląd</span>
            </div>
          </div>
          <div className="social-preview-text">{text}</div>
          <img src={offer.image} alt={`${offer.city} — oferta Tripownia`} />
          <div className="social-link-preview">
            <small>TRIPOWNIA.PL</small>
            <strong>{offer.city} od {offer.price} zł/os.</strong>
            <span>{offer.dates} · {offer.nights} nocy</span>
          </div>
        </section>

        <aside className="social-publish-panel">
          <div className="social-publish-badge"><Sparkles size={16}/> GOTOWE DO PUBLIKACJI</div>
          <h2>Post pod Facebooka</h2>
          <p>Oferta, zdjęcie, cena i link są pobierane z Tripownii. Przed publikacją potwierdź aktualną cenę u partnera.</p>

          <textarea value={text} readOnly rows={13} />

          <div className="social-publish-actions">
            <button type="button" onClick={() => copy(text, "text")}>
              {copied === "text" ? <Check size={17}/> : <Copy size={17}/>} {copied === "text" ? "Skopiowano" : "Kopiuj tekst"}
            </button>
            <button type="button" onClick={() => copy(url, "link")}>
              {copied === "link" ? <Check size={17}/> : <Link2 size={17}/>} {copied === "link" ? "Skopiowano" : "Kopiuj link"}
            </button>
          </div>

          <a className="social-facebook-button" href={facebookUrl} target="_blank" rel="noreferrer">
            <Facebook size={18}/> Otwórz udostępnianie na Facebooku
          </a>
          <a className="social-offer-check" href={`/oferta/${offer.id}`} target="_blank" rel="noreferrer">
            Sprawdź ofertę przed publikacją <ExternalLink size={15}/>
          </a>

          <div className="social-publish-note">
            Facebook nie pozwala stronie zewnętrznej automatycznie wkleić pełnego tekstu do okna publikacji. Dlatego jednym kliknięciem kopiujesz gotowy tekst, a drugim otwierasz udostępnianie konkretnej oferty.
          </div>
        </aside>
      </div>
    </div>
  );
}
