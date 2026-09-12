import legacyData from "@/data/legacy-content.json";

export type LegacyItem = {
  type: "page" | "post" | "product";
  path: string;
  title: string;
  description: string;
  html: string;
};

export const legacyItems = legacyData as LegacyItem[];

export function legacyCanonicalPath(path: string) {
  const normalized = path !== "/" ? path.replace(/\/$/, "") : path;
  if (normalized.endsWith("/post_id")) {
    const cleanPath = normalized.slice(0, -"/post_id".length);
    return cleanPath || "/";
  }
  return normalized;
}

export const legacyByPath = new Map<string, LegacyItem>();
for (const item of legacyItems) {
  const originalPath = item.path !== "/" ? item.path.replace(/\/$/, "") : item.path;
  const canonicalPath = legacyCanonicalPath(originalPath);
  legacyByPath.set(originalPath, item);
  legacyByPath.set(canonicalPath, item);
}

export const legacyPosts = legacyItems.filter((item) => item.type === "post");

export function findLegacy(path: string) {
  const normalized = path !== "/" ? path.replace(/\/$/, "") : path;
  return legacyByPath.get(normalized) || legacyByPath.get(legacyCanonicalPath(normalized));
}
