"use client";

import { useEffect, useMemo, useState } from "react";
import { Eye, EyeOff, Save, Star, Trash2, Upload, Download } from "lucide-react";
import { offers } from "@/lib/offers";
import {
  clearOfferOverride,
  exportOfferOverrides,
  getOfferOverride,
  saveOfferOverride,
  type OfferOverride,
} from "@/lib/clientOfferOverrides";

export default function AdminOfferEditor() {
  const [selectedId, setSelectedId] = useState(offers[0]?.id ?? 1);
  const [draft, setDraft] = useState<OfferOverride>({});
  const [saved, setSaved] = useState(false);

  const offer = useMemo(() => offers.find(o => o.id === selectedId) ?? offers[0], [selectedId]);

  useEffect(() => {
    setDraft(getOfferOverride(selectedId));
    setSaved(false);
  }, [selectedId]);

  if (!offer) return null;

  function update<K extends keyof OfferOverride>(key: K, value: OfferOverride[K]) {
    setDraft(prev => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  function save() {
    saveOfferOverride(offer.id, draft);
    setDraft(getOfferOverride(offer.id));
    setSaved(true);
  }

  function reset() {
    clearOfferOverride(offer.id);
    setDraft({});
    setSaved(false);
  }

  function exportJson() {
    const data = exportOfferOverrides();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tripownia-zmiany-ofert-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="admin-editor">
      <div className="admin-editor-head">
        <div>
          <h2>CMS ofert</h2>
          <p>Edytuj cenę, link afiliacyjny, status, zdjęcie, opis i wyróżnienie. Zapis lokalny daje podgląd, a przycisk publikacji w panelu wysyła zatwierdzone zmiany do wspólnej wersji serwisu, jeśli publikacja GitHub/Vercel jest skonfigurowana.</p>
        </div>
        <button type="button" className="admin-json-export" onClick={exportJson}>
          <Download size={16}/> Eksport zmian JSON
        </button>
      </div>

      <div className="admin-editor-grid">
        <aside className="admin-offer-list">
          {offers.map(o => {
            const ov = getOfferOverride(o.id);
            return (
              <button
                type="button"
                key={o.id}
                className={selectedId === o.id ? "active" : ""}
                onClick={() => setSelectedId(o.id)}
              >
                <span>{o.flag}</span>
                <div><strong>{o.city}</strong><small>{o.price} zł · {o.departure}</small></div>
                {(ov.featured || ov.hidden || ov.price || ov.affiliateUrl || ov.imageUrl || ov.availabilityStatus) && <b>zmieniona</b>}
              </button>
            );
          })}
        </aside>

        <div className="admin-edit-form">
          <div className="admin-edit-title">
            <div><small>OFERTA #{offer.id}</small><h3>{offer.flag} {offer.city}</h3></div>
            <div className="admin-toggle-actions">
              <button
                type="button"
                className={draft.featured ? "active" : ""}
                onClick={() => update("featured", !draft.featured)}
              >
                <Star size={15} fill={draft.featured ? "currentColor" : "none"}/> HIT
              </button>
              <button
                type="button"
                className={draft.hidden ? "danger active" : ""}
                onClick={() => update("hidden", !draft.hidden)}
              >
                {draft.hidden ? <EyeOff size={15}/> : <Eye size={15}/>}
                {draft.hidden ? "Ukryta" : "Widoczna"}
              </button>
            </div>
          </div>

          <div className="admin-form-grid">
            <label>
              Cena / os.
              <input
                type="number"
                min="0"
                value={draft.price ?? ""}
                placeholder={String(offer.price)}
                onChange={e => update("price", e.target.value ? Number(e.target.value) : undefined)}
              />
              <small>Oryginalnie: {offer.price} zł</small>
            </label>

            <label>
              Link afiliacyjny / deeplink
              <input
                value={draft.affiliateUrl ?? ""}
                placeholder={offer.affiliateUrl}
                onChange={e => update("affiliateUrl", e.target.value || undefined)}
              />
            </label>

            <label>
              Status oferty
              <select
                value={draft.availabilityStatus ?? offer.availabilityStatus ?? "unknown"}
                onChange={e => update("availabilityStatus", e.target.value as OfferOverride["availabilityStatus"])}
              >
                <option value="available">Dostępna</option>
                <option value="unknown">Do ponownego sprawdzenia</option>
                <option value="expired">Wygasła</option>
              </select>
              <small>Wygasła oferta zostaje pod swoim adresem, ale nie pojawia się w wyszukiwarce ani selekcji dziennej.</small>
            </label>

            <label>
              Dokąd naprawdę prowadzi link?
              <select
                value={draft.linkMatch ?? offer.linkMatch ?? "parameters"}
                onChange={e => update("linkMatch", e.target.value as OfferOverride["linkMatch"])}
              >
                <option value="exact">Konkretna oferta / hotel / pakiet</option>
                <option value="parameters">Wyniki z przekazanymi parametrami</option>
                <option value="destination">Tylko strona kierunku</option>
              </select>
              <small>„Konkretna oferta” wybierz dopiero po ręcznym sprawdzeniu deeplinku u partnera.</small>
            </label>

            <label className="admin-form-wide">
              Własne zdjęcie — URL
              <input
                value={draft.imageUrl ?? ""}
                placeholder="https://..."
                onChange={e => update("imageUrl", e.target.value || undefined)}
              />
              <small>Jeśli puste, działa obecny mechanizm zdjęcia kierunku.</small>
            </label>

            <label className="admin-form-wide">
              Notatka / opis na karcie
              <textarea
                rows={4}
                value={draft.note ?? ""}
                placeholder={offer.reason}
                onChange={e => update("note", e.target.value || undefined)}
              />
            </label>
          </div>

          <div className="admin-current-info">
            <div><small>Partner</small><strong>{offer.partner}</strong></div>
            <div><small>Typ linku</small><strong>{draft.linkMatch === "exact" || offer.linkMatch === "exact" ? "konkretna oferta" : draft.linkMatch === "destination" || offer.linkMatch === "destination" ? "strona kierunku" : "wyniki z parametrami"}</strong></div>
            <div><small>Termin</small><strong>{offer.dates}</strong></div>
            <div><small>Hotel</small><strong>{offer.hotel}</strong></div>
            <div><small>Status</small><strong>{(draft.availabilityStatus ?? offer.availabilityStatus ?? "unknown") === "available" ? "dostępna" : (draft.availabilityStatus ?? offer.availabilityStatus ?? "unknown") === "expired" ? "wygasła" : "do sprawdzenia"}</strong></div>
          </div>

          <div className="admin-editor-actions">
            <button type="button" className="admin-save-draft" onClick={save}>
              <Save size={16}/> {saved ? "Zapisano" : "Zapisz zmianę w CMS"}
            </button>
            <button type="button" className="admin-reset-draft" onClick={reset}>
              <Trash2 size={16}/> Cofnij zmiany
            </button>
            <a href={`/oferta/${offer.id}`} target="_blank">Otwórz ofertę →</a>
          </div>

          <div className="admin-local-warning">
            <Upload size={17}/>
            <span><strong>To jeszcze nie publikuje zmian dla wszystkich użytkowników.</strong> Wersja robocza działa lokalnie w tej przeglądarce. Publikacja dla wszystkich użytkowników wymaga zapisania zmian po stronie serwera lub do wspólnego źródła danych — bez narzucania konkretnej technologii.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
