"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { getSupabaseClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/supabase/AuthProvider";

type Status = "received" | "in_review" | "proposal_sent" | "confirmed" | "closed";

interface Enquiry {
  id: string;
  form_type: "contact" | "journey-request" | "travel-details";
  subject: string | null;
  submitted_at: string;
  status: Status;
  status_updated_at: string;
}

const STEPS: { key: Status; label: string }[] = [
  { key: "received", label: "Received" },
  { key: "in_review", label: "In review" },
  { key: "proposal_sent", label: "Proposal sent" },
  { key: "confirmed", label: "Confirmed" },
];

const TYPE_LABEL: Record<Enquiry["form_type"], string> = {
  contact: "Message",
  "journey-request": "Journey request",
  "travel-details": "Exhibition travel form",
};

const fmt = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

function StatusTrack({ status }: { status: Status }) {
  if (status === "closed") {
    return <p className="mt-4 text-xs uppercase tracking-wide text-stone-dim">Closed</p>;
  }
  const current = STEPS.findIndex((s) => s.key === status);
  return (
    <ol className="mt-4 grid grid-cols-4 gap-2" aria-label="Enquiry progress">
      {STEPS.map((s, i) => (
        <li key={s.key} aria-current={i === current ? "step" : undefined}>
          <span className={`block h-1 rounded-full ${i <= current ? "bg-gold" : "bg-line"}`} />
          <span className={`mt-2 block text-[0.65rem] uppercase tracking-wide ${i === current ? "text-gold" : "text-stone-dim"}`}>
            {s.label}
          </span>
        </li>
      ))}
    </ol>
  );
}

/**
 * Journey requests and forms this customer has sent, with the stage our team
 * has set. Rows are matched to the account by verified email address (see
 * supabase/profiles-enquiries.sql); staff change the Status column in Supabase.
 */
export function EnquiriesPanel() {
  const { user } = useAuth();
  const [items, setItems] = useState<Enquiry[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase || !user) return;
    let cancelled = false;
    supabase
      .from("form_submissions")
      .select("id, form_type, subject, submitted_at, status, status_updated_at")
      .order("submitted_at", { ascending: false })
      .limit(50)
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) setFailed(true);
        else setItems((data ?? []) as Enquiry[]);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (failed) {
    return (
      <p className="text-sm text-stone-dim">
        We couldn&apos;t load your enquiries just now. Please try again in a moment.
      </p>
    );
  }
  if (items === null) return <p className="text-sm text-stone-dim">Loading your enquiries…</p>;

  if (items.length === 0) {
    return (
      <div className="rounded-card border hairline bg-charcoal p-8 text-center">
        <h3 className="font-display text-xl text-ivory">No enquiries yet</h3>
        <p className="mx-auto mt-3 max-w-md text-sm text-stone leading-relaxed">
          Journey requests and forms you send from this email address will appear here, with their
          progress.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button href="/plan-your-journey">Plan Your Journey</Button>
          <Button href="/contact" variant="outline">Contact Us</Button>
        </div>
      </div>
    );
  }

  return (
    <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {items.map((e) => (
        <li key={e.id} className="rounded-card border hairline bg-charcoal p-6">
          <p className="eyebrow !text-[0.65rem]">{TYPE_LABEL[e.form_type] ?? "Enquiry"}</p>
          <h3 className="mt-1 font-display text-lg text-ivory leading-snug">{e.subject ?? TYPE_LABEL[e.form_type]}</h3>
          <p className="mt-1 text-xs text-stone-dim">
            Sent {fmt(e.submitted_at)}
            {e.status !== "received" ? ` · updated ${fmt(e.status_updated_at)}` : ""}
          </p>
          <StatusTrack status={e.status} />
        </li>
      ))}
    </ul>
  );
}
