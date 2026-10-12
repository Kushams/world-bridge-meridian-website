"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useAuth } from "@/lib/supabase/AuthProvider";
import { ProfileHero } from "./ProfileHero";
import { DocumentsPanel } from "./DocumentsPanel";
import { EnquiriesPanel } from "./EnquiriesPanel";
import { ProfileForm } from "./ProfileForm";
import { TravelCreditsPanel } from "./TravelCreditsPanel";
import { SavedJourneysPanel } from "./SavedJourneysPanel";
import { InvoicesPanel } from "./InvoicesPanel";
import { MessagesPanel } from "./MessagesPanel";
import { latestStaffMessageAt } from "@/lib/messages";
import { CARD_PAYMENTS_ENABLED } from "@/data/cardPayments";
import { MobileCollapse } from "@/components/ui/MobileCollapse";

function Section({ id, eyebrow, title, children }: { id: string; eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-28 border-t hairline pt-10">
      <p className="eyebrow mb-2">{eyebrow}</p>
      <h2 className="mb-6 font-display text-2xl text-ivory md:text-3xl">{title}</h2>
      {children}
    </section>
  );
}

function DeleteAccount() {
  const { deleteAccount } = useAuth();
  const [step, setStep] = useState<"idle" | "confirm" | "deleting" | "error">("idle");
  const [error, setError] = useState("");

  if (step === "idle") {
    return (
      <button
        type="button"
        onClick={() => setStep("confirm")}
        className="text-xs text-stone-dim underline transition-colors hover:text-ivory"
      >
        Delete my account
      </button>
    );
  }
  return (
    <div className="max-w-md rounded-card border hairline p-5">
      <p className="text-sm text-ivory">Delete your account?</p>
      <p className="mt-2 text-xs text-stone leading-relaxed">
        This removes your profile and saved journeys for good, and any Travel Credits or Promo Credits you hold are lost with it. Enquiries you&apos;ve already sent stay
        on file with our team so we can finish looking after them.
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          disabled={step === "deleting"}
          onClick={async () => {
            setStep("deleting");
            const result = await deleteAccount();
            if (!result.ok) {
              setStep("error");
              setError(result.error ?? "Something went wrong.");
            }
          }}
          className="rounded-full bg-ivory px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-ink hover:opacity-90 disabled:opacity-50"
        >
          {step === "deleting" ? "Deleting…" : "Yes, delete it"}
        </button>
        <button type="button" onClick={() => setStep("idle")} className="text-xs text-stone-dim underline hover:text-ivory">
          Keep my account
        </button>
      </div>
      {step === "error" ? <p className="mt-3 text-xs text-red-400">{error}</p> : null}
    </div>
  );
}

type Tab = "profile" | "messages" | "wallet" | "invoices";
const WALLET_HASHES = new Set(["wallet", "travel-credits", "gift-cards", "redeem-code"]);
const INVOICE_HASHES = new Set(["invoices"]);
const MESSAGE_HASHES = new Set(["messages", "inbox"]);
const TABS: { key: Tab; label: string }[] = [
  { key: "profile", label: "Profile" },
  { key: "messages", label: "Inbox" },
  { key: "wallet", label: "Wallet" },
  ...(CARD_PAYMENTS_ENABLED ? [{ key: "invoices" as const, label: "Invoices" }] : []),
];

function subscribeHash(cb: () => void) {
  window.addEventListener("hashchange", cb);
  return () => window.removeEventListener("hashchange", cb);
}
const currentTab = (): Tab => {
  const h = window.location.hash.slice(1);
  if (CARD_PAYMENTS_ENABLED && INVOICE_HASHES.has(h)) return "invoices";
  if (MESSAGE_HASHES.has(h)) return "messages";
  return WALLET_HASHES.has(h) ? "wallet" : "profile";
};

/** True when our team has written since the client last had the Messages tab open (remembered in this browser). */
function useUnreadFromTeam(email: string | undefined, onMessagesTab: boolean) {
  const [unread, setUnread] = useState(false);
  useEffect(() => {
    if (!email) return;
    const key = `wbm-msgs-seen:${email.toLowerCase()}`;
    let alive = true;
    const check = async () => {
      if (document.visibilityState !== "visible") return;
      let seen = "";
      try {
        if (onMessagesTab) window.localStorage.setItem(key, new Date().toISOString());
        seen = window.localStorage.getItem(key) ?? "";
      } catch {
        // Storage blocked: treat as seen so we never nag.
        seen = new Date().toISOString();
      }
      const latest = await latestStaffMessageAt(email);
      if (alive) setUnread(Boolean(latest && !onMessagesTab && (!seen || latest > seen)));
    };
    check();
    const timer = window.setInterval(check, 60000);
    document.addEventListener("visibilitychange", check);
    return () => {
      alive = false;
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", check);
    };
  }, [email, onMessagesTab]);
  return unread;
}

