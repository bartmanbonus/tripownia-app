export type WorldDestination = {
  label: string;
  region: string;
  aliases?: string[];
};

export const WORLD_DESTINATIONS: WorldDestination[] = [
  // Europa
  {label:"Albania",region:"Europa"},{label:"Amsterdam, Holandia",region:"Europa"},{label:"Ateny, Grecja",region:"Europa"},{label:"Barcelona, Hiszpania",region:"Europa"},{label:"Bergamo, Włochy",region:"Europa"},{label:"Berlin, Niemcy",region:"Europa"},{label:"Budapeszt, Węgry",region:"Europa"},{label:"Chorwacja",region:"Europa"},{label:"Cypr",region:"Europa"},{label:"Dublin, Irlandia",region:"Europa"},{label:"Dubrownik, Chorwacja",region:"Europa"},{label:"Edynburg, Wielka Brytania",region:"Europa"},{label:"Florencja, Włochy",region:"Europa"},{label:"Fuerteventura, Hiszpania",region:"Europa"},{label:"Grecja",region:"Europa"},{label:"Helsinki, Finlandia",region:"Europa"},{label:"Hiszpania",region:"Europa"},{label:"Islandia",region:"Europa"},{label:"Kopenhaga, Dania",region:"Europa"},{label:"Kreta, Grecja",region:"Europa"},{label:"Lizbona, Portugalia",region:"Europa"},{label:"Londyn, Wielka Brytania",region:"Europa"},{label:"Madera, Portugalia",region:"Europa"},{label:"Madryt, Hiszpania",region:"Europa"},{label:"Majorka, Hiszpania",region:"Europa"},{label:"Malaga, Hiszpania",region:"Europa"},{label:"Malta",region:"Europa"},{label:"Mediolan, Włochy",region:"Europa"},{label:"Neapol, Włochy",region:"Europa"},{label:"Nicea, Francja",region:"Europa"},{label:"Norwegia",region:"Europa"},{label:"Pafos, Cypr",region:"Europa"},{label:"Paryż, Francja",region:"Europa"},{label:"Porto, Portugalia",region:"Europa"},{label:"Praga, Czechy",region:"Europa"},{label:"Reykjavik, Islandia",region:"Europa"},{label:"Rodos, Grecja",region:"Europa"},{label:"Rzym, Włochy",region:"Europa"},{label:"Santorini, Grecja",region:"Europa"},{label:"Sewilla, Hiszpania",region:"Europa"},{label:"Sycylia, Włochy",region:"Europa"},{label:"Teneryfa, Hiszpania",region:"Europa"},{label:"Wenecja, Włochy",region:"Europa"},{label:"Wiedeń, Austria",region:"Europa"},{label:"Włochy",region:"Europa"},{label:"Zadar, Chorwacja",region:"Europa"},{label:"Zurych, Szwajcaria",region:"Europa"},
  // Afryka
  {label:"Djerba, Tunezja",region:"Afryka"},{label:"Egipt",region:"Afryka"},{label:"Kair, Egipt",region:"Afryka"},{label:"Kapsztad, RPA",region:"Afryka"},{label:"Kenia",region:"Afryka"},{label:"Marrakesz, Maroko",region:"Afryka"},{label:"Marsa Alam, Egipt",region:"Afryka"},{label:"Mauritius",region:"Afryka"},{label:"Maroko",region:"Afryka"},{label:"RPA",region:"Afryka"},{label:"Seszele",region:"Afryka"},{label:"Tanzania",region:"Afryka"},{label:"Tunezja",region:"Afryka"},{label:"Zanzibar, Tanzania",region:"Afryka"},
  // Bliski Wschód
  {label:"Abu Dhabi, ZEA",region:"Bliski Wschód"},{label:"Doha, Katar",region:"Bliski Wschód"},{label:"Dubaj, ZEA",region:"Bliski Wschód"},{label:"Jordania",region:"Bliski Wschód"},{label:"Katar",region:"Bliski Wschód"},{label:"Oman",region:"Bliski Wschód"},{label:"Stambuł, Turcja",region:"Bliski Wschód"},{label:"Turcja",region:"Bliski Wschód"},{label:"ZEA",region:"Bliski Wschód",aliases:["Emiraty Arabskie","Zjednoczone Emiraty Arabskie"]},
  // Azja
  {label:"Bali, Indonezja",region:"Azja"},{label:"Bangkok, Tajlandia",region:"Azja"},{label:"Chiny",region:"Azja"},{label:"Filipiny",region:"Azja"},{label:"Hanoi, Wietnam",region:"Azja"},{label:"Ho Chi Minh, Wietnam",region:"Azja"},{label:"Hoi An, Wietnam",region:"Azja"},{label:"Indie",region:"Azja"},{label:"Indonezja",region:"Azja"},{label:"Japonia",region:"Azja"},{label:"Kambodża",region:"Azja"},{label:"Kioto, Japonia",region:"Azja"},{label:"Korea Południowa",region:"Azja"},{label:"Kuala Lumpur, Malezja",region:"Azja"},{label:"Malediwy",region:"Azja"},{label:"Malezja",region:"Azja"},{label:"Nepal",region:"Azja"},{label:"Pekin, Chiny",region:"Azja"},{label:"Phuket, Tajlandia",region:"Azja"},{label:"Singapur",region:"Azja"},{label:"Sri Lanka",region:"Azja"},{label:"Tajlandia",region:"Azja"},{label:"Tokio, Japonia",region:"Azja"},{label:"Wietnam",region:"Azja"},
  // Ameryka Północna i Karaiby
  {label:"Bahamy",region:"Ameryka Północna"},{label:"Cancún, Meksyk",region:"Ameryka Północna"},{label:"Dominikana",region:"Ameryka Północna"},{label:"Hawaje, USA",region:"Ameryka Północna"},{label:"Jamajka",region:"Ameryka Północna"},{label:"Kanada",region:"Ameryka Północna"},{label:"Kostaryka",region:"Ameryka Północna"},{label:"Kuba",region:"Ameryka Północna"},{label:"Los Angeles, USA",region:"Ameryka Północna"},{label:"Meksyk",region:"Ameryka Północna"},{label:"Miami, USA",region:"Ameryka Północna"},{label:"Nowy Jork, USA",region:"Ameryka Północna",aliases:["New York","NYC"]},{label:"San Francisco, USA",region:"Ameryka Północna"},{label:"Toronto, Kanada",region:"Ameryka Północna"},{label:"USA",region:"Ameryka Północna"},
  // Ameryka Południowa
  {label:"Argentyna",region:"Ameryka Południowa"},{label:"Brazylia",region:"Ameryka Południowa"},{label:"Buenos Aires, Argentyna",region:"Ameryka Południowa"},{label:"Chile",region:"Ameryka Południowa"},{label:"Kolumbia",region:"Ameryka Południowa"},{label:"Machu Picchu, Peru",region:"Ameryka Południowa"},{label:"Patagonia",region:"Ameryka Południowa"},{label:"Peru",region:"Ameryka Południowa"},{label:"Rio de Janeiro, Brazylia",region:"Ameryka Południowa"},
  // Australia i Oceania
  {label:"Australia",region:"Australia i Oceania"},{label:"Auckland, Nowa Zelandia",region:"Australia i Oceania"},{label:"Fidżi",region:"Australia i Oceania"},{label:"Melbourne, Australia",region:"Australia i Oceania"},{label:"Nowa Zelandia",region:"Australia i Oceania"},{label:"Sydney, Australia",region:"Australia i Oceania"},{label:"Tahiti, Polinezja Francuska",region:"Australia i Oceania"}
].sort((a,b)=>a.label.localeCompare(b.label,"pl"));

export const worldDestinationOptions = WORLD_DESTINATIONS.map(x=>x.label);

export function normalizeDestination(value:string){
  return String(value||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim();
}

export function destinationMatches(query:string, item:WorldDestination){
  const q=normalizeDestination(query);
  if(!q) return true;
  return [item.label,item.region,...(item.aliases||[])].some(v=>normalizeDestination(v).includes(q));
}
