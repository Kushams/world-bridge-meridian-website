"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/supabase/AuthProvider";
import { AuthPanel } from "@/components/account/AuthPanel";
import { loadMe, personalLink, type StaffMember } from "@/lib/staff";
import { RequestsPanel } from "./RequestsPanel";
import { ClientsPanel } from "./ClientsPanel";
import { TeamPanel, CopyLink } from "./TeamPanel";

type Tab = "clients" | "requests" | "team";
const TABS: { key: Tab; label: string; admin?: boolean }[] = [
  { key: "clients", label: "Clients" },
  { key: "requests", label: "All requests" },
  { key: "team", label: "Team", admin: true },
];

/** Staff-only tools. Access is enforced in the database (supabase/staff.sql), this only hides the UI. */
export function StaffArea() {
  const { user, loading, signOut } = useAuth();
  const [me, setMe] = useState<StaffMember | null | undefined>(undefined);
  const [tab, setTab] = useState<Tab>("clients");
  const [clientEmail, setClientEmail] = useState("");

  useEffect(() => {
    if (!user) return;
    let alive = true;
    loadMe().then((m) => alive && setMe(m));
    return () => {
      alive = false;
    };
  }, [user]);

  useEffect(() => {
    const h = window.location.hash.slice(1);
    const t = setTimeout(() => (h === "clients" || h === "requests" || h === "team") && setTab(h), 0);
    return () => clearTimeout(t);
  }, []);

  function go(next: Tab, email?: string) {
    if (email !== undefined) setClientEmail(email);
    setTab(next);
    history.replaceState(null, "", `#${next}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (loading) return <p className="text-sm text-stone-dim">Loading…</p>;
  if (!user) {
    return (
      <div className="mx-auto max-w-xl">
        <p className="eyebrow mb-2">Staff</p>
        <h1 className="mb-6 font-display text-3xl text-ivory">Sign in to the staff page</h1>
        <AuthPanel />
      </div>
    );
  }
  if (me === undefined) return <p className="text-sm text-stone-dim">Checking access…</p>;
  if (!me) {
    return (
      <div className="mx-auto max-w-xl text-center">
        <h1 className="font-display text-3xl text-ivory">This page is for World Bridge Meridian staff</h1>
        <p className="mt-4 text-sm text-stone">
          You&apos;re signed in as {user.email}, which isn&apos;t on the staff list.
        </p>
        <button type="button" onClick={() => signOut()} className="mt-6 text-xs text-stone underline hover:text-ivory">
          Sign out
        </button>
      </div>
    );
  }

  const admin = me.role === "admin";

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-2">Staff</p>
          <h1 className="font-display text-3xl text-ivory md:text-4xl">World Bridge Meridian staff page</h1>
          <p className="mt-2 text-sm text-stone">
            Signed in as {user.email} · {admin ? "Admin: you see every client" : "You see the clients assigned to you"}
          </p>
          {me.link_code ? (
            <p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-stone">
              Your personal link: <span className="text-ivory">{personalLink(me.link_code)}</span>
              <CopyLink text={personalLink(me.link_code)} />
            </p>
          ) : null}
        </div>
        <button type="button" onClick={() => signOut()} className="text-xs text-stone underline hover:text-ivory">
          Sign out
        </button>
      </div>

      <div role="tablist" aria-label="Staff tools" className="mt-8 inline-flex flex-wrap gap-1 rounded-full border hairline p-1">
        {TABS.filter((t) => admin || !t.admin).map((t) => (
          <button
            key={t.key}
            role="tab"
            type="button"
            aria-selected={tab === t.key}
            onClick={() => go(t.key)}
            className={`rounded-full px-5 py-2 text-xs font-semibold uppercase tracking-wide transition-colors ${
              tab === t.key ? "bg-ivory text-ink" : "text-stone hover:text-ivory"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-10">
        {tab === "requests" ? (
          <RequestsPanel onOpenClient={(email) => go("clients", email)} />
        ) : tab === "team" && admin ? (
          <TeamPanel />
        ) : (
          <ClientsPanel admin={admin} selected={clientEmail} onSelect={(email) => go("clients", email)} />
        )}
      </div>
    </div>
  );
}
