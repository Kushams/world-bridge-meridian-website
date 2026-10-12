"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useAuth } from "@/lib/supabase/AuthProvider";
import { AuthPanel } from "@/components/account/AuthPanel";
import { loadMe, personalLink, pingPresence, type StaffMember } from "@/lib/staff";
import { RequestsPanel } from "./RequestsPanel";
import { ClientsPanel } from "./ClientsPanel";
import { PriceBookPanel } from "./PriceBookPanel";
import { TeamPanel, StaffTeamList, CopyLink } from "./TeamPanel";

type Tab = "clients" | "requests" | "team";

const icon = "h-6 w-6";
const ICONS: Record<Tab, ReactNode> = {
  clients: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={icon} aria-hidden>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3 19c.6-3.2 3-5 6-5s5.4 1.8 6 5" />
      <path d="M16.5 5.2a3 3 0 0 1 0 5.6M18 14.3c1.7.6 2.7 2.2 3 4.7" />
    </svg>
  ),
  requests: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={icon} aria-hidden>
      <path d="M4 5h16v11H9l-5 4z" />
      <path d="M8 9.5h8M8 12.5h5" />
    </svg>
  ),
  team: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={icon} aria-hidden>
      <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  ),
};

const TABS: { key: Tab; label: string }[] = [
  { key: "clients", label: "Clients" },
  { key: "requests", label: "Requests" },
  { key: "team", label: "Team" },
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

  // Let admins see that this staff member is online: ping now and every minute while the page is visible.
  const isStaff = Boolean(me);
  useEffect(() => {
    if (!isStaff) return;
    const ping = () => {
      if (document.visibilityState === "visible") pingPresence().catch(() => {});
    };
    ping();
    const timer = window.setInterval(ping, 60000);
    document.addEventListener("visibilitychange", ping);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", ping);
    };
  }, [isStaff]);

  useEffect(() => {
    const h = window.location.hash.slice(1);
    const client = new URLSearchParams(window.location.search).get("client");
    const t = setTimeout(() => {
      if (client) {
        setClientEmail(client.toLowerCase());
        setTab("clients");
      } else if (h === "clients" || h === "requests" || h === "team") setTab(h);
    }, 0);
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
  const initials = (me.name || user.email || "?").trim().slice(0, 2).toUpperCase();
  const tabs = TABS;

  return (
    <div className="mx-auto max-w-3xl pb-28">
      <header className="flex items-center gap-4 rounded-[28px] border hairline bg-charcoal px-5 py-4 shadow-sm">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-ivory text-sm font-semibold text-ink">{initials}</span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-xl text-ivory">{me.name || user.email}</p>
          <p className="truncate text-xs text-stone">
            {admin ? "Admin · you see every client" : "Staff"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => signOut()}
          className="flex h-11 shrink-0 items-center rounded-full border hairline px-4 text-xs font-semibold uppercase tracking-wide text-stone active:scale-95 hover:text-ivory"
        >
          Sign out
        </button>
      </header>

      {me.link_code ? (
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl border hairline px-5 py-3 text-xs text-stone">
          <span>Your client link</span>
          <span className="min-w-0 truncate text-ivory">{personalLink(me.link_code)}</span>
          <CopyLink text={personalLink(me.link_code)} />
        </div>
      ) : null}

      <div className="mt-6">
        {tab === "requests" ? (
          <RequestsPanel onOpenClient={(email) => go("clients", email)} />
        ) : tab === "team" ? (
          admin ? (
            <>
              <TeamPanel />
              <PriceBookPanel />
            </>
          ) : (
            <StaffTeamList />
          )
        ) : (
          <ClientsPanel admin={admin} selected={clientEmail} onSelect={(email) => go("clients", email)} />
        )}
      </div>

      <nav
        role="tablist"
        aria-label="Staff tools"
        className="fixed inset-x-0 bottom-0 z-40 border-t hairline bg-ink/95 pb-[env(safe-area-inset-bottom)] backdrop-blur"
      >
        <div className="mx-auto flex max-w-3xl">
          {tabs.map((t) => (
            <button
              key={t.key}
              role="tab"
              type="button"
              aria-selected={tab === t.key}
              onClick={() => go(t.key)}
              className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-semibold uppercase tracking-wide transition-colors active:scale-95 ${
                tab === t.key ? "text-gold" : "text-stone hover:text-ivory"
              }`}
            >
              <span className={`flex h-8 w-14 items-center justify-center rounded-full transition-colors ${tab === t.key ? "bg-gold/15" : ""}`}>{ICONS[t.key]}</span>
              {t.label}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
