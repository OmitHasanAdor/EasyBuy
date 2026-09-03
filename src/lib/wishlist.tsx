"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import { authFetch } from "@/lib/auth-fetch";
import { API_URL } from "@/config/api";

const STORAGE_KEY = "easybuy-wishlist";

function readLocalWishlist(): number[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return [
      ...new Set(
        parsed.filter((id): id is number => typeof id === "number" && Number.isFinite(id) && id > 0)
      ),
    ];
  } catch {
    return [];
  }
}

function writeLocalWishlist(ids: number[]): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    return true;
  } catch {
    return false;
  }
}

type WishlistContextType = {
  ids: number[];
  toggle: (productId: number) => boolean;
  isWishlisted: (productId: number) => boolean;
  count: number;
};

const WishlistContext = createContext<WishlistContextType | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { data: session, isPending: sessionLoading } = authClient.useSession();
  const userId = session?.user?.id ?? null;
  const queryClient = useQueryClient();

  // Guest logged-out wishlist
  const [guestIds, setGuestIds] = useState<number[]>([]);
  useEffect(() => {
    setGuestIds(readLocalWishlist());
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setGuestIds(readLocalWishlist());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

// Logged-in wishlist
  const { data: serverWishlist = [] } = useQuery<{ productId: number }[]>({
    queryKey: ["wishlist", userId],
    queryFn: () => authFetch(`${API_URL}/api/wishlist`).then((res) => res.json()),
    enabled: !!userId,
  });
  const serverIds = serverWishlist.map((w) => w.productId);

  // Merge guest wishlist after login
  const mergedRef = useRef(false);
  useEffect(() => {
    if (!userId || mergedRef.current) return;
    mergedRef.current = true;
    const local = readLocalWishlist();
    if (local.length === 0) return;

    Promise.all(
      local.map((productId) =>
        authFetch(`${API_URL}/api/wishlist`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId }),
        })
      )
    ).then(() => {
      localStorage.removeItem(STORAGE_KEY);
      queryClient.invalidateQueries({ queryKey: ["wishlist", userId] });
    });
  }, [userId, queryClient]);

  const ids = userId ? serverIds : guestIds;

  const toggle = useCallback(
    (productId: number): boolean => {
      if (!Number.isFinite(productId) || productId <= 0) return false;

      if (userId) {
        const alreadyIn = serverIds.includes(productId);
        // Optimistic update
        queryClient.setQueryData<{ productId: number }[]>(["wishlist", userId], (old = []) =>
          alreadyIn ? old.filter((w) => w.productId !== productId) : [...old, { productId }]
        );
        const request = alreadyIn
          ? authFetch(`${API_URL}/api/wishlist/${productId}`, { method: "DELETE" })
          : authFetch(`${API_URL}/api/wishlist`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ productId }),
            });
        request
          .catch(() => {})
          .finally(() => queryClient.invalidateQueries({ queryKey: ["wishlist", userId] }));
        return true;
      }

      // Guest — localStorage only
      const next = guestIds.includes(productId)
        ? guestIds.filter((id) => id !== productId)
        : [...guestIds, productId];
      if (!writeLocalWishlist(next)) return false;
      setGuestIds(next);
      return true;
    },
    [userId, serverIds, guestIds, queryClient]
  );

  const isWishlisted = useCallback((productId: number) => ids.includes(productId), [ids]);

  // Prevent wishlist flicker while loading session
  if (sessionLoading) {
    return (
      <WishlistContext.Provider value={{ ids: [], toggle: () => false, isWishlisted: () => false, count: 0 }}>
        {children}
      </WishlistContext.Provider>
    );
  }

  return (
    <WishlistContext.Provider value={{ ids, toggle, isWishlisted, count: ids.length }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used inside WishlistProvider");
  return ctx;
}