"use client";

import { useEffect, useMemo, useState } from "react";
import { fmtDate, loadClients, type Client } from "@/lib/staff";
import { inputClass } from "./RequestsPanel";
import { ClientHub } from "./ClientHub";

/** Everyone with an account. Click a person to open their page. */
export function ClientsPanel({ selected, onSelect }: { selected: string; onSelect: (email: string) => void }) {
  const [clients, setClients] = useState<Client[] | null | undefined>(undefined);
  const [q, setQ] = useState("");

  useEffect(() => {
    let alive = true;
    loadClients().then((c) => alive && setClients(c));
    return () => {
      alive = false;
    };
  }, []);

  const shown = useMemo(() => {
    const n = q.trim().toLowerCase();
    return (clients ?? []).filter((c) => !n || c.email.includes(n) || c.full_name?.toLowerCase().includes(n));
  }, [clients, q]);

  if (clients === undefined) return <p className="text-sm text-stone-dim">Loading clients…</p>;
  if (clients === null) return <p className="text-sm text-red-400">Couldn&apos;t load clients. Refresh the page to try again.</p>;

  const current = clients.find((c) => c.email === selected);
  if (current) {
    return (
      <div>
        <button type="button" onClick={() => onSelect("")} className="mb-6 text-xs uppercase tracking-wide text-stone hover:text-ivory">
          ← All clients
        </button>
        <ClientHub client={current} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or email" className={`${inputClass} mb-4 w-full`} />
      <p className="mb-4 text-xs text-stone-dim">
        {shown.length} of {clients.length} accounts
      </p>
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
              <span className="hidden text-xs text-stone-dim sm:block">
                {c.confirmed ? `Joined ${fmtDate(c.created_at)}` : "Email not confirmed"}
              </span>
              <span aria-hidden className="text-stone">→</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
