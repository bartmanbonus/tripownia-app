"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Check, ChevronLeft, ChevronRight, Copy, ExternalLink, Facebook, Instagram,
  Link2, Pencil, Plus, Send, Sparkles, Trash2, XCircle, CalendarClock
} from "lucide-react";
import { offers } from "@/lib/offers";
import { getSocialDailyPlan, type SocialTone } from "@/lib/social-selection";
import styles from "./AdminSocialCenter.module.css";

type Tone = SocialTone;
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

const QUEUE_KEY = "tripownia-social-queue-v4";
const WEEKDAYS = ["Pon", "Wt", "Śr", "Czw", "Pt", "Sob", "Nd"];

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

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function dateKey(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function dateFromKey(key: string) {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day, 12, 0, 0, 0);
}

function scheduleDateAt(key: string, time: string) {
  return `${key}T${time}`;
}

function formatSelectedDate(key: string) {
  return new Intl.DateTimeFormat("pl-PL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(dateFromKey(key));
}

function buildCalendarDays(cursor: Date) {
  const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1, 12);
  const mondayOffset = (first.getDay() + 6) % 7;
  const start = new Date(first);
  start.setDate(first.getDate() - mondayOffset);
  return Array.from({ length: 42 }, (_, index) => {
    const day = new Date(start);
    day.setDate(start.getDate() + index);
    return day;
  });
}

