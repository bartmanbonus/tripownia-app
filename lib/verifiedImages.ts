export const verifiedImages: Record<string, string> = {
  "Malta": "https://images.unsplash.com/photo-1756641157225-4a6517e48973?auto=format&fit=crop&fm=jpg&q=80&w=1600",
  "Barcelona": "https://images.unsplash.com/photo-1776770765859-cca1ac470e8a?auto=format&fit=crop&fm=jpg&q=80&w=1600",
  "Djerba": "https://images.unsplash.com/photo-1734520655902-7d86cdfe268f?auto=format&fit=crop&fm=jpg&q=80&w=1600",
  "Bergamo": "https://images.unsplash.com/photo-1661857519018-e59569789e42?auto=format&fit=crop&fm=jpg&q=80&w=1600",
};

export function getVerifiedImage(city: string) {
  return verifiedImages[city] || "";
}
