"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, CalendarDays, Luggage, Plane, Sparkles } from "lucide-react";

type FlightDate = {
  destinationCode: string;
  price: number;
  departDate: string;
  returnDate: string;
  outboundStops: number;
  returnStops: number;
};

const DURATION_RANGES = [
  { minDays: 5, maxDays: 7 },
  { minDays: 8, maxDays: 10 },
  { minDays: 11, maxDays: 14 },
  { minDays: 15, maxDays: 21 },
];

function plDate(value: string) {
  if (!/^20\d{2}-\d{2}-\d{2}$/.test(value)) return value;
  return new Intl.DateTimeFormat("pl-PL", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value + "T12:00:00Z"));
}

function nights(from: string, to: string) {
  const start = Date.parse(from + "T00:00:00Z");
  const end = Date.parse(to + "T00:00:00Z");
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return 0;
  return Math.round((end - start) / 86400000);
}

function overlapsMajowka(from: string, to: string) {
  const start = Date.parse(from + "T00:00:00Z");
  const end = Date.parse(to + "T00:00:00Z");
  const mayStart = Date.parse("2027-04-30T00:00:00Z");
  const mayEnd = Date.parse("2027-05-04T23:59:59Z");
  return start <= mayEnd && end >= mayStart;
}

function detailHref(row: FlightDate) {
  const params = new URLSearchParams({
    origin: "WAW",
    destination: row.destinationCode || "SEZ",
    depart: row.departDate,
    return: row.returnDate,
    name: "Seszele",
    country: "Seszele",
    price: String(Math.round(row.price || 0)),
    changes: String(Math.max(row.outboundStops || 0, row.returnStops || 0)),
  });
  return "/loty/oferta?" + params.toString();
}

