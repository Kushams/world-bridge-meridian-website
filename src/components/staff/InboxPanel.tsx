"use client";

import { type AttentionData, type Client } from "@/lib/staff";

const ago = (iso: string) => {
  const m = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (m < 1) return "now";
  if (m < 60) return `${m} min`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} h`;
  return `${Math.round(h / 24)} d`;
};

/** Inbox: every client conversation, newest first. Unread (waiting for a reply) ones are marked. Tapping opens the chat. */
export function InboxPanel({ data, clients, onOpenChat }: { data: AttentionData | null | undefined; clients: Client[]; onOpenChat: (email: string) => void }) {
  if (data === undefined) return <p className="text-sm text-stone-dim">Loading conversations…</p>;
  if (data === null) return <p className="text-sm text-red-400">Couldn&apos;t load the inbox. Refresh the page to try again.</p>;
  if (!data.threads.length) {
    return (
      <div className="rounded-[24px] border hairline bg-charcoal/40 px-6 py-10 text-center">
        <p className="font-display text-2xl text-ivory">No conversations yet</p>
        <p className="mt-2 text-sm text-stone">When a client messages you, the chat shows up here.</p>
      </div>
    );
  }
  const waiting = new Set(data.waiting.map((w) => w.email));
  const nameOf = (email: string) => clients.find((c) => c.email === email)?.full_name || email;
  const visible = data.threads.filter((t) => t.sender !== "system" || waiting.has(t.email) || t.kind === "message");

  return (
    <div>
      <h2 className="mb-3 font-display text-xl text-ivory">Messages</h2>
      <ul className="divide-y divide-line rounded-[24px] border hairline bg-charcoal/40">
        {visible.map((t) => {
          const unread = waiting.has(t.email);
          const name = nameOf(t.email);
          return (
            <li key={t.email}>
              <button type="button" onClick={() => onOpenChat(t.email)} className="flex min-h-[72px] w-full items-center gap-3 px-4 py-3 text-left transition active:bg-ivory/5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ivory text-sm font-semibold text-ink">{name.trim().slice(0, 2).toUpperCase()}</span>
                <span className="min-w-0 flex-1">
                  <span className={`block truncate text-sm ${unread ? "font-semibold text-ivory" : "text-ivory"}`}>{name}</span>
                  <span className={`block truncate text-xs ${unread ? "text-ivory" : "text-stone-dim"}`}>
                    {t.sender === "staff" ? "You: " : ""}
                    {t.body.slice(0, 90)}
                  </span>
                </span>
                <span className="flex shrink-0 flex-col items-end gap-1">
                  <span className="text-xs text-stone-dim">{ago(t.at)}</span>
                  {unread ? <span aria-label="Waiting for your reply" className="h-2.5 w-2.5 rounded-full bg-gold" /> : null}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
