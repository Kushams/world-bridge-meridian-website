"use client";

import { useState } from "react";
import { displayName, initials, useAuth } from "@/lib/supabase/AuthProvider";
import { DocumentsPanel } from "./DocumentsPanel";
import { EnquiriesPanel } from "./EnquiriesPanel";
import { ProfileForm, profileCompleteness } from "./ProfileForm";
import { UploadsPanel } from "./UploadsPanel";
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
        This removes your profile and saved journeys for good. Enquiries you&apos;ve already sent stay
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

/** The signed-in side of /my-world-bridge: profile, enquiries, saved journeys. */
export function AccountDashboard() {
  const { user, profile, signOut } = useAuth();
  const name = displayName(user, profile);
  const done = profileCompleteness(profile);

  const links = [
    { href: "#enquiries", label: "My Enquiries" },
    { href: "#documents", label: "Itineraries & Documents" },
    { href: "#send-documents", label: "Send Us Documents" },
    { href: "#saved", label: "Saved Journeys" },
    { href: "#profile-form", label: "Profile" },
  ];

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-6 rounded-card border hairline bg-charcoal p-6 sm:flex-row sm:items-center sm:p-8">
        <span
          aria-hidden
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-gold/60 font-display text-2xl text-gold"
        >
          {initials(name)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="eyebrow mb-1">Welcome back</p>
          <h2 className="truncate font-display text-2xl text-ivory md:text-3xl">{name}</h2>
          <p className="truncate text-sm text-stone-dim">{user?.email}</p>
          {done < 100 ? (
            <div className="mt-3 max-w-xs">
              <div className="flex justify-between text-[0.65rem] uppercase tracking-wide text-stone-dim">
                <span>Profile {done}% complete</span>
              </div>
              <div className="mt-1 h-1 rounded-full bg-line">
                <div className="h-1 rounded-full bg-gold transition-all" style={{ width: `${done}%` }} />
              </div>
            </div>
          ) : null}
        </div>
        <button
          type="button"
          onClick={() => signOut()}
          className="self-start rounded-full border hairline px-6 py-3 text-xs font-semibold uppercase tracking-wide text-ivory transition-colors hover:bg-ivory hover:text-ink sm:self-center"
        >
          Sign Out
        </button>
      </div>

      <nav aria-label="Account sections" className="chip-row flex flex-wrap gap-3">
        {links.map((l) => (
          <a
            key={l.href}
            href={l.href}
            className="rounded-full border border-line px-5 py-2 text-xs font-semibold uppercase tracking-wide text-ivory-dim transition-colors hover:border-gold hover:text-gold"
          >
            {l.label}
          </a>
        ))}
      </nav>

      <Section id="enquiries" eyebrow="My Enquiries" title="Where your requests stand">
        <EnquiriesPanel />
      </Section>

      <Section id="documents" eyebrow="Itineraries & Documents" title="Your travel documents">
        <DocumentsPanel />
      </Section>

      <Section id="send-documents" eyebrow="Send Us Documents" title="Passports and other files">
        <UploadsPanel />
      </Section>

      <Section id="saved" eyebrow="Saved Journeys" title="Your shortlist">
        <SavedJourneysPanel />
      </Section>

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

      <div className="border-t hairline pt-8">
        <DeleteAccount />
      </div>
    </div>
  );
}
