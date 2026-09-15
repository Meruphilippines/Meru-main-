/**
 * Live Sync Notification Utility
 * Broadcasts an update signal to any open tabs/windows so the public website
 * immediately re-fetches without waiting for the next polling interval.
 */
export function notifyLiveUpdate(channelName = "meru_live_updates") {
  if (typeof window === "undefined") return;

  try {
    if ("BroadcastChannel" in window) {
      const bc = new BroadcastChannel(channelName);
      bc.postMessage({ type: "LIVE_UPDATE", timestamp: Date.now() });
      setTimeout(() => {
        try {
          bc.close();
        } catch {
          // ignore
        }
      }, 500);
    }
  } catch {
    // ignore
  }

  try {
    localStorage.setItem("meru_live_update_ping", Date.now().toString());
  } catch {
    // ignore
  }

  try {
    window.dispatchEvent(
      new CustomEvent("meru_live_update", { detail: { timestamp: Date.now() } })
    );
  } catch {
    // ignore
  }
}