export default function SeychellesDatesLanding() {
  const [rows, setRows] = useState<FlightDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [partial, setPartial] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    Promise.allSettled(
      DURATION_RANGES.map(async ({ minDays, maxDays }) => {
        const params = new URLSearchParams({
          origin: "WAW",
          destination: "SEZ",
          minDays: String(minDays),
          maxDays: String(maxDays),
          direct: "false",
        });
        const response = await fetch("/api/flight-calendar?" + params.toString(), {
          cache: "no-store",
          signal: controller.signal,
        });
        const data = await response.json();
        if (!response.ok || data?.ok === false) throw new Error("unavailable");
        return Array.isArray(data?.results) ? data.results as FlightDate[] : [];
      }),
    ).then((settled) => {
      if (controller.signal.aborted) return;
      const all = settled.flatMap((item) => item.status === "fulfilled" ? item.value : []);
      setPartial(settled.some((item) => item.status === "rejected"));
      const unique = new Map<string, FlightDate>();
      for (const row of all) {
        if (!row?.departDate || !row?.returnDate || !(Number(row.price) > 0)) continue;
        const key = row.departDate + "|" + row.returnDate;
        const current = unique.get(key);
        if (!current || row.price < current.price) unique.set(key, row);
      }
      setRows([...unique.values()].sort((a, b) => {
        const aMaj = overlapsMajowka(a.departDate, a.returnDate) ? 0 : 1;
        const bMaj = overlapsMajowka(b.departDate, b.returnDate) ? 0 : 1;
        return aMaj - bMaj
          || a.departDate.localeCompare(b.departDate)
          || a.price - b.price;
      }));
    }).finally(() => {
      if (!controller.signal.aborted) setLoading(false);
    });

    return () => controller.abort();
  }, []);

  const cheapest = useMemo(
    () => rows.length ? Math.min(...rows.map((row) => Number(row.price) || Infinity)) : 0,
    [rows],
  );

  return (
    <section className="shell" style={{ paddingTop: 28, paddingBottom: 56 }}>
      <div style={{
        maxWidth: 980,
        margin: "0 auto",
        borderRadius: 28,
        overflow: "hidden",
        background: "linear-gradient(145deg,#043d49 0%,#07536a 58%,#0a6b82 100%)",
        color: "#fff",
        padding: "32px 28px",
      }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10, opacity: 0.9 }}>
          <Sparkles size={18} />
          <strong style={{ letterSpacing: ".16em", fontSize: 13 }}>EGZOTYKA · SESZELE</strong>
        </div>
        <h1 style={{ margin: 0, fontSize: "clamp(2.3rem,7vw,4.8rem)", lineHeight: 0.96 }}>Wybierz swój termin</h1>
        <p style={{ maxWidth: 720, fontSize: 18, lineHeight: 1.6, margin: "18px 0 0" }}>
          Jedna strona, wiele terminów. Klikasz datę, która Ci pasuje, sprawdzasz konkretny lot i dopiero wtedy przechodzisz do rezerwacji.
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 22 }}>
          <span style={{ background: "rgba(255,255,255,.12)", borderRadius: 999, padding: "10px 14px", display: "inline-flex", gap: 8, alignItems: "center" }}>
            <Plane size={17}/> Warszawa → Seszele
          </span>
          <span style={{ background: "rgba(255,255,255,.12)", borderRadius: 999, padding: "10px 14px", display: "inline-flex", gap: 8, alignItems: "center" }}>
            <CalendarDays size={17}/> Majówka + inne terminy
          </span>
          <span style={{ background: "rgba(255,255,255,.12)", borderRadius: 999, padding: "10px 14px", display: "inline-flex", gap: 8, alignItems: "center" }}>
            <Luggage size={17}/> Duży bagaż: sprawdź warunki wybranego lotu
          </span>
        </div>
      </div>

      <div style={{ maxWidth: 980, margin: "26px auto 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "end", flexWrap: "wrap" }}>
          <div>
            <div className="kicker">DOSTĘPNE TERMINY</div>
            <h2 style={{ margin: "6px 0 0" }}>Kliknij termin, który wybierasz</h2>
          </div>
          <div style={{ textAlign: "right" }}>
            <small>Cena z posta: od 3439 zł/os.</small>
            {cheapest > 0 && <div><strong>Aktualnie znalezione od {cheapest.toLocaleString("pl-PL")} zł/os.</strong></div>}
          </div>
        </div>

        {loading && (
          <div style={{ marginTop: 22, padding: 24, borderRadius: 18, background: "#f6f7f8" }}>
            Sprawdzamy wszystkie dostępne terminy…
          </div>
        )}

        {!loading && rows.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(270px,1fr))", gap: 14, marginTop: 22 }}>
            {rows.map((row) => {
              const isMajowka = overlapsMajowka(row.departDate, row.returnDate);
              const stay = nights(row.departDate, row.returnDate);
              return (
                <a
                  href={detailHref(row)}
                  key={row.departDate + "-" + row.returnDate}
                  style={{
                    display: "block",
                    textDecoration: "none",
                    color: "inherit",
                    border: isMajowka ? "2px solid #ff7a1a" : "1px solid #e6e8eb",
                    borderRadius: 20,
                    padding: 20,
                    background: "#fff",
                    boxShadow: "0 8px 28px rgba(0,0,0,.06)",
                  }}
                >
                  {isMajowka && (
                    <span style={{ display: "inline-block", background: "#ff7a1a", color: "#fff", borderRadius: 999, padding: "6px 10px", fontSize: 12, fontWeight: 800, marginBottom: 10 }}>
                      MAJÓWKA
                    </span>
                  )}
                  <div style={{ fontWeight: 800, fontSize: 18 }}>{plDate(row.departDate)}</div>
                  <div style={{ opacity: 0.68, marginTop: 4 }}>powrót: {plDate(row.returnDate)} · {stay} {stay === 1 ? "noc" : stay <= 4 ? "noce" : "nocy"}</div>
                  <div style={{ display: "flex", alignItems: "end", justifyContent: "space-between", gap: 12, marginTop: 18 }}>
                    <div>
                      <small style={{ opacity: 0.6 }}>od</small>
                      <div style={{ fontWeight: 900, fontSize: 26 }}>{Math.round(row.price).toLocaleString("pl-PL")} zł/os.</div>
                    </div>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 800 }}>
                      Wybieram <ArrowRight size={18}/>
                    </span>
                  </div>
                </a>
              );
            })}
          </div>
        )}

        {!loading && rows.length === 0 && (
          <div style={{ marginTop: 22, padding: 24, borderRadius: 18, background: "#fff4ea" }}>
            <strong>Terminy są właśnie odświeżane u dostawcy.</strong>
            <div style={{ marginTop: 6 }}>Wróć za chwilę — nie pokazujemy wymyślonych dat ani cen.</div>
          </div>
        )}

        {partial && rows.length > 0 && (
          <p style={{ marginTop: 16, opacity: 0.65, fontSize: 13 }}>
            Część źródeł może chwilowo nie odpowiadać. Pokazujemy tylko terminy, które udało się aktualnie potwierdzić.
          </p>
        )}

        <p style={{ marginTop: 20, opacity: 0.7, fontSize: 13, lineHeight: 1.6 }}>
          Ceny lotów zmieniają się dynamicznie. Po wyborze terminu pokazujemy konkretną trasę w Tripowni, a rezerwację finalizujesz po sprawdzeniu aktualnej ceny i warunków.
        </p>
      </div>
    </section>
  );
}
