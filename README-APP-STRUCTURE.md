# Uproszczona struktura APP

Folder `app` ma tylko trzy rodzaje tras:

- `app/page.tsx` – strona główna
- `app/oferta/[id]/page.tsx` – jeden szablon wszystkich ofert
- `app/[...slug]/page.tsx` – wszystkie pozostałe strony: kierunki, poradniki, parkingi, atrakcje, eSIM i stare URL-e WordPress

Nie tworzymy już osobnych folderów `okazje`, `poradniki`, `parkingi`, `atrakcje`, `esim` w `app`.
