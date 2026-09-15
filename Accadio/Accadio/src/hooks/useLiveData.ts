/**
 * useLiveData – provides reactive, near-instant live updating for public website pages.
 * - Polls on a tight interval (default 5 seconds).
 * - Immediately re-fetches when browser tab/window gains focus.
 * - Immediately re-fetches when tab becomes visible.
 * - Listens to BroadcastChannel and window storage events dispatched by admin edits.
 * - Busts browser HTTP caches with `_t` timestamp parameter and cache-control headers.
 */
import { useState, useEffect, useRef, useCallback } from "react";

export function useLiveData<T>(
  url: string,
  intervalMs = 5000
): { data: T | null; loading: boolean; refresh: () => void } {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const isMounted = useRef(true);
  const lastFetchedDataRef = useRef<string>("");

  const fetchData = useCallback(async () => {
    if (!url) return;
    try {
      const separator = url.includes("?") ? "&" : "?";
      const cacheBustUrl = `${url}${separator}_t=${Date.now()}`;

      const res = await fetch(cacheBustUrl, {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
        },
      });

      if (!res.ok) return;

      const json = await res.json();
      const serialized = JSON.stringify(json);

      if (isMounted.current) {
        // Only trigger React state update if the data actually changed
        if (serialized !== lastFetchedDataRef.current) {
          lastFetchedDataRef.current = serialized;
          setData(json);
        }
      }
    } catch (err) {
      console.error(`[useLiveData] Error fetching ${url}:`, err);
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    isMounted.current = true;

    // Initial load
    fetchData();

    // 1. Polling interval (default 5s)
    const timer = setInterval(fetchData, intervalMs);

    // 2. Tab / Window Focus
    const handleFocus = () => {
      fetchData();
    };
    window.addEventListener("focus", handleFocus);

    // 3. Tab Visibility Change
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        fetchData();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    // 4. Cross-tab/window BroadcastChannel
    let bc: BroadcastChannel | null = null;
    try {
      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        bc = new BroadcastChannel("meru_live_updates");
        bc.onmessage = () => {
          fetchData();
        };
      }
    } catch {
      // ignore
    }

    // 5. Cross-tab/window Storage Event
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "meru_live_update_ping") {
        fetchData();
      }
    };
    window.addEventListener("storage", handleStorage);

    // 6. Same-window CustomEvent dispatched by notifyLiveUpdate()
    const handleCustomUpdate = () => {
      fetchData();
    };
    window.addEventListener("meru_live_update", handleCustomUpdate);

    return () => {
      isMounted.current = false;
      clearInterval(timer);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("meru_live_update", handleCustomUpdate);
      if (bc) {
        try {
          bc.close();
        } catch {
          // ignore
        }
      }
    };
  }, [fetchData, intervalMs]);

  return { data, loading, refresh: fetchData };
}