export default function AdminSocialCenter() {
  const activeOffers = useMemo(
    () => offers.filter((offer) => offer.availabilityStatus !== "expired"),
    []
  );

  const todayKey = useMemo(() => dateKey(new Date()), []);
  const [selectedDate, setSelectedDate] = useState(todayKey);
  const [monthCursor, setMonthCursor] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1, 12);
  });
  const selectedDateObject = useMemo(() => dateFromKey(selectedDate), [selectedDate]);
  const dailyPlan = useMemo(
    () => getSocialDailyPlan(activeOffers, selectedDateObject),
    [activeOffers, selectedDateObject]
  );
  const firstPlanned = dailyPlan.items[0];

  const [id, setId] = useState(firstPlanned?.offer.id ?? activeOffers[0]?.id ?? 1);
  const [tone, setTone] = useState<Tone>(firstPlanned?.tone ?? "sales");
  const [copied, setCopied] = useState<"text" | "link" | null>(null);
  const [scheduledAt, setScheduledAt] = useState(firstPlanned ? scheduleDateAt(selectedDate, firstPlanned.time) : "");
  const [linkPlacement, setLinkPlacement] = useState<"comment" | "post">("post");
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [draftText, setDraftText] = useState("");
  const [publishingId, setPublishingId] = useState<string | null>(null);

  useEffect(() => setQueue(readQueue()), []);

  const calendarDays = useMemo(() => buildCalendarDays(monthCursor), [monthCursor]);
  const calendarPlans = useMemo(() => {
    const result = new Map<string, ReturnType<typeof getSocialDailyPlan>>();
    calendarDays.forEach((day) => result.set(dateKey(day), getSocialDailyPlan(activeOffers, day)));
    return result;
  }, [activeOffers, calendarDays]);

  const queueByDate = useMemo(() => {
    const result = new Map<string, number>();
    queue.forEach((item) => {
      if (!item.scheduledAt) return;
      const key = item.scheduledAt.slice(0, 10);
      result.set(key, (result.get(key) || 0) + 1);
    });
    return result;
  }, [queue]);

  const offer = useMemo(
    () => activeOffers.find((item) => item.id === id) ?? activeOffers[0],
    [activeOffers, id]
  );

  const generatedText = useMemo(() => {
    if (!offer) return "";
    const url = `https://tripownia.pl/oferta/${offer.id}`;
    const hashtag = slugify(offer.city);
    const tripDate = offer.dates ? `📅 Termin: ${offer.dates}\n` : "";
    const baseTexts: Record<Tone, string> = {
      short: `${offer.flag} ${offer.city} za ${offer.price} zł/os.? 👀\n\n${tripDate}✈️ Wylot: ${offer.departure}\n🏨 ${offer.nights} nocy · ${offer.hotel}\n🍽️ ${offer.board}\n\n${offer.reason}\n\nSprawdź, zanim cena zrobi swoje ✈️\n\n#tripownia #podroze #${hashtag}`,
      sales: `${offer.flag} ${offer.city} — to może być bardzo dobry plan na kolejny wyjazd.\n\n${tripDate}✈️ Wylot: ${offer.departure}\n🏨 ${offer.nights} nocy · ${offer.hotel}\n🍽️ ${offer.board}\n💰 ostatnio od ${offer.price} zł/os.\n\n${offer.reason}\n\nSprawdź aktualną dostępność i cenę.\n\n#tripownia #okazjepodroznicze #wakacje #${hashtag}`,
      daily: `🔥 ${offer.city.toLocaleUpperCase("pl")} OD ${offer.price} ZŁ/OS.\n\n${tripDate}${offer.nights} nocy · wylot z ${offer.departure}\n🍽️ ${offer.board}\n\n${offer.reason}\n\nJeśli ten kierunek chodzi Ci po głowie, warto sprawdzić aktualną cenę.\n\n#tripownia #okazjadnia #podroze #${hashtag}`,
    };
    return linkPlacement === "post"
      ? `${baseTexts[tone]}\n\n👉 Sprawdź aktualną cenę: ${url}`
      : `${baseTexts[tone]}\n\n👇 Link do oferty w pierwszym komentarzu`;
  }, [offer, tone, linkPlacement]);

  useEffect(() => setDraftText(generatedText), [generatedText]);

  useEffect(() => {
    const planned = dailyPlan.items[0];
    if (!planned) return;
    setId(planned.offer.id);
    setTone(planned.tone);
    setScheduledAt(scheduleDateAt(selectedDate, planned.time));
  }, [dailyPlan, selectedDate]);

  if (!offer) return null;

  const url = `https://tripownia.pl/oferta/${offer.id}`;

  function selectCalendarDate(day: Date) {
    const key = dateKey(day);
    setSelectedDate(key);
    setMonthCursor(new Date(day.getFullYear(), day.getMonth(), 1, 12));
  }

  function goToToday() {
    const now = new Date();
    setSelectedDate(dateKey(now));
    setMonthCursor(new Date(now.getFullYear(), now.getMonth(), 1, 12));
  }

  function moveMonth(amount: number) {
    setMonthCursor((current) => new Date(current.getFullYear(), current.getMonth() + amount, 1, 12));
  }

  function loadPlannedOffer(index: number) {
    const planned = dailyPlan.items[index];
    if (!planned) return;
    setId(planned.offer.id);
    setTone(planned.tone);
    setScheduledAt(scheduleDateAt(selectedDate, planned.time));
  }

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
    saveQueue([item, ...queue].slice(0, 150));
  }

  function addWholeDayToQueue() {
    const now = Date.now();
    const next = dailyPlan.items.map((planned, index): QueueItem => {
      const plannedUrl = `https://tripownia.pl/oferta/${planned.offer.id}`;
      const hashtag = slugify(planned.offer.city);
      const tripDate = planned.offer.dates ? `📅 Termin: ${planned.offer.dates}\n` : "";
      const plannedText = `${planned.offer.flag} ${planned.offer.city} — od ${planned.offer.price} zł/os.\n\n${tripDate}✈️ Wylot: ${planned.offer.departure}\n🏨 ${planned.offer.nights} nocy · ${planned.offer.hotel}\n🍽️ ${planned.offer.board}\n\n${planned.offer.reason}\n\n👉 Sprawdź aktualną cenę: ${plannedUrl}\n\n#tripownia #okazjepodroznicze #podroze #${hashtag}`;
      return {
        id: `${now + index}-${planned.offer.id}`,
        offerId: planned.offer.id,
        tone: planned.tone,
        text: plannedText,
        url: plannedUrl,
        scheduledAt: scheduleDateAt(selectedDate, planned.time),
        status: "pending",
        createdAt: new Date().toISOString(),
      };
    });
    const existingIds = new Set(queue.map((item) => `${item.offerId}:${item.scheduledAt.slice(0, 10)}`));
    const withoutDuplicates = next.filter((item) => !existingIds.has(`${item.offerId}:${item.scheduledAt.slice(0, 10)}`));
    saveQueue([...withoutDuplicates, ...queue].slice(0, 150));
  }

  function updateStatus(queueId: string, status: QueueStatus) {
    saveQueue(queue.map((item) => item.id === queueId ? { ...item, status } : item));
  }

  function updateText(queueId: string, text: string) {
    saveQueue(queue.map((item) => item.id === queueId
      ? { ...item, text, status: item.status === "published" ? "published" : "pending" }
      : item));
  }

  function removeFromQueue(queueId: string) {
    saveQueue(queue.filter((item) => item.id !== queueId));
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
      if (!response.ok || !result.ok) throw new Error(result.error || "Publikacja nie powiodła się.");
      saveQueue(queue.map((item) => item.id === queueItem.id ? {
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
      <section className={styles.calendarSection}>
        <div className={styles.calendarHeader}>
          <div>
            <div className="kicker">KALENDARZ PUBLIKACJI</div>
            <h2>Planuj oferty po datach</h2>
            <p>Na każdym dniu widzisz skrót kilku ofert. Kliknij datę, aby otworzyć pełne 5 propozycji i je zaakceptować.</p>
          </div>
          <div className={styles.calendarControls}>
            <button type="button" className={styles.navButton} onClick={() => moveMonth(-1)} aria-label="Poprzedni miesiąc"><ChevronLeft size={17}/></button>
            <div className={styles.monthLabel}>{new Intl.DateTimeFormat("pl-PL", { month: "long", year: "numeric" }).format(monthCursor)}</div>
            <button type="button" className={styles.navButton} onClick={() => moveMonth(1)} aria-label="Następny miesiąc"><ChevronRight size={17}/></button>
            <button type="button" className={styles.todayButton} onClick={goToToday}>Dzisiaj</button>
          </div>
        </div>

        <div className={styles.calendarScroll}>
          <div className={styles.weekHeader}>
            {WEEKDAYS.map((day) => <div className={styles.weekday} key={day}>{day}</div>)}
          </div>
          <div className={styles.calendarGrid}>
            {calendarDays.map((day) => {
              const key = dateKey(day);
              const plan = calendarPlans.get(key);
              const outside = day.getMonth() !== monthCursor.getMonth();
              const selected = key === selectedDate;
              const isToday = key === todayKey;
              const queued = queueByDate.get(key) || 0;
              return (
                <button
                  type="button"
                  key={key}
                  onClick={() => selectCalendarDate(day)}
                  className={`${styles.dayButton} ${outside ? styles.dayOutside : ""} ${selected ? styles.daySelected : ""} ${isToday ? styles.dayToday : ""}`}
                >
                  <div className={styles.dayTop}>
                    <span className={styles.dayNumber}>{day.getDate()}</span>
                    {queued ? <span className={styles.dayQueueCount}>{queued} w plannerze</span> : <span className={styles.dayCount}>5 ofert</span>}
                  </div>
                  <div className={styles.dayOffers}>
                    {plan?.items.slice(0, 3).map((planned) => (
                      <div className={styles.dayOffer} key={`${key}-${planned.offer.id}`}>
                        <strong>{planned.time}</strong>{planned.offer.city}
                      </div>
                    ))}
                    {(plan?.items.length || 0) > 3 && <div className={styles.moreOffers}>+{(plan?.items.length || 0) - 3} kolejne</div>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className={styles.selectedDaySection}>
        <div className={styles.selectedDayHead}>
          <div>
            <div className="kicker">{dailyPlan.dayName.toLocaleUpperCase("pl")} · {selectedDate}</div>
            <h2>{formatSelectedDate(selectedDate)}</h2>
            <p>{dailyPlan.description}</p>
          </div>
          <button type="button" className={styles.addDayButton} onClick={addWholeDayToQueue}><Plus size={17}/> Dodaj wszystkie 5 do akceptacji</button>
        </div>

        <div className={styles.offerGrid}>
          {dailyPlan.items.map((planned, index) => {
            const plannedQueue = queue.find((item) => item.offerId === planned.offer.id && item.scheduledAt.slice(0, 10) === selectedDate);
            return (
              <button
                key={`${selectedDate}-${planned.offer.id}`}
                type="button"
                onClick={() => loadPlannedOffer(index)}
                className={`${styles.offerButton} ${planned.offer.id === offer.id ? styles.offerActive : ""}`}
              >
                <div className={styles.offerThumb} style={{ backgroundImage: `url(${planned.offer.image})` }}>
                  <span className={styles.offerTime}>{planned.time}</span>
                </div>
                <div className={styles.offerContent}>
                  <span className={styles.offerLabel}>{planned.label}</span>
                  <strong className={styles.offerCity}>{planned.offer.flag} {planned.offer.city}</strong>
                  <span className={styles.offerPrice}>od {planned.offer.price} zł/os.</span>
                  <span className={styles.offerTripDate}>📅 {planned.offer.dates || "termin do sprawdzenia"}</span>
                  <span className={styles.offerMeta}>✈️ {planned.offer.departure} · {planned.offer.nights} nocy</span>
                  <span className={styles.offerStatus}>{plannedQueue ? statusLabel(plannedQueue.status) : "PROPOZYCJA"}</span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <div className="social-center-toolbar">
        <label>
          <span>Oferta do pokazania</span>
          <select value={id} onChange={(event) => setId(Number(event.target.value))}>
            {activeOffers.map((item) => (
              <option key={item.id} value={item.id}>{item.flag} {item.city} · {item.price} zł · {item.dates} · {item.departure}</option>
            ))}
          </select>
        </label>

        <div className="social-tone-picker">
          <span>Styl posta</span>
          <div>{tones.map((item) => <button type="button" key={item.id} className={tone === item.id ? "active" : ""} onClick={() => setTone(item.id)}>{item.label}</button>)}</div>
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
          <input type="datetime-local" value={scheduledAt} onChange={(event) => setScheduledAt(event.target.value)} />
        </label>
      </div>

      <div className="social-center-grid">
        <section className="social-preview-card">
          <div className="social-preview-head"><div className="social-preview-logo">T</div><div><strong>Tripownia.pl</strong><span>Podgląd przed akceptacją</span></div></div>
          <div className="social-preview-text">{draftText}</div>
          <img src={offer.image} alt={`${offer.city} — oferta Tripownia`} />
          <div className="social-link-preview"><small>TRIPOWNIA.PL</small><strong>{offer.city} od {offer.price} zł/os.</strong><span>{offer.dates} · {offer.nights} nocy</span></div>
        </section>

        <aside className="social-publish-panel">
          <div className="social-publish-badge"><Sparkles size={16}/> WERSJA ROBOCZA</div>
          <h2>Najpierw zobacz, potem zatwierdź</h2>
          <p>Data publikacji i termin wyjazdu są widoczne osobno. Możesz poprawić tekst przed dodaniem do kolejki.</p>
          <textarea value={draftText} onChange={(event) => setDraftText(event.target.value)} rows={13} />
          <div className="social-publish-actions">
            <button type="button" onClick={() => copy(draftText, "text")}>{copied === "text" ? <Check size={17}/> : <Copy size={17}/>} {copied === "text" ? "Skopiowano" : "Kopiuj tekst"}</button>
            <button type="button" onClick={() => copy(url, "link")}>{copied === "link" ? <Check size={17}/> : <Link2 size={17}/>} {copied === "link" ? "Skopiowano" : "Kopiuj link"}</button>
            <button type="button" onClick={addToQueue}><Plus size={17}/> Dodaj do akceptacji</button>
          </div>
          <a className="social-offer-check" href={`/oferta/${offer.id}`} target="_blank" rel="noreferrer">Sprawdź ofertę przed publikacją <ExternalLink size={15}/></a>
        </aside>
      </div>

      <section className="social-queue">
        <div className="admin-panel-head">
          <div><h2>Do akceptacji i publikacji</h2><p>Tu trafiają wybrane posty z kalendarza. Zatwierdzenie dopiero odblokowuje publikację na Facebooku i Instagramie.</p></div>
          <span className="social-queue-count"><CalendarClock size={16}/> {queue.length} postów</span>
        </div>

        {!queue.length ? <div className="social-queue-empty">Nie ma jeszcze żadnych postów do akceptacji.</div> : (
          <div className="social-queue-list">
            {queue.map((item) => {
              const qOffer = activeOffers.find((candidate) => candidate.id === item.offerId);
              return (
                <article key={item.id} style={{ alignItems: "stretch", gap: 12 }}>
                  <div className={styles.queueMain}>
                    <small>{item.scheduledAt ? new Date(item.scheduledAt).toLocaleString("pl-PL") : "bez terminu publikacji"}</small>
                    <strong>{qOffer ? `${qOffer.flag} ${qOffer.city}` : `Oferta #${item.offerId}`}</strong>
                    {qOffer?.dates && <span>Termin wyjazdu: {qOffer.dates}</span>}
                    <span>{statusLabel(item.status)}</span>
                    <textarea value={item.text} disabled={item.status === "published" || item.status === "skipped"} onChange={(event) => updateText(item.id, event.target.value)} rows={7} style={{ width: "100%", marginTop: 10 }} />
                    <div className={styles.queueActions}>
                      {item.status === "pending" && <><button type="button" onClick={() => updateStatus(item.id, "approved")}><Check size={16}/> Zatwierdź</button><button type="button" onClick={() => updateStatus(item.id, "skipped")}><XCircle size={16}/> Pomiń</button></>}
                      {item.status === "approved" && <><button type="button" onClick={() => updateStatus(item.id, "pending")}><Pencil size={16}/> Cofnij do poprawy</button><button type="button" onClick={() => publish(item)} disabled={publishingId === item.id}><Send size={16}/> {publishingId === item.id ? "Publikuję…" : "Publikuj FB + IG"}</button></>}
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
