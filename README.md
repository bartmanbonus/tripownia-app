# Tripownia.pl

Next.js app for Tripownia.pl.

## Prosta struktura

- `app/page.tsx` — strona główna
- `app/oferta/[id]/page.tsx` — szablon konkretnej oferty
- `app/[...slug]/page.tsx` — wszystkie pozostałe podstrony (poradniki, kierunki, parkingi, atrakcje, eSIM i treści z WordPressa)
- `components/` — komponenty UI
- `lib/` — oferty, partnerzy afiliacyjni i logika
- `data/legacy-content.json` — treści zmigrowane z WordPressa
- `public/` — logo i pliki statyczne

Nie dodawaj osobnych `globals.css`, `layout.tsx` ani luźnych `page.tsx` poza strukturą `app/`.
