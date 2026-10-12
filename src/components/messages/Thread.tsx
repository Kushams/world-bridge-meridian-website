"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { loadThread, type ThreadMessage } from "@/lib/messages";

const ICONS: Record<string, string> = {
  document: "📄",
  sign: "✍️",
  return: "📝",
  invoice: "🧾",
  invoice_pdf: "🧾",
  upload: "📎",
  signed: "✍️",
  returned: "📝",
  status: "📍",
};

const when = (iso: string) =>
  new Date(iso).toLocaleString(undefined, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

/**
 * A client's conversation with their coordinator. Activity lines (documents,
 * invoices, uploads, stage changes) sit between the messages; `onOpen` gets the
 * line's link (e.g. "#documents") so each side can jump to the right section.
 */
export function Thread({
  clientEmail,
  viewer,
  onSend,
  onOpen,
  placeholder,
}: {
  clientEmail: string;
  viewer: "client" | "staff";
  onSend: (body: string) => Promise<string | null>;
  onOpen?: (m: ThreadMessage) => void;
  placeholder: string;
}) {
  const [messages, setMessages] = useState<ThreadMessage[] | null>(null);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const end = useRef<HTMLDivElement>(null);
  const count = useRef(0);

  const refresh = useCallback(async () => {
    const m = await loadThread(clientEmail);
    if (m) setMessages(m);
  }, [clientEmail]);

  useEffect(() => {
    const first = setTimeout(refresh, 0);
    const poll = setInterval(() => document.visibilityState === "visible" && refresh(), 15000);
    return () => {
      clearTimeout(first);
      clearInterval(poll);
    };
  }, [refresh]);

  useEffect(() => {
    if (messages && messages.length !== count.current) {
      count.current = messages.length;
      end.current?.scrollIntoView({ block: "nearest" });
    }
  }, [messages]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const body = draft.trim();
    if (!body || sending) return;
    setSending(true);
    setError("");
    const err = await onSend(body);
    setSending(false);
    if (err) {
      setError("Your message wasn't sent. Please try again.");
      return;
    }
    setDraft("");
    refresh();
  }

  return (
    <div className="rounded-card border hairline">
      <div className="max-h-[28rem] min-h-[12rem] space-y-3 overflow-y-auto p-4 md:p-5" aria-live="polite">
        {messages === null ? (
          <p className="text-sm text-stone">Loading…</p>
        ) : messages.length === 0 ? (
          <p className="text-sm text-stone">
            {viewer === "client"
              ? "No messages yet. Ask us anything — documents, invoices and updates we send will appear here too."
              : "No messages yet. Documents, invoices and stage changes you send will appear here as well."}
          </p>
        ) : (
          messages.map((m) =>
            m.sender === "system" ? (
              <div key={m.id} className="flex justify-center">
                <button
                  type="button"
                  disabled={!m.link || !onOpen}
                  onClick={() => onOpen?.(m)}
                  className="max-w-[90%] rounded-full border border-line px-4 py-1.5 text-center text-xs text-stone enabled:hover:border-gold enabled:hover:text-ivory"
                >
                  <span aria-hidden>{ICONS[m.kind] ?? "•"} </span>
                  {m.body}
                  <span className="ml-2 text-stone-dim">{when(m.created_at)}</span>
                  {m.link && onOpen ? <span className="ml-2 text-gold">Open →</span> : null}
                </button>
              </div>
            ) : (
              <div key={m.id} className={`flex ${m.sender === viewer ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                    m.sender === viewer ? "bg-ivory text-ink" : "border border-line text-ivory"
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{m.body}</p>
                  <p className={`mt-1 text-[0.7rem] ${m.sender === viewer ? "text-ink/60" : "text-stone-dim"}`}>
                    {m.sender === viewer ? "You" : m.author_name || (m.sender === "staff" ? "World Bridge Meridian" : m.author_email)} ·{" "}
                    {when(m.created_at)}
                  </p>
                </div>
              </div>
            ),
          )
        )}
        <div ref={end} />
      </div>
      <form onSubmit={send} className="flex items-end gap-2 border-t hairline p-3">
        <label className="sr-only" htmlFor={`msg-${viewer}`}>
          Message
        </label>
        <textarea
          id={`msg-${viewer}`}
          rows={2}
          maxLength={4000}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) send(e);
          }}
          placeholder={placeholder}
          className="min-w-0 flex-1 resize-none rounded-2xl border border-line bg-transparent px-4 py-2.5 text-sm text-ivory placeholder:text-stone-dim focus:border-gold focus:outline-none"
        />
        <button
          type="submit"
          disabled={!draft.trim() || sending}
          className="rounded-full bg-ivory px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-ink disabled:opacity-40"
        >
          {sending ? "Sending…" : "Send"}
        </button>
      </form>
      {error ? (
        <p role="alert" className="px-4 pb-3 text-xs text-red-400">
          {error}
        </p>
      ) : null}
    </div>
  );
}
