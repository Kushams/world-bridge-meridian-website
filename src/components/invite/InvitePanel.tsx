"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/supabase/AuthProvider";
import { SITE_URL } from "@/data/company";
import { Button } from "@/components/ui/Button";
import { AccountGate } from "@/components/account/AccountGate";
import { INVITE_REWARD, fmtUsd } from "@/lib/credits";

interface Invite {
  id: string;
  inviter_id: string;
  invitee_label: string;
  status: "signed_up" | "completed";
  created_at: string;
}

const fmt = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

function Inner() {
  const { user } = useAuth();
  const [code, setCode] = useState<string | null>(null);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [failed, setFailed] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase || !user) return;
    let cancelled = false;
    (async () => {
      const [c, i] = await Promise.all([
        supabase.rpc("my_invite_code"),
        supabase.from("invites").select("id, inviter_id, invitee_label, status, created_at").order("created_at", { ascending: false }),
      ]);
      if (cancelled) return;
      if (c.error || typeof c.data !== "string") setFailed(true);
      else setCode(c.data);
      setInvites(Array.isArray(i.data) ? (i.data as Invite[]) : []);
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (failed) return <p className="text-sm text-stone-dim">We couldn&apos;t load your invite link just now. Please try again in a moment.</p>;
  if (!code) return <p className="text-sm text-stone-dim">Getting your invite link…</p>;

  const link = `${SITE_URL}/invite?ref=${code}`;
  const sent = invites.filter((i) => i.inviter_id === user?.id);
  const earned = sent.filter((i) => i.status === "completed").length * INVITE_REWARD;
  const mailto = `mailto:?subject=${encodeURIComponent("A travel gift for you")}&body=${encodeURIComponent(`Join World Bridge Meridian with my link and we both get ${fmtUsd(INVITE_REWARD)} in Promo Credits after your first completed journey: ${link}`)}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* the link is visible and selectable anyway */
    }
  }

  return (
    <div className="mx-auto max-w-2xl rounded-card border hairline bg-charcoal p-6 md:p-8">
      <p className="eyebrow">Your invite link</p>
      <div className="mt-3 flex flex-col gap-3 sm:flex-row">
        <input readOnly value={link} aria-label="Your invite link" onFocus={(e) => e.currentTarget.select()} className="min-w-0 flex-1 rounded-card border hairline bg-ink px-4 py-3 text-sm text-ivory" />
        <Button type="button" onClick={copy}>{copied ? "Copied" : "Copy link"}</Button>
      </div>
      <p className="mt-3 text-sm text-stone">
        Your code: <span className="font-semibold tracking-wider text-ivory">{code}</span> ·{" "}
        <a href={mailto} className="underline underline-offset-4">Share by email</a>
      </p>

      <div className="mt-6 grid grid-cols-3 gap-3 text-center">
        {[
          { l: "Friends joined", v: sent.length },
          { l: "Completed", v: sent.filter((i) => i.status === "completed").length },
          { l: "Promo Credits earned", v: fmtUsd(earned) },
        ].map((s) => (
          <div key={s.l} className="rounded-card border hairline p-3">
            <p className="font-display text-xl text-ivory">{s.v}</p>
            <p className="mt-1 text-[0.7rem] uppercase tracking-wide text-stone-dim">{s.l}</p>
          </div>
        ))}
      </div>

      {sent.length > 0 ? (
        <ul className="mt-6 divide-y divide-line border-t hairline text-sm">
          {sent.map((i) => (
            <li key={i.id} className="flex items-center justify-between gap-3 py-3">
              <span className="min-w-0 truncate text-ivory">{i.invitee_label}</span>
              <span className="shrink-0 text-xs text-stone-dim">
                {i.status === "completed" ? "Reward added" : `Joined ${fmt(i.created_at)} · waiting for their first journey`}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
      {invites.some((i) => i.inviter_id !== user?.id) ? (
        <p className="mt-6 text-sm text-gold">You joined through a friend&apos;s invite. You both get {fmtUsd(INVITE_REWARD)} after your first completed journey.</p>
      ) : null}
    </div>
  );
}

/** The signed-in part of the Invite Program page. */
export function InvitePanel() {
  return (
    <AccountGate
      title="Sign up to join the Invite Program"
      intro="Create a free account (Google or email) to get your personal invite link. Anyone who joins through your link and completes a journey earns you both Promo Credits."
    >
      <Inner />
    </AccountGate>
  );
}
