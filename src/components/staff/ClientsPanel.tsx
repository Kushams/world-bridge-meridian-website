"use client";

import { useEffect, useMemo, useState } from "react";
import { assignClient, fmtDate, loadClients, loadTeam, staffName, type Client, type TeamMember } from "@/lib/staff";
import { inputClass } from "./RequestsPanel";
import { ClientHub } from "./ClientHub";

const UNASSIGNED = "__none";

function AssignBar({ client, team, onSaved }: { client: Client; team: TeamMember[]; onSaved: (staff: string | null) => void }) {
  const [value, setValue] = useState(client.assigned_to ?? "");
  const [msg, setMsg] = useState("");
  async function save(next: string) {
    setValue(next);
    setMsg("Saving…");
    const err = await assignClient(client.email, next || null);
    setMsg(err ? `Couldn't save: ${err}` : "Saved.");
    if (!err) onSaved(next || null);
  }
  return (
    <div className="mb-6 flex flex-wrap items-center gap-3 rounded-card border hairline px-5 py-3 text-sm">
      <label htmlFor="assign" className="text-stone">Looked after by</label>
      <select id="assign" value={value} onChange={(e) => save(e.target.value)} className={inputClass}>
        <option value="">Unassigned (admins only)</option>
        {team.map((m) => (
          <option key={m.email} value={m.email}>
            {staffName(m)}{m.role === "admin" ? " (admin)" : ""}
          </option>
        ))}
      </select>
      {msg ? <span className="text-xs text-stone-dim">{msg}</span> : null}
    </div>
  );
}

/** The accounts this staff member can see (admins: everyone). Click a person to open their page. */
export function ClientsPanel({ admin, selected, onSelect }: { admin: boolean; selected: string; onSelect: (email: string) => void }) {
  const [clients, setClients] = useState<Client[] | null | undefined>(undefined);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [q, setQ] = useState("");
  const [owner, setOwner] = useState("");

  useEffect(() => {
    let alive = true;
    loadClients().then((c) => alive && setClients(c));
    if (admin) loadTeam().then((t) => alive && setTeam(t));
    return () => {
      alive = false;
    };
  }, [admin]);

  const nameOf = (email: string | null) => {
    const m = team.find((t) => t.email === email);
    return m ? staffName(m) : email;
  };

  const shown = useMemo(() => {
    const n = q.trim().toLowerCase();
    return (clients ?? []).filter(
      (c) =>
        (!n || c.email.includes(n) || c.full_name?.toLowerCase().includes(n)) &&
        (!owner || (owner === UNASSIGNED ? !c.assigned_to : c.assigned_to === owner)),
    );
  }, [clients, q, owner]);

  if (clients === undefined) return <p className="text-sm text-stone-dim">Loading clients…</p>;
  if (clients === null) return <p className="text-sm text-red-400">Couldn&apos;t load clients. Refresh the page to try again.</p>;

  const current = clients.find((c) => c.email === selected);
  if (current) {
    return (
      <div>
        <button type="button" onClick={() => onSelect("")} className="mb-6 text-xs uppercase tracking-wide text-stone hover:text-ivory">
          ← All clients
        </button>
        {admin ? (
          <AssignBar
            key={current.email}
            client={current}
            team={team}
            onSaved={(staff) => setClients((cs) => cs?.map((c) => (c.email === current.email ? { ...c, assigned_to: staff } : c)))}
          />
        ) : null}
        <ClientHub client={current} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or email" className={`${inputClass} flex-1`} />
        {admin ? (
          <select value={owner} onChange={(e) => setOwner(e.target.value)} aria-label="Looked after by" className={inputClass}>
            <option value="">Everyone</option>
            <option value={UNASSIGNED}>Unassigned</option>
            {team.map((m) => (
              <option key={m.email} value={m.email}>
                {staffName(m)}&apos;s clients
              </option>
            ))}
          </select>
        ) : null}
      </div>
      <p className="mb-4 text-xs text-stone-dim">
        {shown.length} of {clients.length} accounts
      </p>
      {!clients.length && !admin ? (
        <p className="mb-4 text-sm text-stone">
          No clients yet. Clients who sign up through your personal link (above) appear here, and an admin can assign others to you.
        </p>
      ) : null}
      <ul className="divide-y divide-line rounded-card border hairline">
        {shown.map((c) => (
          <li key={c.id}>
            <button
              type="button"
              onClick={() => onSelect(c.email)}
              className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-ivory/5"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border hairline text-xs text-gold">
                {c.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.avatar_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  (c.full_name || c.email).slice(0, 2).toUpperCase()
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm text-ivory">{c.full_name || "No name yet"}</span>
                <span className="block truncate text-xs text-stone-dim">{c.email}</span>
              </span>
              <span className="hidden text-right text-xs text-stone-dim sm:block">
                {c.confirmed ? `Joined ${fmtDate(c.created_at)}` : "Email not confirmed"}
                {admin ? <span className="block text-gold">{c.assigned_to ? nameOf(c.assigned_to) : "Unassigned"}</span> : null}
              </span>
              <span aria-hidden className="text-stone">→</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
