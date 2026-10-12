import { getSupabaseClient } from "@/lib/supabase/client";

/** off = can turn on; on = this device is subscribed; blocked = browser permission refused; needs-install = iPhone/iPad: add to Home Screen first. */
export type PushState = "unsupported" | "needs-install" | "blocked" | "off" | "on";

const isIos = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
const isStandalone = () => window.matchMedia("(display-mode: standalone)").matches || (navigator as unknown as { standalone?: boolean }).standalone === true;

export async function pushState(): Promise<PushState> {
  if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
    return isIos() && !isStandalone() ? "needs-install" : "unsupported";
  }
  if (Notification.permission === "denied") return "blocked";
  const reg = await navigator.serviceWorker.getRegistration("/sw.js");
  const sub = await reg?.pushManager.getSubscription();
  return sub && Notification.permission === "granted" ? "on" : "off";
}

const toKey = (b64: string) => {
  const raw = atob((b64 + "=".repeat((4 - (b64.length % 4)) % 4)).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
};

async function call(body: Record<string, unknown>): Promise<{ ok?: boolean; publicKey?: string; sent?: number; error?: string }> {
  const supabase = getSupabaseClient();
  if (!supabase) return { error: "Not available right now." };
  const { data, error } = await supabase.functions.invoke("staff-push", { body });
  if (error) return { error: "The notification service isn't reachable. Try again in a moment." };
  return (data ?? {}) as { ok?: boolean; publicKey?: string; sent?: number; error?: string };
}

/** Asks permission, subscribes this device and saves the subscription. Returns an error message, or null on success. */
export async function enablePush(): Promise<string | null> {
  try {
    const perm = await Notification.requestPermission();
    if (perm !== "granted") return "Notifications were not allowed. You can allow them in your browser's site settings.";
    const keyRes = await call({ action: "key" });
    if (!keyRes.publicKey) return keyRes.error ?? "Couldn't get the notification key.";
    const reg = await navigator.serviceWorker.register("/sw.js");
    await navigator.serviceWorker.ready;
    const existing = await reg.pushManager.getSubscription();
    const sub = existing ?? (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: toKey(keyRes.publicKey) }));
    const saved = await call({ action: "subscribe", subscription: sub.toJSON() });
    return saved.ok ? null : (saved.error ?? "Couldn't save this device.");
  } catch (e) {
    return `Couldn't turn notifications on: ${e instanceof Error ? e.message : "unknown error"}`;
  }
}

export async function disablePush(): Promise<void> {
  const reg = await navigator.serviceWorker.getRegistration("/sw.js");
  const sub = await reg?.pushManager.getSubscription();
  if (sub) {
    await call({ action: "unsubscribe", endpoint: sub.endpoint });
    await sub.unsubscribe();
  }
}

export async function sendTestPush(): Promise<string | null> {
  const r = await call({ action: "test" });
  if (!r.ok) return r.error ?? "The test didn't send.";
  return r.sent ? null : "No device is registered yet. Turn notifications on first.";
}
