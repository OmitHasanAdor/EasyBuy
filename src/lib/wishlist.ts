"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "easybuy-wishlist";
const WISHLIST_EVENT = "easybuy-wishlist-updated";

function readWishlist(): number[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);

    if (!Array.isArray(parsed)) return [];

    return [
      ...new Set(
        parsed.filter(
          (id): id is number =>
            typeof id === "number" &&
            Number.isFinite(id) &&
            id > 0
        )
      ),
    ];
  } catch {
    return [];
  }
}

function saveWishlist(ids: number[]) {
  if (typeof window === "undefined") return;

  const cleanIds = [...new Set(ids)];

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanIds));

    window.dispatchEvent(new Event(WISHLIST_EVENT));
  } catch {
    // Ignore localStorage errors.
  }
}

export function useWishlist() {
  const [ids, setIds] = useState<number[]>([]);

  useEffect(() => {
    setIds(readWishlist());

    const handleWishlistUpdate = () => {
      setIds(readWishlist());
    };

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) {
        setIds(readWishlist());
      }
    };

    window.addEventListener(WISHLIST_EVENT, handleWishlistUpdate);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener(WISHLIST_EVENT, handleWishlistUpdate);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const toggle = useCallback((productId: number) => {
    if (!Number.isFinite(productId) || productId <= 0) {
      return;
    }

    setIds((prev) => {
      const next = prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId];

      saveWishlist(next);

      return next;
    });
  }, []);

  const isWishlisted = useCallback(
    (productId: number) => ids.includes(productId),
    [ids]
  );

  return {
    ids,
    toggle,
    isWishlisted,
    count: ids.length,
  };
}