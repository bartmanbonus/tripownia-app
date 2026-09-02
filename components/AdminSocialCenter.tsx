"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Check, Copy, ExternalLink, Facebook, Link2, Sparkles,
  Linkedin, MessageCircle, CalendarClock, Trash2, Plus, Send
} from "lucide-react";
import { offers } from "@/lib/offers";

type Tone = "short" | "sales" | "daily";
type QueueItem = {
  id: string;
  offerId: number;
  tone: Tone;
  text: string;
  url: string;
  scheduledAt: string;
  status: "draft" | "ready";
  createdAt: string;
};

const tones: { id: Tone; label: string }[] = [
  { id: "short", label: "💸 Cena robi robotę" },
  { id: "sales", label: "😍 Emocjonalny" },
  { id: "daily", label: "🔥 FOMO / Lecimy?" },
];

const QUEUE_KEY = "tripownia-social-queue-v2";

function slugify(value: string) {
  return value
    .toLocaleLowerCase("pl")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function readQueue(): QueueItem[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function AdminSocialCenter() {
  const activeOffers = useMemo(
    () => offers.filter((offer) => offer.availabilityStatus !== "expired"),
    []
  );
  const [id, setId] = useState(activeOffers[0]?.id ?? 1);
  const [tone, setTone] = useState<Tone>("sales");
  const [copied, setCopied] = useState<"text" | "link" | null>(null);
  const [scheduledAt, setScheduledAt] = useState("");
  const [linkPlacement, setLinkPlacement] = useState<"comment" | "post">("comment");
  const [queue, setQueue] = useState<QueueItem[]>([]);

  useEffect(() => setQueue(readQueue()), []);

  const offer = useMemo(
    () => activeOffers.find((item) => item.id === id) ?? activeOffers[0],
    [activeOffers, id]
  );

  if (!offer) return null;

  const url = `https://tripownia.pl/oferta/${offer.id}`;
  const hashtag = slugify(offer.city);

  const baseTexts: Record<Tone, string> = {
    short: `${offer.flag} ${offer.city} za ${offer.price} zł/os.? 👀

To jest ten moment, kiedy zaczynasz liczyć dni do wyjazdu.

✈️ Wylot: ${offer.departure}
🏨 ${offer.nights} nocy · ${offer.hotel}
🍽️ ${offer.board}

${offer.reason}

Sprawdź, zanim cena zrobi swoje ✈️

#tripownia #podroze #${hashtag}`,
    sales: `Piątek: praca. Chwilę później: ${offer.city}. Brzmi lepiej? ${offer.flag}

✈️ Wylot: ${offer.departure}
🏨 ${offer.nights} nocy · ${offer.hotel}
🍽️ ${offer.board}
💰 ostatnio od ${offer.price} zł/os.

${offer.reason}

To nie jest „kolejna oferta”.
To jest dobry pretekst, żeby naprawdę gdzieś polecieć. 😏

#tripownia #okazjepodroznicze #wakacje #${hashtag}`,
    daily: `🔥 SERIO, ZA TYLE MOŻNA LECIEĆ DO ${offer.city.toLocaleUpperCase("pl")}?

Od ${offer.price} zł/os. za ${offer.nights} nocy z wylotem z ${offer.departure}.

${offer.reason}

Taniej może być.
Drożej — bardzo możliwe. 👀

Jeśli ten kierunek chodzi Ci po głowie, to jest moment, żeby sprawdzić cenę.

#tripownia #okazjadnia #podroze #${hashtag}`,
  };

  const text = linkPlacement === "post"
    ? `${baseTexts[tone]}\n\n👉 Sprawdź aktualną cenę: ${url}`
    : `${baseTexts[tone]}\n\n👇 Link do oferty w pierwszym komentarzu`;

  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
  const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
  const xUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(`${offer.city} od ${offer.price} zł/os. — Tripownia.pl`)}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`;

  async function copy(value: string, type: "text" | "link") {
    await navigator.clipboard.writeText(value);
    setCopied(type);
    window.setTimeout(() => setCopied(null), 1500);
  }

  function saveQueue(next: QueueItem[]) {
    setQueue(next);
    localStorage.setItem(QUEUE_KEY, JSON.stringify(next));
  }

  function addToQueue() {
    const item: QueueItem = {
      id: `${Date.now()}-${offer.id}`,
      offerId: offer.id,
      tone,
      text,
      url,
      scheduledAt,
      status: scheduledAt ? "ready" : "draft",
      createdAt: new Date().toISOString(),
    };
    saveQueue([item, ...queue].slice(0, 50));
  }

  function removeFromQueue(queueId: string) {
    saveQueue(queue.filter(item => item.id !== queueId));
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

        <div className="social-tone-picker">
          <span>Link do oferty</span>
          <div>
            <button
              type="button"
              className={linkPlacement === "comment" ? "active" : ""}
              onClick={() => setLinkPlacement("comment")}
            >
              💬 W komentarzu
            </button>
            <button
              type="button"
              className={linkPlacement === "post" ? "active" : ""}
              onClick={() => setLinkPlacement("post")}
            >
              🔗 W treści
            </button>
          </div>
        </div>

        <label>
          <span>Planowana publikacja</span>
          <input type="datetime-local" value={scheduledAt} onChange={e => setScheduledAt(e.target.value)} />
        </label>
      </div>

      <div className="social-center-grid">
        <section className="social-preview-card">
          <div className="social-preview-head">
            <div className="social-preview-logo">T</div>
            <div>
              <strong>Tripownia.pl</strong>
              <span>Post social · podgląd</span>
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
          <h2>Post z aktualnej oferty</h2>
          <p>Treść, zdjęcie, cena i link są pobierane z Tripownii. Przed publikacją potwierdź cenę u partnera.</p>

          <textarea value={text} readOnly rows={13} />

          <div className="social-publish-actions">
            <button type="button" onClick={() => copy(text, "text")}>
              {copied === "text" ? <Check size={17}/> : <Copy size={17}/>} {copied === "text" ? "Skopiowano" : "Kopiuj tekst"}
            </button>
            <button type="button" onClick={() => copy(url, "link")}>
              {copied === "link" ? <Check size={17}/> : <Link2 size={17}/>} {copied === "link" ? "Skopiowano" : (linkPlacement === "comment" ? "Kopiuj link do komentarza" : "Kopiuj link")}
            </button>
            <button type="button" onClick={addToQueue}>
              <Plus size={17}/> Dodaj do kolejki
            </button>
          </div>

          <div className="social-channel-grid">
            <a href={facebookUrl} target="_blank" rel="noreferrer"><Facebook size={18}/> Facebook</a>
            <a href={linkedInUrl} target="_blank" rel="noreferrer"><Linkedin size={18}/> LinkedIn</a>
            <a href={xUrl} target="_blank" rel="noreferrer"><Send size={18}/> X</a>
            <a href={whatsappUrl} target="_blank" rel="noreferrer"><MessageCircle size={18}/> WhatsApp</a>
          </div>

          <a className="social-offer-check" href={`/oferta/${offer.id}`} target="_blank" rel="noreferrer">
            Sprawdź ofertę przed publikacją <ExternalLink size={15}/>
          </a>

          <div className="social-publish-note">
            Facebook i Instagram nie pozwalają zwykłej stronie internetowej automatycznie publikować pełnych postów na profilu. Ta wersja przygotowuje treść, kolejkę i linki do publikacji. Pełna automatyzacja wymaga Meta Graph API i uprawnień strony.
          </div>
        </aside>
      </div>

      <section className="social-queue">
        <div className="admin-panel-head">
          <div>
            <h2>Kolejka postów</h2>
            <p>Plan roboczy zapisuje się lokalnie w tej przeglądarce. Po podpięciu API tę samą kolejkę możemy wykorzystać do automatycznej publikacji.</p>
          </div>
          <span className="social-queue-count"><CalendarClock size={16}/> {queue.length} w kolejce</span>
        </div>

        {!queue.length ? (
          <div className="social-queue-empty">Nie ma jeszcze żadnych postów w kolejce.</div>
        ) : (
          <div className="social-queue-list">
            {queue.map(item => {
              const qOffer = activeOffers.find(o => o.id === item.offerId);
              return (
                <article key={item.id}>
                  <div>
                    <small>{item.scheduledAt ? new Date(item.scheduledAt).toLocaleString("pl-PL") : "bez terminu"}</small>
                    <strong>{qOffer ? `${qOffer.flag} ${qOffer.city}` : `Oferta #${item.offerId}`}</strong>
                    <span>{item.tone === "daily" ? "Okazja dnia" : item.tone === "sales" ? "Sprzedażowy" : "Krótki"}</span>
                  </div>
                  <button type="button" onClick={() => removeFromQueue(item.id)} aria-label="Usuń z kolejki">
                    <Trash2 size={16}/>
                  </button>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
