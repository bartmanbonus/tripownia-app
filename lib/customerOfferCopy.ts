export function customerOfferReason(value: string | undefined | null) {
  let text = String(value || "").trim();

  text = text
    .replace(/\b(?:TUI|EXIM(?:\s+TOURS)?|Booking(?:\.com)?|Kiwi(?:\.com)?|Wakacje\.pl|Travelpayouts|Aviasales|Tradedoubler)\b/gi, "")
    .replace(/\blink\s+afiliacyjny(?:\s+Tripowni)?\b/gi, "")
    .replace(/\b(?:u|do)\s+partnera\b/gi, "przy rezerwacji")
    .replace(/\bpartner(?:a|em|owi)?\s+rezerwacyjny\b/gi, "")
    .replace(/\s+([,.;:])/g, "$1")
    .replace(/([,;:])\s*([,;:])/g, "$1")
    .replace(/\(\s*\)/g, "")
    .replace(/\s{2,}/g, " ")
    .replace(/^[-–—,:;\s]+|[-–—,:;\s]+$/g, "")
    .trim();

  if (!text) return "Konkretny termin i cena, które warto sprawdzić przed rezerwacją.";
  return text;
}

export function customerDealVerdict(value: string) {
  if (value === "BIERZ") return "Bardzo dobra cena";
  if (value === "DOBRA OPCJA") return "Dobra opcja";
  return "Do sprawdzenia";
}
