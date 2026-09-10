/** One exact request. Empty matches never trigger a second, broader query. */
export async function requestCatalog(params: URLSearchParams, signal?: AbortSignal, fetcher: typeof fetch = fetch) {
  const response = await fetcher(`/api/catalog?${params.toString()}`, { cache: "no-store", signal });
  const data = await response.json();
  if (!response.ok || data?.ok !== true) throw new Error(data?.error || "Nie udało się pobrać katalogu.");
  if (!Array.isArray(data.offers) || !Number.isSafeInteger(data.totalMatches) || data.totalMatches < data.offers.length || data.broadened !== false) throw new Error("Nieprawidłowa odpowiedź katalogu.");
  return data;
}
