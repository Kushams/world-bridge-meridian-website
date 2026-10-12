"use client";

import { useEffect, useState } from "react";
import { disablePush, enablePush, pushState, sendTestPush, type PushState } from "@/lib/push";

const btn = "min-h-11 rounded-full px-5 text-xs font-semibold uppercase tracking-wide active:scale-[0.98] disabled:opacity-40";

/** Turn real push notifications on for this device (new messages, requests and payments, even when the page is closed). */
export function PushControl() {
  const [state, setState] = useState<PushState | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    let alive = true;
    pushState().then((s) => alive && setState(s));
    return () => {
      alive = false;
    };
  }, []);

  if (state === null || state === "unsupported") return null;

  async function turnOn() {
    setBusy(true);
    setMsg("");
    const err = await enablePush();
    setState(await pushState());
    setBusy(false);
    if (err) return setMsg(err);
    const test = await sendTestPush();
    setMsg(test ?? "Notifications are on. A test notification is on its way.");
  }

  async function turnOff() {
    setBusy(true);
    await disablePush();
    setState(await pushState());
    setBusy(false);
    setMsg("Notifications are off for this device.");
  }

  return (
    <div className="mb-4 rounded-2xl border border-gold/50 px-4 py-3">
      {state === "needs-install" ? (
        <p className="text-sm text-stone">
          <span className="text-ivory">To get push notifications on iPhone or iPad,</span> tap Share in Safari, choose <em>Add to Home Screen</em>, then open the staff page from the new icon and come back here.
        </p>
      ) : state === "blocked" ? (
        <p className="text-sm text-stone">
          <span className="text-ivory">Notifications are blocked for this site.</span> Allow them in your browser&apos;s site settings, then reload this page.
        </p>
      ) : state === "on" ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-ivory">Push notifications are on for this device ✓</p>
          <div className="flex gap-2">
            <button type="button" disabled={busy} onClick={async () => setMsg((await sendTestPush()) ?? "Test sent.")} className={`${btn} border border-line text-ivory hover:border-gold`}>
              Send a test
            </button>
            <button type="button" disabled={busy} onClick={turnOff} className={`${btn} text-stone hover:text-ivory`}>
              Turn off
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-stone">Get an alert when a client messages you, sends a request or pays, even when this page is closed.</p>
          <button type="button" disabled={busy} onClick={turnOn} className={`${btn} bg-ivory text-ink`}>
            {busy ? "Turning on…" : "Turn on notifications"}
          </button>
        </div>
      )}
      {msg ? <p role="status" className="mt-2 text-xs text-gold">{msg}</p> : null}
    </div>
  );
}
