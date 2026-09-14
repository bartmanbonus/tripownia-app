export function normalizeDestinationKey(value: string) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function touristDestinationKey(offer: { city?: string; country?: string }) {
  const city = normalizeDestinationKey(offer.city || "");
  const country = normalizeDestinationKey(offer.country || "");
  const text = `${city} ${country}`;

  const groups: Array<[RegExp, string]> = [
    [/zanzibar|kiwengwa|matemwe|mangapwani|nungwi|kendwa|paje|jambiani|makunduchi/, "zanzibar"],
    [/durres|durrës|golem|shkembi|riwiera albanska|albania/, "riwiera-albanska"],
    [/malta|mellieha|sliema|st julian|saint julian|bugibba|qawra|valletta/, "malta"],
    [/teneryf|tenerife|costa adeje|playa de las americas|puerto de la cruz/, "teneryfa"],
    [/fuerteventura|corralejo|costa calma|morro jable|caleta de fuste/, "fuerteventura"],
    [/gran canaria|maspalomas|playa del ingles|puerto rico/, "gran-canaria"],
    [/lanzarote|puerto del carmen|playa blanca|costa teguise/, "lanzarote"],
    [/djerba|dzerba|midoun|zarzis/, "djerba"],
    [/hammamet|yasmine hammamet/, "hammamet"],
    [/hurghada|makadi bay|soma bay|sahl hasheesh/, "hurghada"],
    [/marsa alam|port ghalib|el quseir/, "marsa-alam"],
    [/sharm el sheikh|sharm|nabq bay/, "sharm-el-sheikh"],
    [/rodos|rhodes|faliraki|kolymbia|lindos/, "rodos"],
    [/kreta|crete|heraklion|hersonissos|malia|rethymno|chania/, "kreta"],
    [/majorka|mallorca|palma de mallorca|alcudia|magaluf/, "majorka"],
    [/cypr|cyprus|pafos|paphos|larnaka|larnaca|ayia napa|protaras/, "cypr"],
    [/mauritius/, "mauritius"],
    [/malediw|maldives/, "malediwy"],
    [/seszel|seychelles/, "seszele"],
  ];

  for (const [pattern, key] of groups) {
    if (pattern.test(text)) return key;
  }

  return `${city}|${country}`;
}
