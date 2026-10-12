"use client";

import { useEffect, useState } from "react";
import { loadPresence, loadTeam, loadTeamDirectory, personalLink, staffName, type DirectoryMember, type Presence, type TeamMember } from "@/lib/staff";

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
function ago(iso: string | null): string {
  if (!iso) return "";
  const m = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  if (m < 1440) return `${Math.round(m / 60)} h ago`;
  return `${Math.round(m / 1440)} d ago`;
}

export function TeamPanel() {
  const [team, setTeam] = useState<TeamMember[] | undefined>(undefined);
  const [presence, setPresence] = useState<Record<string, Presence>>({});

  useEffect(() => {
    let alive = true;
    const refresh = () =>
      loadPresence().then((list) => alive && list && setPresence(Object.fromEntries(list.map((p) => [p.email, p]))));
    refresh();
    const timer = window.setInterval(refresh, 30000);
    return () => {
      alive = false;
      window.clearInterval(timer);
    };
  }, []);

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
              <p className="flex flex-wrap items-center gap-2 text-sm text-ivory">
                {staffName(m)} <span className="text-xs uppercase tracking-wide text-gold">{m.role}</span>
                {presence[m.email] ? (
                  <span className={`inline-flex items-center gap-1.5 text-xs ${presence[m.email].online ? "text-emerald-600" : "text-stone-dim"}`}>
                    <span aria-hidden className={`h-2 w-2 rounded-full ${presence[m.email].online ? "bg-emerald-500" : "bg-stone-dim/50"}`} />
                    {presence[m.email].online ? "Online now" : presence[m.email].last_seen ? `Last seen ${ago(presence[m.email].last_seen)}` : "Hasn't signed in yet"}
                  </span>
                ) : null}
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

/** Staff (non-admins): the company and your colleagues. No client counts, links or other admins. */
export function StaffTeamList() {
  const [team, setTeam] = useState<DirectoryMember[] | null | undefined>(undefined);

  useEffect(() => {
    let alive = true;
    loadTeamDirectory().then((t) => alive && setTeam(t));
    return () => {
      alive = false;
    };
  }, []);

  if (team === undefined) return <p className="text-sm text-stone-dim">Loading team…</p>;
  if (team === null) return <p className="text-sm text-red-400">Couldn&apos;t load the team. Refresh the page to try again.</p>;

  return (
    <ul className="space-y-3">
      {team.map((m) => (
        <li key={m.email} className="rounded-[24px] border hairline bg-charcoal/40 px-5 py-4 shadow-sm">
          <p className="text-sm text-ivory">
            {m.name || m.email} <span className="text-xs uppercase tracking-wide text-gold">{m.role === "admin" ? "Admin" : "Staff"}</span>
          </p>
          <p className="text-xs text-stone-dim">
            {m.title ? `${m.title} · ` : ""}
            <a href={`mailto:${m.email}`} className="underline hover:text-ivory">{m.email}</a>
          </p>
        </li>
      ))}
    </ul>
  );
}
