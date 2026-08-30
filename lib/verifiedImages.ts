export const verifiedImages: Record<string, string> = {
  "Malta": "https://images.unsplash.com/photo-1756641157225-4a6517e48973?auto=format&fit=crop&fm=jpg&q=80&w=1600",
  "Barcelona": "https://images.unsplash.com/photo-1776770765859-cca1ac470e8a?auto=format&fit=crop&fm=jpg&q=80&w=1600",
  "Djerba": "https://images.unsplash.com/photo-1658847915960-b746e5e44197?auto=format&fit=crop&fm=jpg&q=80&w=1600",
  "Bergamo": "https://images.unsplash.com/photo-1767733443971-b62a56fe9918?auto=format&fit=crop&fm=jpg&q=80&w=1600",
};

export function getVerifiedImage(city: string) {
  return verifiedImages[city] || "";
}
