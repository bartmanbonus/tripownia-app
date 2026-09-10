"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Check, Copy, ExternalLink, Facebook, Link2, Sparkles,
  CalendarClock, Trash2, Plus, Send, XCircle, Pencil, Instagram
} from "lucide-react";
import { offers } from "@/lib/offers";

type Tone = "short" | "sales" | "daily";
type QueueStatus = "pending" | "approved" | "published" | "skipped";
type QueueItem = {
  id: string;
  offerId: number;
  tone: Tone;
  text: string;
  url: string;
  scheduledAt: string;
  status: QueueStatus;
  createdAt: string;
  publishedAt?: string;
  publishResult?: string;
};

const tones: { id: Tone; label: string }[] = [
  { id: "short", label: "💸 Cena robi robotę" },
  { id: "sales", label: "😍 Emocjonalny" },
  { id: "daily", label: "🔥 FOMO / Lecimy?" },
];

const QUEUE_KEY = "tripownia-social-queue-v3";

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

function statusLabel(status: QueueStatus) {
  if (status === "approved") return "ZATWIERDZONE";
  if (status === "published") return "OPUBLIKOWANE";
  if (status === "skipped") return "POMINIĘTE";
  return "DO AKCEPTACJI";
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
  const [linkPlacement, setLinkPlacement] = useState<"comment" | "post">("post");
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [draftText, setDraftText] = useState("");
  const [publishingId, setPublishingId] = useState<string | null>(null);

  useEffect(() => setQueue(readQueue()), []);

  const offer = useMemo(
    () => activeOffers.find((item) => item.id === id) ?? activeOffers[0],
    [activeOffers, id]
  );

  const generatedText = useMemo(() => {
    if (!offer) return "";
    const url = `https://tripownia.pl/oferta/${offer.id}`;
    const hashtag = slugify(offer.city);
    const baseTexts: Record<Tone, string> = {
      short: `${offer.flag} ${offer.city} za ${offer.price} zł/os.? 👀\n\n✈️ Wylot: ${offer.departure}\n🏨 ${offer.nights} nocy · ${offer.hotel}\n🍽️ ${offer.board}\n\n${offer.reason}\n\nSprawdź, zanim cena zrobi swoje ✈️\n\n#tripownia #podroze #${hashtag}`,
      sales: `Piątek: praca. Chwilę później: ${offer.city}. Brzmi lepiej? ${offer.flag}\n\n✈️ Wylot: ${offer.departure}\n🏨 ${offer.nights} nocy · ${offer.hotel}\n🍽️ ${offer.board}\n💰 ostatnio od ${offer.price} zł/os.\n\n${offer.reason}\n\nTo nie jest „kolejna oferta”. To jest dobry pretekst, żeby naprawdę gdzieś polecieć. 😏\n\n#tripownia #okazjepodroznicze #wakacje #${hashtag}`,
      daily: `🔥 SERIO, ZA TYLE MOŻNA LECIEĆ DO ${offer.city.toLocaleUpperCase("pl")}?\n\nOd ${offer.price} zł/os. za ${offer.nights} nocy z wylotem z ${offer.departure}.\n\n${offer.reason}\n\nJeśli ten kierunek chodzi Ci po głowie, to jest moment, żeby sprawdzić cenę.\n\n#tripownia #okazjadnia #podroze #${hashtag}`,
    };
    return linkPlacement === "post"
      ? `${baseTexts[tone]}\n\n👉 Sprawdź aktualną cenę: ${url}`
      : `${baseTexts[tone]}\n\n👇 Link do oferty w pierwszym komentarzu`;
  }, [offer, tone, linkPlacement]);

  useEffect(() => setDraftText(generatedText), [generatedText]);

  if (!offer) return null;

  const url = `https://tripownia.pl/oferta/${offer.id}`;

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
      text: draftText,
      url,
      scheduledAt,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    saveQueue([item, ...queue].slice(0, 50));
  }

  function updateStatus(queueId: string, status: QueueStatus) {
    saveQueue(queue.map(item => item.id === queueId ? { ...item, status } : item));
  }

  function updateText(queueId: string, text: string) {
    saveQueue(queue.map(item => item.id === queueId ? { ...item, text, status: item.status === "published" ? "published" : "pending" } : item));
  }

  function removeFromQueue(queueId: string) {
    saveQueue(queue.filter(item => item.id !== queueId));
  }

  async function publish(queueItem: QueueItem) {
    if (queueItem.status !== "approved") return;
    setPublishingId(queueItem.id);
    try {
      const response = await fetch("/admin/api/social-publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          offerId: queueItem.offerId,
          text: queueItem.text,
          approved: true,
          channels: ["facebook", "instagram"],
        }),
      });
      const result = await response.json();
      if (!response.ok || !result.ok) {
        throw new Error(result.error || "Publikacja nie powiodła się.");
      }
      saveQueue(queue.map(item => item.id === queueItem.id ? {
        ...item,
        status: "published",
        publishedAt: new Date().toISOString(),
        publishResult: JSON.stringify(result.results || []),
      } : item));
    } catch (error) {
      alert(error instanceof Error ? error.message : String(error));
    } finally {
      setPublishingId(null);
    }
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
              <button type="button" key={item.id} className={tone === item.id ? "active" : ""} onClick={() => setTone(item.id)}>
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="social-tone-picker">
          <span>Link do oferty</span>
          <div>
            <button type="button" className={linkPlacement === "comment" ? "active" : ""} onClick={() => setLinkPlacement("comment")}>💬 W komentarzu</button>
            <button type="button" className={linkPlacement === "post" ? "active" : ""} onClick={() => setLinkPlacement("post")}>🔗 W treści</button>
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
            <div><strong>Tripownia.pl</strong><span>Podgląd przed akceptacją</span></div>
          </div>
          <div className="social-preview-text">{draftText}</div>
          <img src={offer.image} alt={`${offer.city} — oferta Tripownia`} />
          <div className="social-link-preview">
            <small>TRIPOWNIA.PL</small>
            <strong>{offer.city} od {offer.price} zł/os.</strong>
            <span>{offer.dates} · {offer.nights} nocy</span>
          </div>
        </section>

        <aside className="social-publish-panel">
          <div className="social-publish-badge"><Sparkles size={16}/> WERSJA ROBOCZA</div>
          <h2>Najpierw zobacz, potem zatwierdź</h2>
          <p>Możesz poprawić tekst przed dodaniem do kolejki. Nic nie zostanie opublikowane bez osobnego zatwierdzenia.</p>
          <textarea value={draftText} onChange={e => setDraftText(e.target.value)} rows={13} />
          <div className="social-publish-actions">
            <button type="button" onClick={() => copy(draftText, "text")}>
              {copied === "text" ? <Check size={17}/> : <Copy size={17}/>} {copied === "text" ? "Skopiowano" : "Kopiuj tekst"}
            </button>
            <button type="button" onClick={() => copy(url, "link")}>
              {copied === "link" ? <Check size={17}/> : <Link2 size={17}/>} {copied === "link" ? "Skopiowano" : "Kopiuj link"}
            </button>
            <button type="button" onClick={addToQueue}><Plus size={17}/> Dodaj do akceptacji</button>
          </div>
          <a className="social-offer-check" href={`/oferta/${offer.id}`} target="_blank" rel="noreferrer">Sprawdź ofertę przed publikacją <ExternalLink size={15}/></a>
        </aside>
      </div>

      <section className="social-queue">
        <div className="admin-panel-head">
          <div>
            <h2>Planner treści</h2>
            <p>Każdy post trafia najpierw do akceptacji. Dopiero status „Zatwierdzone” odblokowuje przycisk publikacji na Facebooku i Instagramie.</p>
          </div>
          <span className="social-queue-count"><CalendarClock size={16}/> {queue.length} postów</span>
        </div>

        {!queue.length ? (
          <div className="social-queue-empty">Nie ma jeszcze żadnych postów do akceptacji.</div>
        ) : (
          <div className="social-queue-list">
            {queue.map(item => {
              const qOffer = activeOffers.find(o => o.id === item.offerId);
              return (
                <article key={item.id} style={{alignItems:"stretch",gap:12}}>
                  <div style={{flex:1,minWidth:0}}>
                    <small>{item.scheduledAt ? new Date(item.scheduledAt).toLocaleString("pl-PL") : "bez terminu"}</small>
                    <strong>{qOffer ? `${qOffer.flag} ${qOffer.city}` : `Oferta #${item.offerId}`}</strong>
                    <span>{statusLabel(item.status)}</span>
                    <textarea
                      value={item.text}
                      disabled={item.status === "published" || item.status === "skipped"}
                      onChange={e => updateText(item.id, e.target.value)}
                      rows={7}
                      style={{width:"100%",marginTop:10}}
                    />
                    <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:10}}>
                      {item.status === "pending" && <>
                        <button type="button" onClick={() => updateStatus(item.id, "approved")}><Check size={16}/> Zatwierdź</button>
                        <button type="button" onClick={() => updateStatus(item.id, "skipped")}><XCircle size={16}/> Pomiń</button>
                      </>}
                      {item.status === "approved" && <>
                        <button type="button" onClick={() => updateStatus(item.id, "pending")}><Pencil size={16}/> Cofnij do poprawy</button>
                        <button type="button" onClick={() => publish(item)} disabled={publishingId === item.id}><Send size={16}/> {publishingId === item.id ? "Publikuję…" : "Publikuj FB + IG"}</button>
                      </>}
                      {item.status === "published" && <span><Facebook size={15}/> <Instagram size={15}/> Opublikowano {item.publishedAt ? new Date(item.publishedAt).toLocaleString("pl-PL") : ""}</span>}
                    </div>
                  </div>
                  <button type="button" onClick={() => removeFromQueue(item.id)} aria-label="Usuń z plannera"><Trash2 size={16}/></button>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