/** The signed-in side of /my-world-bridge: Profile (details, enquiries, saved), Messages, Wallet and Invoices tabs. */
export function AccountDashboard() {
  const tab = useSyncExternalStore(subscribeHash, currentTab, () => "profile" as Tab);
  const { user } = useAuth();
  const unread = useUnreadFromTeam(user?.email ?? undefined, tab === "messages");

  // Links such as /my-world-bridge#redeem-code open the Wallet tab; once it has rendered, scroll to the spot.
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (!id) return;
    const t = setTimeout(() => document.getElementById(id)?.scrollIntoView({ block: "start" }), 50);
    return () => clearTimeout(t);
  }, [tab]);

  function choose(next: Tab) {
    if (next === tab) return;
    window.history.pushState(null, "", `${window.location.pathname}#${next}`);
    window.dispatchEvent(new HashChangeEvent("hashchange"));
    document.getElementById("account-tabs")?.scrollIntoView({ block: "start" });
  }

  return (
    <div className="space-y-8">
      <ProfileHero />

      <div className="sticky top-[4.4rem] z-30 -mx-1 bg-ink/95 px-1 py-2 backdrop-blur">
      <div id="account-tabs" role="tablist" aria-label="Account sections" className={`scroll-mt-40 grid gap-1 rounded-full border border-line bg-ink p-1 sm:inline-grid ${TABS.length === 4 ? "grid-cols-4 sm:min-w-[38rem]" : "grid-cols-3 sm:min-w-[30rem]"}`}>
        {TABS.map(({ key: t, label }) => (
          <button
            key={t}
            type="button"
            role="tab"
            id={`tab-${t}`}
            aria-selected={tab === t}
            aria-controls={`panel-${t}`}
            onClick={() => choose(t)}
            className={`rounded-full px-1.5 py-2.5 text-[0.7rem] sm:px-6 sm:text-xs font-semibold uppercase tracking-wide transition-colors ${
              tab === t ? "bg-ivory text-ink" : "text-ivory-dim hover:text-gold"
            }`}
          >
            {label}
            {t === "messages" && unread ? <span aria-label="New message" className="ml-1.5 inline-block h-2 w-2 rounded-full bg-gold align-middle" /> : null}
          </button>
        ))}
      </div>
      </div>

      {tab !== "messages" ? (
        <button
          type="button"
          onClick={() => choose("messages")}
          className="fixed bottom-5 left-4 z-40 flex min-h-12 items-center gap-2 rounded-full bg-ivory px-5 text-xs font-semibold uppercase tracking-wide text-ink shadow-lg active:scale-95"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden>
            <path d="M4 5h16v11H9l-5 4z" />
          </svg>
          Inbox · message us
          {unread ? <span aria-label="New message" className="h-2.5 w-2.5 rounded-full bg-gold" /> : null}
        </button>
      ) : null}

      {tab === "messages" ? (
        <div role="tabpanel" id="panel-messages" aria-labelledby="tab-messages" className="space-y-10">
          <Section id="messages" eyebrow="Inbox" title="Your messages and updates">
            <MessagesPanel />
          </Section>
        </div>
      ) : tab === "invoices" ? (
        <div role="tabpanel" id="panel-invoices" aria-labelledby="tab-invoices" className="space-y-10">
          <Section id="invoices" eyebrow="Invoices" title="Invoices from your consultant">
            <InvoicesPanel />
          </Section>
        </div>
      ) : tab === "wallet" ? (
        <div role="tabpanel" id="panel-wallet" aria-labelledby="tab-wallet" className="space-y-10">
          <span id="travel-credits" />
          <span id="gift-cards" />
          <TravelCreditsPanel />
        </div>
      ) : (
        <div role="tabpanel" id="panel-profile" aria-labelledby="tab-profile" className="space-y-10">
          <Section id="profile" eyebrow="Your Profile" title="Details and preferences">
            <p className="-mt-3 mb-2 max-w-2xl text-sm text-stone leading-relaxed">
              Keep these up to date and our journey planner and travel forms will fill them in for you.
            </p>
            <MobileCollapse label="Edit my details">
              <div id="profile-form" className="scroll-mt-28">
                <ProfileForm />
              </div>
            </MobileCollapse>
          </Section>

          <Section id="enquiries" eyebrow="My Enquiries" title="Where your requests stand">
            <EnquiriesPanel />
          </Section>

          <Section id="documents" eyebrow="Itineraries & Documents" title="Your travel documents">
            <DocumentsPanel />
          </Section>

          <Section id="saved" eyebrow="Saved Journeys" title="Your shortlist">
            <SavedJourneysPanel />
          </Section>

          <div className="border-t hairline pt-8">
            <DeleteAccount />
          </div>
        </div>
      )}
    </div>
  );
}
