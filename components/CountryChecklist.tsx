"use client";

import { useMemo, useState } from "react";
import { Check, Search, X } from "lucide-react";

const COUNTRIES = [
  "Albania","Andora","Austria","Belgia","Bośnia i Hercegowina","Bułgaria","Chorwacja","Cypr","Czarnogóra","Czechy","Dania","Estonia","Finlandia","Francja","Grecja","Hiszpania","Holandia","Irlandia","Islandia","Kosowo","Liechtenstein","Litwa","Luksemburg","Łotwa","Macedonia Północna","Malta","Mołdawia","Monako","Niemcy","Norwegia","Polska","Portugalia","Rumunia","San Marino","Serbia","Słowacja","Słowenia","Szwajcaria","Szwecja","Turcja","Ukraina","Watykan","Węgry","Wielka Brytania","Włochy",
  "Egipt","Maroko","Tunezja","Algieria","Kenia","Tanzania","Zanzibar","Mauritius","Seszele","Republika Zielonego Przylądka","Gambia","RPA",
  "Zjednoczone Emiraty Arabskie","Jordania","Izrael","Oman","Katar","Arabia Saudyjska",
  "Tajlandia","Wietnam","Indonezja","Bali","Malezja","Singapur","Japonia","Korea Południowa","Chiny","Sri Lanka","Malediwy","Indie","Filipiny",
  "USA","Kanada","Meksyk","Kuba","Dominikana","Jamajka","Kostaryka","Kolumbia","Peru","Brazylia","Argentyna","Chile",
  "Australia","Nowa Zelandia"
];

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

function includesCountry(list: string[], country: string) {
  const key = normalize(country);
  return list.some((item) => normalize(item) === key);
}

function withoutCountry(list: string[], country: string) {
  const key = normalize(country);
  return list.filter((item) => normalize(item) !== key);
}

export default function CountryChecklist({
  visited,
  excluded,
  onChange,
}: {
  visited: string[];
  excluded: string[];
  onChange: (next: { visited: string[]; excluded: string[] }) => void;
}) {
  const [query, setQuery] = useState("");
  const [showVisitedOnly, setShowVisitedOnly] = useState(false);

  const allCountries = useMemo(() => {
    const merged = [...COUNTRIES, ...visited];
    const seen = new Set<string>();
    return merged.filter((country) => {
      const key = normalize(country);
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    }).sort((a, b) => a.localeCompare(b, "pl"));
  }, [visited]);

  const rows = useMemo(() => {
    const needle = normalize(query);
    return allCountries.filter((country) => {
      if (showVisitedOnly && !includesCountry(visited, country)) return false;
      return !needle || normalize(country).includes(needle);
    });
  }, [allCountries, query, showVisitedOnly, visited]);

  function toggleVisited(country: string) {
    const isVisited = includesCountry(visited, country);
    if (isVisited) {
      onChange({
        visited: withoutCountry(visited, country),
        excluded: withoutCountry(excluded, country),
      });
      return;
    }
    onChange({ visited: [...visited, country], excluded });
  }

  function toggleExcluded(country: string) {
    if (!includesCountry(visited, country)) return;
    const isExcluded = includesCountry(excluded, country);
    onChange({
      visited,
      excluded: isExcluded ? withoutCountry(excluded, country) : [...excluded, country],
    });
  }

  const custom = query.trim() && !allCountries.some((country) => normalize(country) === normalize(query.trim())) ? query.trim() : "";

  return (
    <div className="country-checklist">
      <div className="country-checklist-head">
        <div>
          <strong>Moja mapa krajów</strong>
          <span>{visited.length} odwiedzonych · {excluded.length} ukrytych z rekomendacji</span>
        </div>
        <button type="button" className={showVisitedOnly ? "active" : ""} onClick={() => setShowVisitedOnly((value) => !value)}>
          {showVisitedOnly ? "Pokaż wszystkie" : "Tylko odwiedzone"}
        </button>
      </div>

      <div className="country-checklist-search">
        <Search size={15}/>
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Szukaj kraju…" />
        {query && <button type="button" aria-label="Wyczyść" onClick={() => setQuery("")}><X size={15}/></button>}
      </div>

      {custom && !showVisitedOnly && (
        <button type="button" className="country-custom-add" onClick={() => { onChange({ visited: [...visited, custom], excluded }); setQuery(""); }}>
          + Dodaj „{custom}” jako odwiedzony kraj
        </button>
      )}

      <div className="country-checklist-grid">
        {rows.map((country) => {
          const isVisited = includesCountry(visited, country);
          const isExcluded = includesCountry(excluded, country);
          return (
            <div className={`country-check-row ${isVisited ? "visited" : ""}`} key={country}>
              <button type="button" className="country-visited-toggle" onClick={() => toggleVisited(country)}>
                <span className="country-check-box">{isVisited && <Check size={13}/>}</span>
                <span>{country}</span>
              </button>
              {isVisited && (
                <label className="country-exclude-toggle" title="Jeśli zaznaczysz, Tripownia nie będzie proponować tego kraju w rekomendacjach">
                  <input type="checkbox" checked={isExcluded} onChange={() => toggleExcluded(country)} />
                  <span>Nie pokazuj ponownie</span>
                </label>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
