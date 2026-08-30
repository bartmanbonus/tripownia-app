import legacyData from "@/data/legacy-content.json";

export type LegacyItem = {
  type: "page" | "post" | "product";
  path: string;
  title: string;
  description: string;
  html: string;
};

export const legacyItems = legacyData as LegacyItem[];
export const legacyByPath = new Map(legacyItems.map((item) => [item.path, item]));
export const legacyPosts = legacyItems.filter((item) => item.type === "post");

export function findLegacy(path: string) {
  const normalized = path !== "/" ? path.replace(/\/$/, "") : path;
  return legacyByPath.get(normalized);
}
