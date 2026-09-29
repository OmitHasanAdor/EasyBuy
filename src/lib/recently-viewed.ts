"use client";

const STORAGE_KEY = "easybuy-recently-viewed";
const MAX_ITEMS = 10;

// Recently viewed IDs, newest first
function readRecentlyViewed(): number[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is number => typeof id === "number" && Number.isFinite(id) && id > 0);
  } catch {
    return [];
  }
}

// Track viewed products and keep the list limited
export function trackRecentlyViewed(productId: number) {
  if (typeof window === "undefined") return;
  if (!Number.isFinite(productId) || productId <= 0) return;

  const current = readRecentlyViewed();
  const next = [productId, ...current.filter((id) => id !== productId)].slice(0, MAX_ITEMS);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
  }
}

export function getRecentlyViewed(): number[] {
  return readRecentlyViewed();
}