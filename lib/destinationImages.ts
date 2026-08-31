export type DestinationImageRule = {
  landmark: string;
  query: string;
};

const rules: Record<string, DestinationImageRule> = {
  "malta": { landmark: "Valletta Grand Harbour", query: "Valletta Grand Harbour Malta travel landscape" },
  "barcelona": { landmark: "Sagrada Familia", query: "Sagrada Familia Barcelona Spain travel landscape" },
  "djerba": { landmark: "Djerba coast", query: "Djerba Tunisia white houses turquoise water travel landscape" },
  "bergamo": { landmark: "Citta Alta", query: "Bergamo Citta Alta Italy panorama travel" },
  "hurghada": { landmark: "Red Sea marina", query: "Hurghada marina Red Sea Egypt travel landscape" },
  "kreta": { landmark: "Balos Lagoon", query: "Balos Lagoon Crete Greece travel landscape" },
  "porto": { landmark: "Ribeira and Dom Luis I", query: "Porto Ribeira Dom Luis I Portugal travel landscape" },
  "rzym": { landmark: "Colosseum", query: "Colosseum Rome Italy travel landscape" },
  "alicante": { landmark: "Santa Barbara Castle", query: "Castillo Santa Barbara Alicante Spain sea travel landscape" },
  "pafos": { landmark: "Petra tou Romiou", query: "Petra tou Romiou Paphos Cyprus travel landscape" },
  "londyn": { landmark: "Big Ben Westminster", query: "Big Ben Westminster London UK travel landscape" },
  "praga": { landmark: "Charles Bridge and Prague Castle", query: "Charles Bridge Prague Castle Czechia travel landscape" },
  "wieden": { landmark: "Schonbrunn", query: "Schonbrunn Vienna Austria travel landscape" },
  "budapeszt": { landmark: "Parliament on Danube", query: "Hungarian Parliament Danube Budapest travel landscape" },
  "paryz": { landmark: "Eiffel Tower", query: "Eiffel Tower Paris France travel landscape" },
  "lizbona": { landmark: "yellow tram", query: "Lisbon yellow tram Portugal city panorama travel" },
  "marrakesz": { landmark: "Koutoubia", query: "Koutoubia Marrakech Morocco travel landscape" },
  "antalya": { landmark: "old town cliffs", query: "Antalya old town cliffs Turkey Mediterranean travel landscape" },
  "sloneczny brzeg": { landmark: "Black Sea beach", query: "Sunny Beach Bulgaria Black Sea travel landscape" },
  "hammamet": { landmark: "medina and sea", query: "Hammamet medina sea Tunisia travel landscape" },
  "teneryfa": { landmark: "Teide", query: "Mount Teide Tenerife Spain travel landscape" },
  "fuerteventura": { landmark: "dunes and Atlantic", query: "Fuerteventura dunes beach Atlantic Spain travel landscape" },
  "rodos": { landmark: "Rhodes Old Town", query: "Rhodes Old Town Greece travel landscape" },
  "riwiera albanska": { landmark: "Albanian Riviera", query: "Albanian Riviera turquoise coast travel landscape" },
  "split": { landmark: "Diocletian Palace and Riva", query: "Split Diocletian Palace Riva Croatia travel landscape" },
  "neapol": { landmark: "Naples and Vesuvius", query: "Naples Vesuvius Italy panorama travel landscape" },
  "sewilla": { landmark: "Plaza de Espana", query: "Plaza de Espana Seville Spain travel landscape" },
  "amsterdam": { landmark: "canals", query: "Amsterdam canals Netherlands travel landscape" },
  "kopenhaga": { landmark: "Nyhavn", query: "Nyhavn Copenhagen Denmark travel landscape" },
  "dubaj": { landmark: "Burj Khalifa", query: "Burj Khalifa Dubai UAE skyline travel" },
  "marsa alam": { landmark: "Red Sea reef", query: "Marsa Alam Red Sea reef turquoise water Egypt travel landscape" },
  "bodrum": { landmark: "white houses and marina", query: "Bodrum white houses marina Turkey travel landscape" },
  "sycylia": { landmark: "Etna", query: "Mount Etna Sicily Italy travel landscape" },
  "majorka": { landmark: "Palma Cathedral and bay", query: "Palma Cathedral Mallorca Spain bay travel landscape" },
  "madera": { landmark: "Madeira cliffs", query: "Madeira Portugal mountains cliffs ocean travel landscape" },
  "malaga": { landmark: "Alcazaba and port", query: "Malaga Alcazaba port Spain travel landscape" },
};

function normalize(value: string) {
  return value
    .trim()
    .toLocaleLowerCase("pl")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function getDestinationImageRule(city: string, country: string): DestinationImageRule {
  const key = normalize(city);
  if (rules[key]) return rules[key];
  return {
    landmark: city,
    query: `${city} ${country} iconic view travel landscape`,
  };
}
