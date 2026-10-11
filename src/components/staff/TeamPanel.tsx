"use client";

import { useEffect, useState } from "react";
import { loadTeam, personalLink, staffName, type TeamMember } from "@/lib/staff";

export function CopyLink({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={() => navigator.clipboard?.writeText(text).then(() => setDone(true))}
      className="rounded-full border border-line px-3 py-1 text-xs font-semibold uppercase tracking-wide text-ivory hover:border-gold"
    >
      {done ? "Copied" : "Copy"}
    </button>
  );
}

/** Admins: everyone on the staff list, their personal links and how many clients they look after. */
export function TeamPanel() {
  const [team, setTeam] = useState<TeamMember[] | undefined>(undefined);

  useEffect(() => {
    let alive = true;
    loadTeam().then((t) => alive && setTeam(t));
    return () => {
      alive = false;
    };
  }, []);

  if (!team) return <p className="text-sm text-stone-dim">Loading team…</p>;

  return (
    <div className="max-w-4xl">
      <p className="mb-4 text-sm text-stone">
        Admins see every client. Staff see only their own: clients who sign up or sign in after opening that staff
        member&apos;s personal link, plus anyone you assign to them from a client&apos;s page (&quot;Looked after by&quot;).
      </p>
      <ul className="divide-y divide-line rounded-card border hairline">
        {team.map((m) => (
          <li key={m.email} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
            <div className="min-w-0">
              <p className="text-sm text-ivory">
                {staffName(m)} <span className="text-xs uppercase tracking-wide text-gold">{m.role}</span>
              </p>
              <p className="text-xs text-stone-dim">
                {m.email}
                {m.role === "staff" ? ` · ${m.clients} client${m.clients === 1 ? "" : "s"}` : " · sees every client"}
              </p>
            </div>
            {m.link_code ? (
              <div className="flex items-center gap-2 text-xs text-stone">
                {personalLink(m.link_code)}
                <CopyLink text={personalLink(m.link_code)} />
              </div>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
