"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type Offer = {
  id: string | number;
  city?: string;
  country?: string;
  price?: number;
  reason?: string;
  hotel?: string;
  board?: string;
  flag?: string;
  category?: string[];
  availabilityStatus?: string;
};

function offerUrl(offer: Offer) {
  if (typeof window === "undefined") return `/oferta/${offer.id}`;
  return `${window.location.origin}/oferta/${offer.id}`;
}

function emotionalCopy(offer: Offer) {
  const place = [offer.flag, offer.city || offer.country].filter(Boolean).join(" ");
  const price = offer.price ? ` za ${offer.price} zł/os.` : "";
  const reason = offer.reason ? ` ${offer.reason}` : "";
  return {
    facebook: `✈️ ${place}${price} — i właśnie dlatego lubimy polować na podróże. ${reason}\n\nNie odkładaj tego do „kiedyś”. Sprawdź termin, cenę i szczegóły 👇`,
    instagram: `🌍 ${place}${price}\n\nTo nie jest kolejny „może kiedyś”. To jest ten moment, kiedy zaczynasz sprawdzać urlop w kalendarzu. 😄${reason}\n\n#tripownia #podroze #traveldeals #wakacje`,
    story: `🔥 ZNALEZIONE DZIŚ\n${place}\n${offer.price ? `OD ${offer.price} ZŁ/OS.` : "SPRAWDŹ OKAZJĘ"}\n\n${offer.reason || "Taki wyjazd aż prosi się o zapisanie."}\n\n→ link do oferty`,
  };
}

export default function AdminStudio({ offers }: { offers: Offer[] }) {
  const activeOffers = useMemo(() => offers.filter(o => o.availabilityStatus !== "expired"), [offers]);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(String(activeOffers[0]?.id ?? ""));
  const [copied, setCopied] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("pl");
    if (!q) return activeOffers;
    return activeOffers.filter(o => [o.city, o.country, o.hotel, ...(o.category || [])].filter(Boolean).join(" ").toLocaleLowerCase("pl").includes(q));
  }, [activeOffers, query]);

  const selected = activeOffers.find(o => String(o.id) === selectedId) || activeOffers[0];
  const copy = selected ? emotionalCopy(selected) : null;

  async function copyText(text: string, key: string) {
    try {
      await navigator.clipboard.writeText(`${text}\n${offerUrl(selected!)}`);
      setCopied(key);
      setTimeout(() => setCopied(""), 1600);
    } catch {
      setCopied("");
    }
  }

  async function nativeShare() {
    if (!selected || !copy) return;
    const data = { title: `Tripownia — ${selected.city || selected.country || "okazja"}`, text: copy.instagram, url: offerUrl(selected) };
    if (navigator.share) await navigator.share(data);
    else await copyText(copy.instagram, "share");
  }

  if (!selected || !copy) {
    return <main><section className="shell hub-page"><h1>Panel Tripownia</h1><p>Brak aktywnych ofert do zarządzania.</p></section></main>;
  }

  const encodedUrl = encodeURIComponent(offerUrl(selected));
  const encodedText = encodeURIComponent(`${copy.facebook}\n${offerUrl(selected)}`);

  return (
    <main className="tripownia-admin-studio">
      <section className="shell hub-page">
        <div className="kicker">CENTRUM TRIPOWNI</div>
        <div className="admin-studio-title">
          <div><h1>Oferty i sociale</h1><p className="hub-lead">Jedno miejsce do kontroli okazji i przygotowania postów bez suchego, katalogowego copy.</p></div>
          <Link className="secondary-cta" href="/">← Zobacz stronę</Link>
        </div>

        <div className="admin-stats">
          <div><small>AKTYWNE OFERTY</small><strong>{activeOffers.length}</strong><span>gotowe do publikacji</span></div>
          <div><small>WYGASŁE</small><strong>{offers.length - activeOffers.length}</strong><span>nie promujemy ich</span></div>
          <div><small>SOCIALE</small><strong>4</strong><span>FB · IG · Stories · WhatsApp</span></div>
          <div><small>TRYB</small><strong>LIVE</strong><span>copy generowane z oferty</span></div>
        </div>

        <div className="admin-studio-grid">
          <aside className="admin-offer-picker">
            <label className="admin-search-field"><span>Szukaj oferty</span><input value={query} onChange={e => setQuery(e.target.value)} placeholder="np. Japonia, Malta, safari…" /></label>
            <div className="admin-offer-list">
              {filtered.map(o => <button type="button" key={String(o.id)} className={String(o.id) === String(selected.id) ? "active" : ""} onClick={() => setSelectedId(String(o.id))}>
                <span>{o.flag || "✈️"}</span><span><strong>{o.city || o.country || `Oferta ${o.id}`}</strong><small>{o.country || "Tripownia"}{o.price ? ` · ${o.price} zł/os.` : ""}</small></span><b>→</b>
              </button>)}
            </div>
          </aside>

          <section className="admin-social-workbench">
            <div className="admin-selected-offer"><small>WYBRANA OFERTA</small><h2>{selected.flag} {selected.city || selected.country}</h2><p>{selected.reason || "Dodaj emocję i konkretny powód, dla którego warto sprawdzić tę ofertę właśnie teraz."}</p><Link href={`/oferta/${selected.id}`}>Podgląd oferty →</Link></div>

            <div className="social-copy-grid">
              <article><div><span>Facebook</span><button onClick={() => copyText(copy.facebook, "facebook")}>{copied === "facebook" ? "Skopiowano ✓" : "Kopiuj"}</button></div><textarea readOnly value={copy.facebook}/><a target="_blank" rel="noopener noreferrer" href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}>Otwórz udostępnianie FB →</a></article>
              <article><div><span>Instagram</span><button onClick={() => copyText(copy.instagram, "instagram")}>{copied === "instagram" ? "Skopiowano ✓" : "Kopiuj"}</button></div><textarea readOnly value={copy.instagram}/><button className="social-native-share" onClick={nativeShare}>Udostępnij przez telefon →</button></article>
              <article><div><span>Stories / Reels</span><button onClick={() => copyText(copy.story, "story")}>{copied === "story" ? "Skopiowano ✓" : "Kopiuj"}</button></div><textarea readOnly value={copy.story}/><small>Format krótki, pionowy i z jednym mocnym komunikatem.</small></article>
              <article><div><span>WhatsApp / inne</span><button onClick={() => copyText(copy.facebook, "whatsapp")}>{copied === "whatsapp" ? "Skopiowano ✓" : "Kopiuj"}</button></div><textarea readOnly value={copy.facebook}/><a target="_blank" rel="noopener noreferrer" href={`https://wa.me/?text=${encodedText}`}>Wyślij na WhatsApp →</a></article>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
