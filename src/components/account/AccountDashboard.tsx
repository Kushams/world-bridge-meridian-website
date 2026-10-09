"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useAuth } from "@/lib/supabase/AuthProvider";
import { ProfileHero } from "./ProfileHero";
import { DocumentsPanel } from "./DocumentsPanel";
import { EnquiriesPanel } from "./EnquiriesPanel";
import { ProfileForm } from "./ProfileForm";
import { TravelCreditsPanel } from "./TravelCreditsPanel";
import { SavedJourneysPanel } from "./SavedJourneysPanel";
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

type Tab = "profile" | "wallet";
const WALLET_HASHES = new Set(["wallet", "travel-credits", "gift-cards", "redeem-code"]);

function subscribeHash(cb: () => void) {
  window.addEventListener("hashchange", cb);
  return () => window.removeEventListener("hashchange", cb);
}
const currentTab = (): Tab => (WALLET_HASHES.has(window.location.hash.slice(1)) ? "wallet" : "profile");

/** The signed-in side of /my-world-bridge: two tabs, Profile (details, enquiries, saved) and Wallet. */
export function AccountDashboard() {
  const tab = useSyncExternalStore(subscribeHash, currentTab, () => "profile" as Tab);

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
      <div id="account-tabs" role="tablist" aria-label="Account sections" className="scroll-mt-40 grid grid-cols-2 gap-1 rounded-full border border-line bg-ink p-1 sm:inline-grid sm:min-w-[22rem]">
        {(["profile", "wallet"] as const).map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            id={`tab-${t}`}
            aria-selected={tab === t}
            aria-controls={`panel-${t}`}
            onClick={() => choose(t)}
            className={`rounded-full px-6 py-2.5 text-xs font-semibold uppercase tracking-wide transition-colors ${
              tab === t ? "bg-ivory text-ink" : "text-ivory-dim hover:text-gold"
            }`}
          >
            {t === "profile" ? "Profile" : "Wallet"}
          </button>
        ))}
      </div>
      </div>

      {tab === "wallet" ? (
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
