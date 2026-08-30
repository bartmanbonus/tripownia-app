export type Offer = {
  id: number;
  flag: string;
  city: string;
  country: string;
  price: number;
  departure: string;
  nights: number;
  weather: string;
  score: number;
  tag: "BIERZEMY" | "DOBRA OPCJA" | "OKAZJA";
  reason: string;
  image: string;
  category: string[];
};

export const offers: Offer[] = [
  {
    id: 1,
    flag: "🇲🇹",
    city: "Malta",
    country: "Malta",
    price: 699,
    departure: "Warszawa Modlin",
    nights: 3,
    weather: "20°C",
    score: 9.6,
    tag: "BIERZEMY",
    reason: "Bardzo dobra cena, sensowny termin i świetny kierunek na szybki city break.",
    image: "https://images.unsplash.com/photo-1514222134-b57cbb8ce073?auto=format&fit=crop&w=1600&q=80",
    category: ["city", "tanio", "cieplo"]
  },
  {
    id: 2,
    flag: "🇪🇸",
    city: "Barcelona",
    country: "Hiszpania",
    price: 1099,
    departure: "Warszawa",
    nights: 3,
    weather: "22°C",
    score: 9.2,
    tag: "DOBRA OPCJA",
    reason: "Dobry balans ceny, lotu i lokalizacji. Idealny krótki wypad.",
    image: "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=1600&q=80",
    category: ["city", "weekend"]
  },
  {
    id: 3,
    flag: "🇹🇳",
    city: "Djerba",
    country: "Tunezja",
    price: 1799,
    departure: "Warszawa",
    nights: 7,
    weather: "26°C",
    score: 9.4,
    tag: "BIERZEMY",
    reason: "7 nocy All Inclusive i ciepło — bardzo mocna relacja ceny do długości wyjazdu.",
    image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1600&q=80",
    category: ["plaza", "cieplo", "allinclusive"]
  },
  {
    id: 4,
    flag: "🇮🇹",
    city: "Bergamo",
    country: "Włochy",
    price: 599,
    departure: "Kraków",
    nights: 2,
    weather: "18°C",
    score: 8.8,
    tag: "OKAZJA",
    reason: "Bardzo tani szybki wypad i świetna baza do Mediolanu lub nad Como.",
    image: "https://images.unsplash.com/photo-1529260830199-42c24126f198?auto=format&fit=crop&w=1600&q=80",
    category: ["city", "tanio", "weekend"]
  }
];
