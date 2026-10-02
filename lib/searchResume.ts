export type SearchResumeContext = {
  savedAt: string;
  path: string;
  destinationInput: string;
  selectedDestinations: string[];
  departures: string[];
  activeTab: string;
  dateMode: "any" | "exact" | "month" | "range";
  month: string;
  dateFrom: string;
  dateTo: string;
  duration: string;
  budget: string;
  customBudgetMin: string;
  customBudgetMax: string;
  board: string;
  weekendOnly: boolean;
  resultSort: "recommended" | "price" | "rating" | "nights";
  resultView: "all" | "destinations";
};

export const SEARCH_RESUME_STORAGE_KEY = "tripownia-search-resume-v1";
export const SEARCH_RESUME_REQUEST_KEY = "tripownia-search-resume-request-v1";
export const SEARCH_RESUME_MAX_AGE_MS = 2 * 60 * 60 * 1000;

function safeString(value: unknown, max = 180) {
  return typeof value === "string" ? value.slice(0, max) : "";
}

function safeArray(value: unknown, maxItems = 12) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string" && Boolean(item.trim())).slice(0, maxItems)
    : [];
}

export function saveSearchResumeContext(input: Omit<SearchResumeContext, "savedAt">) {
  if (typeof window === "undefined") return;
  try {
    const payload: SearchResumeContext = {
      ...input,
      savedAt: new Date().toISOString(),
      path: input.path.startsWith("/") && !input.path.startsWith("//") ? input.path.slice(0, 300) : "/",
      destinationInput: input.destinationInput.slice(0, 180),
      selectedDestinations: input.selectedDestinations.slice(0, 12),
      departures: input.departures.slice(0, 12),
    };
    sessionStorage.setItem(SEARCH_RESUME_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Resume is an enhancement only; search must continue without storage.
  }
}

export function readSearchResumeContext() {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(SEARCH_RESUME_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) as Partial<SearchResumeContext> : null;
    const savedAt = parsed?.savedAt ? new Date(parsed.savedAt).getTime() : 0;
    if (!parsed || !savedAt || Date.now() - savedAt > SEARCH_RESUME_MAX_AGE_MS) {
      sessionStorage.removeItem(SEARCH_RESUME_STORAGE_KEY);
      return null;
    }

    const dateMode = ["any", "exact", "month", "range"].includes(String(parsed.dateMode))
      ? parsed.dateMode as SearchResumeContext["dateMode"]
      : "any";
    const resultSort = ["recommended", "price", "rating", "nights"].includes(String(parsed.resultSort))
      ? parsed.resultSort as SearchResumeContext["resultSort"]
      : "price";
    const resultView = parsed.resultView === "destinations" ? "destinations" : "all";
    const path = safeString(parsed.path, 300);

    return {
      savedAt: new Date(savedAt).toISOString(),
      path: path.startsWith("/") && !path.startsWith("//") ? path : "/",
      destinationInput: safeString(parsed.destinationInput),
      selectedDestinations: safeArray(parsed.selectedDestinations),
      departures: safeArray(parsed.departures),
      activeTab: safeString(parsed.activeTab, 60) || "Lot + hotel",
      dateMode,
      month: safeString(parsed.month, 7),
      dateFrom: safeString(parsed.dateFrom, 10),
      dateTo: safeString(parsed.dateTo, 10),
      duration: safeString(parsed.duration, 40) || "all",
      budget: safeString(parsed.budget, 40) || "all",
      customBudgetMin: safeString(parsed.customBudgetMin, 20),
      customBudgetMax: safeString(parsed.customBudgetMax, 20),
      board: safeString(parsed.board, 60) || "all",
      weekendOnly: Boolean(parsed.weekendOnly),
      resultSort,
      resultView,
    } satisfies SearchResumeContext;
  } catch {
    sessionStorage.removeItem(SEARCH_RESUME_STORAGE_KEY);
    return null;
  }
}

export function requestSearchResume() {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(SEARCH_RESUME_REQUEST_KEY, "1");
  } catch {}
}

export function consumeRequestedSearchResume() {
  if (typeof window === "undefined") return null;
  try {
    if (sessionStorage.getItem(SEARCH_RESUME_REQUEST_KEY) !== "1") return null;
    sessionStorage.removeItem(SEARCH_RESUME_REQUEST_KEY);
    return readSearchResumeContext();
  } catch {
    return null;
  }
}
