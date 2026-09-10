# Audyt zaleznosci — 10 wrzesnia 2026

## Zakres i stan przed poprawka

Repozytorium `bartmanbonus/tripownia-app`, PR #4, galaz `fix/search-radar-affiliate-admin-20260910`. Wdrozenie produkcyjne wymaga osobnej akceptacji.

Odczytano rzeczywisty wynik `npm audit --package-lock-only --json` z run 34512372222, job 102989392413. Npm zglosil dwa podatne pakiety: `postcss@8.4.31` (high) oraz `next@15.5.25` (moderate, wylacznie poprzez zaleznosc postcss). To nie byly dwa niezalezne bledy kodu Tripowni; wpis PostCSS agregowal cztery komunikaty upstream.

Zidentyfikowane komunikaty:
- GHSA-qx2v-qp2m-jg93: XSS przy serializacji CSS, zakres npm <8.5.10.
- GHSA-6g55-p6wh-862q: odczyt plikow przez sourceMappingURL, zakres npm <=8.5.11.
- GHSA-r28c-9q8g-f849: odczyt plikow .map spoza katalogu, zakres npm <=8.5.17.
- GHSA-fxqj-rqcc-2cmp: niepelna poprawka przy braku opcji from, zakres npm <=8.5.22.

Zrodla pierwotne: https://github.com/postcss/postcss/security/advisories oraz https://github.com/postcss/postcss/releases/tag/8.5.23 . Warunki wykorzystania dotycza przetwarzania niezaufanego CSS i udostepniania wyniku; nie wykonywano proby wykorzystania podatnosci na produkcji.

## Zastosowana zmiana

`package.json`: dodano precyzyjny override `next.postcss = 8.5.23`.
`package-lock.json`: npm wygenerowal rekord PostCSS 8.5.23 wraz z oficjalnym resolved/integrity i wymaganiami zaleznosci. Nie edytowano recznie hasha integrity.

Next.js pozostaje w wersji 15.5.25. Nie uzyto `npm audit fix --force` ani aktualizacji do Next 16. Sprawdzenie maszynowe potwierdzilo identycznosc wszystkich pozostalych rekordow lockfile.

`.github/workflows/validate.yml`: dodano osobny job audytu zaleznosci. Job konczy sie bledem dla moderate/high/critical oraz gdy audytu nie mozna wykonac; nie traktuje awarii rejestru jako wyniku bez podatnosci. Raport JSON jest artefaktem CI. Workflow ma uprawnienia contents:read i nie wdraza aplikacji. Sam job nie zmienia ustawien ochrony galezi w GitHub.

## Faktycznie wykonane sprawdzenie poprawki

Workflow `Prepare PostCSS security patch`, run 34512543698, job 102989969118, 2026-09-10 18:09 UTC, na kodzie f0d7a8dc66fe630fc5c8ccb0832fab2cf3c1cf25 z wygenerowanymi plikami zaleznosci:

- kontrola: zmienia sie tylko rekord PostCSS — PASS;
- `git diff --check` — PASS;
- `npm ci` — PASS, found 0 vulnerabilities;
- `npm audit --package-lock-only --json` — 0 info, 0 low, 0 moderate, 0 high, 0 critical;
- `npm test` — 24/24 PASS, zero skipped;
- `npm run validate` — PASS;
- `npm run typecheck` — PASS;
- `npm run build` — PASS, 392 statyczne strony wygenerowane; istnieja nadal ostrzezenia CSS/autoprefixera i narzedzi;
- `scripts/smoke-preview.mjs` — 5 grup HTTP PASS na uruchomionym buildzie w CI. Nie bylo wywolan publikacji Facebooka ani rezerwacji u partnerow.

Przetestowane pliki, zarejestrowane jako bloby Git dopiero po sukcesie powyzszych krokow:
- package.json: 504f243020971a86d48840fccdc736f304822de6
- package-lock.json: d93693c0bd8d872d1a71ffb1c27729dcc317a1a8

Tymczasowy workflow przygotowawczy nie zmienial zadnej galezi, utworzyl tylko artefakt i bloby plikow. Zostal usuniety z koncowego drzewa PR. Po zatwierdzeniu tych plikow w galezi trzeba sprawdzic osobny wynik standardowego CI i Vercel dla wynikowego commita.

## Ograniczenia

Zero wykrytych podatnosci oznacza wynik bazy npm w momencie skanu, nie gwarancje bezpieczenstwa calej aplikacji. Testy HTTP w CI nie zastepuja testow wizualnych desktop/mobile ani rzeczywistego testu integracji partnerskich. Wczesniejszy odczyt chronionego preview Vercela zwracal 403. Nie zmieniono sekretow, DNS ani WooCommerce i nie wykonano wdrozenia PR #4 na produkcje.

Przy synchronizacji galezi uwzgledniono osobno scalony PR #5 z linkiem Atrakcje/GetYourGuide i aktualny snapshot z main. Nie cofnieto tych zmian. Snapshot z main mial checkedAt:null; nie nadano mu fikcyjnej daty weryfikacji podczas testu. Pozostale ograniczenia katalogu, Radaru i Facebooka opisuje `docs/PR4-audit-followup.md`.
