"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/lib/supabase/AuthProvider";
import { loadThread, type ThreadMessage } from "@/lib/messages";
import { addNote, loadNotes, removeNote, usd, type ClientNote, type Request, type Signature, type StaffInvoice } from "@/lib/staff";
import { inputClass } from "./RequestsPanel";

interface Event {
  at: string;
  icon: string;
  title: string;
  detail?: string;
}

const when = (iso: string) => new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

const KIND_ICON: Record<string, string> = { document: "📄", sign: "✍️", return: "📎", invoice: "💳", invoice_pdf: "💳", upload: "⬆️", signed: "✍️", returned: "📎", status: "🏷️" };

/**
 * Private notes on a client (staff only, never shown to the client) and a timeline of everything that happened:
 * messages, documents, invoices and payments, signatures, requests, sign-ins and the notes themselves.
 */
export function NotesTimeline({
  email,
  admin,
  invoices,
  requests,
  signatures,
  signIns,
}: {
  email: string;
  admin: boolean;
  invoices: StaffInvoice[];
  requests: Request[];
  signatures: Signature[];
  signIns: string[];
}) {
  const { user } = useAuth();
  const me = user?.email?.toLowerCase() ?? "";
  const [notes, setNotes] = useState<ClientNote[]>([]);
  const [thread, setThread] = useState<ThreadMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [all, setAll] = useState(false);

  const load = useCallback(async () => {
    const [n, t] = await Promise.all([loadNotes(email), loadThread(email)]);
    setNotes(n);
    setThread(t ?? []);
  }, [email]);

  useEffect(() => {
    const t = setTimeout(load, 0);
    return () => clearTimeout(t);
  }, [load]);

  async function save() {
    if (!draft.trim()) return;
    setBusy(true);
    setError("");
    const err = await addNote(email, draft.trim());
    setBusy(false);
    if (err) return setError(`Not saved: ${err}`);
    setDraft("");
    load();
  }

  async function remove(n: ClientNote) {
    if (!window.confirm("Remove this note?")) return;
    const err = await removeNote(n.id);
    if (err) return setError(`Not removed: ${err}`);
    load();
  }

  const events: Event[] = [
    ...notes.map((n) => ({ at: n.created_at, icon: "📝", title: `Note by ${n.author_name || n.author_email}`, detail: n.body })),
    ...thread.map((m) =>
      m.sender === "system"
        ? { at: m.created_at, icon: KIND_ICON[m.kind] ?? "•", title: m.body }
        : { at: m.created_at, icon: "💬", title: m.sender === "client" ? "Client wrote" : `${m.author_name || "Staff"} replied`, detail: m.audio_path ? "Voice note" : m.body },
    ),
    ...invoices.flatMap((i) => [
      { at: i.created_at, icon: "🧾", title: `Invoice ${i.reference} created (${usd(i.amount_usd)})` },
      ...(i.paid_at ? [{ at: i.paid_at, icon: "✅", title: `Invoice ${i.reference} paid (${usd(i.amount_usd)}${i.paid_via ? `, ${i.paid_via}` : ""})` }] : []),
    ]),
    ...requests.map((r) => ({ at: r.submitted_at, icon: "🧭", title: `Request: ${r.subject || r.form_type}`, detail: `Stage now: ${r.status.replaceAll("_", " ")}` })),
    ...signatures.map((s) => ({ at: s.signed_at, icon: "✍️", title: `Signed ${s.document_title || "a document"}`, detail: s.signer_name })),
    ...signIns.map((t) => ({ at: t, icon: "🔑", title: "Signed in" })),
  ].sort((a, b) => b.at.localeCompare(a.at));

  const shown = all ? events : events.slice(0, 12);

  return (
    <div>
      <p className="text-xs text-stone-dim">The timeline below combines notes, messages, documents, invoices, payments, signatures, requests and sign-ins.</p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={3}
          maxLength={4000}
          placeholder="Add a private note: preferences, what was agreed on a call, anything the next person should know…"
          aria-label="Private note"
          className={`${inputClass} w-full resize-y sm:flex-1`}
        />
        <button type="button" disabled={busy || !draft.trim()} onClick={save} className="min-h-11 rounded-full bg-ivory px-6 text-xs font-semibold uppercase tracking-wide text-ink disabled:opacity-40">
          {busy ? "Saving…" : "Add note"}
        </button>
      </div>
      {error ? <p role="alert" className="mt-2 text-sm text-red-400">{error}</p> : null}

      {notes.length ? (
        <ul className="mt-4 space-y-2">
          {notes.slice(0, 5).map((n) => (
            <li key={n.id} className="rounded-2xl border border-gold/40 bg-gold/5 p-3 text-sm">
              <p className="whitespace-pre-wrap break-words text-ivory">{n.body}</p>
              <p className="mt-1 flex items-center justify-between gap-2 text-[11px] text-stone-dim">
                <span>{n.author_name || n.author_email} · {when(n.created_at)}</span>
                {n.author_email.toLowerCase() === me || admin ? (
                  <button type="button" onClick={() => remove(n)} className="text-stone hover:text-red-400">Remove</button>
                ) : null}
              </p>
            </li>
          ))}
        </ul>
      ) : null}

      <h4 className="mb-2 mt-6 text-sm font-semibold text-ivory">Timeline</h4>
      {events.length ? (
        <>
          <ol className="space-y-3 border-l border-line pl-4">
            {shown.map((e, i) => (
              <li key={`${e.at}-${i}`} className="relative text-sm">
                <span aria-hidden className="absolute -left-[1.55rem] top-0 flex h-5 w-5 items-center justify-center rounded-full bg-ink text-xs">{e.icon}</span>
                <p className="text-ivory">{e.title}</p>
                {e.detail ? <p className="line-clamp-2 text-xs text-stone-dim">{e.detail}</p> : null}
                <p className="text-[11px] text-stone-dim">{when(e.at)}</p>
              </li>
            ))}
          </ol>
          {events.length > 12 ? (
            <button type="button" onClick={() => setAll((v) => !v)} className="mt-3 text-xs text-stone underline underline-offset-4 hover:text-ivory">
              {all ? "Show fewer" : `Show all ${events.length}`}
            </button>
          ) : null}
        </>
      ) : (
        <p className="text-sm text-stone-dim">Nothing yet.</p>
      )}
    </div>
  );
}
