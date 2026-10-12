"use client";

import { useEffect, useMemo, useState } from "react";
import { FORM_LABEL, STATUSES, fmtDate, loadRequests, setStatus, type Request, type Status } from "@/lib/staff";

export const inputClass =
  "rounded-control border border-line bg-transparent px-4 py-2.5 text-sm text-ivory placeholder:text-stone-dim outline-none focus:border-gold";

const SKIP_KEYS = new Set(["token", "website", "acceptedTerms"]);

function Details({ r }: { r: Request }) {
  const rows = Object.entries(r.payload ?? {}).filter(([k, v]) => !SKIP_KEYS.has(k) && v !== null && v !== "" && v !== undefined);
  return (
    <div className="mt-4 space-y-3 border-t hairline pt-4 text-sm">
      {r.message ? <p className="whitespace-pre-wrap text-stone">{r.message}</p> : null}
      {rows.length ? (
        <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-[180px_1fr]">
          {rows.map(([k, v]) => (
            <div key={k} className="contents">
              <dt className="text-xs uppercase tracking-wide text-stone-dim">{k.replace(/[_-]+/g, " ")}</dt>
              <dd className="break-words text-ivory">{typeof v === "object" ? JSON.stringify(v) : String(v)}</dd>
            </div>
          ))}
        </dl>
      ) : null}
    </div>
  );
}

export function Row({ r, onSaved, onOpenClient }: { r: Request; onSaved: (s: Status) => void; onOpenClient?: (email: string) => void }) {
  const [draft, setDraft] = useState<Status>(r.status);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function save() {
    setBusy(true);
    setMsg("");
    const err = await setStatus(r.id, draft);
    setBusy(false);
    if (err) return setMsg(`Not saved: ${err}`);
    onSaved(draft);
    setMsg("Saved. The client has been emailed.");
  }

  return (
    <article className="rounded-card border hairline p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wide text-gold">{FORM_LABEL[r.form_type] ?? r.form_type}</p>
          <h3 className="mt-1 font-display text-lg text-ivory">{r.name || "No name"}</h3>
          <p className="text-xs text-stone-dim">
            {r.email} · sent {fmtDate(r.submitted_at)}
            {r.subject ? ` · ${r.subject}` : ""}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="sr-only" htmlFor={`st-${r.id}`}>Stage</label>
          <select id={`st-${r.id}`} value={draft} onChange={(e) => setDraft(e.target.value as Status)} className={`${inputClass} bg-ink`}>
            {STATUSES.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={busy || draft === r.status}
            onClick={save}
            className="rounded-full bg-ivory px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-ink disabled:opacity-40"
          >
            {busy ? "Saving…" : "Save stage"}
          </button>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-4 text-xs">
        <button type="button" onClick={() => setOpen((o) => !o)} className="text-stone underline hover:text-ivory">
          {open ? "Hide details" : "Show details"}
        </button>
        {r.email && onOpenClient ? (
          <button type="button" onClick={() => onOpenClient(r.email!.toLowerCase())} className="text-stone underline hover:text-ivory">
            Open client page
          </button>
        ) : null}
        {r.email ? (
          <a href={`mailto:${r.email}`} className="text-stone underline hover:text-ivory">
            Email client
          </a>
        ) : null}
      </div>
      {msg ? <p className={`mt-3 text-sm ${msg.startsWith("Not") ? "text-red-400" : "text-gold"}`}>{msg}</p> : null}
      {open ? <Details r={r} /> : null}
    </article>
  );
}

/** Every request from the website forms; change a stage and the client is emailed automatically. */
export function RequestsPanel({ onOpenClient }: { onOpenClient: (email: string) => void }) {
  const [list, setList] = useState<Request[] | null | undefined>(undefined);
  const [q, setQ] = useState("");
  const [stage, setStage] = useState<Status | "open" | "all">("open");

  useEffect(() => {
    let alive = true;
    loadRequests().then((r) => alive && setList(r));
    return () => {
      alive = false;
    };
  }, []);

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return (list ?? []).filter(
      (r) =>
        (stage === "all" || (stage === "open" ? r.status !== "closed" : r.status === stage)) &&
        (!needle || [r.name, r.email, r.subject, r.message].some((v) => v?.toLowerCase().includes(needle))),
    );
  }, [list, q, stage]);

  if (list === undefined) return <p className="text-sm text-stone-dim">Loading requests…</p>;
  if (list === null) return <p className="text-sm text-red-400">Couldn&apos;t load requests. Refresh the page to try again.</p>;

  return (
    <div className="max-w-4xl">
      <div className="mb-6 flex flex-wrap gap-3">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, email or message" className={`${inputClass} min-w-64 flex-1`} />
        <select value={stage} onChange={(e) => setStage(e.target.value as typeof stage)} className={`${inputClass} bg-ink`} aria-label="Filter by stage">
          <option value="open">All open (not closed)</option>
          <option value="all">Everything</option>
          {STATUSES.map((s) => (
            <option key={s.key} value={s.key}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
      <p className="mb-4 text-xs text-stone-dim">
        {shown.length} of {list.length} requests. Newsletter sign-ups are not listed.
      </p>
      <div className="space-y-4">
        {shown.map((r) => (
          <Row
            key={r.id}
            r={r}
            onOpenClient={onOpenClient}
            onSaved={(s) => setList((l) => l?.map((x) => (x.id === r.id ? { ...x, status: s } : x)))}
          />
        ))}
      </div>
    </div>
  );
}
